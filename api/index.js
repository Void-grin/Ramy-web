import crypto from "crypto";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import Papa from "papaparse";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

dotenv.config({ path: path.resolve(ROOT_DIR, ".env") });
dotenv.config();

const DEFAULT_DATA_PATH = path.resolve(ROOT_DIR, "data", "augmented", "Ramy_data_augmented_target_1500.csv");
const SOCIAL_CONFIG_PATH = path.resolve(ROOT_DIR, "config", "social_connectors.json");
const SOCIAL_STREAM_PATH = process.env.VERCEL
  ? "/tmp/social_stream_predictions.csv"
  : path.resolve(ROOT_DIR, "data", "processed", "social_stream_predictions.csv");
const SOCIAL_PLATFORMS = ["facebook", "instagram", "tiktok"];
const TARGET_CLASSES = ["positive", "negative", "neutral", "improvement", "question"];
const DEFAULT_CORS_ORIGINS = [
  "http://127.0.0.1:8000",
  "http://localhost:8000",
  "http://127.0.0.1:8010",
  "http://localhost:8010",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "https://ramy-web-one.vercel.app",
];

const CATALOG = {
  "Boisson aux fruits": ["Classique", "EXTRA", "Frutty", "carton", "canette", "kids"],
  "Boisson gazÃ©ifiÃ©e": ["Water Fruits", "Boisson gazeifiÃ©e canette", "Boisson gazeifiÃ©e verre"],
  "Boisson au lait": ["milky : 1l", "milky : 20cl", "milky : 300ml", "milky : 25cl"],
  "Produits laitiers": ["lais", "yupty", "raib et lben", "cherebt", "ramy up duo"],
};

const QUESTION_TOKENS = new Set([
  "wach", "wesh", "wash", "win", "where", "ou", "pourquoi", "why", "comment", "how",
  "when", "what", "quoi", "fin", "kayen", "kayn", "Ø¹Ù„Ø§Ù‡", "ÙƒÙŠÙ", "ÙÙŠÙ†", "ÙˆÙŠÙ†", "Ù…ØªÙ‰", "ÙˆØ´",
]);

const NEGATION_TOKENS = new Set([
  "machi", "moch", "Ù…Ø´", "Ù…Ø§Ø´ÙŠ", "Ù…ÙˆØ´", "pas", "not", "jamais",
]);

const POSITIVE_TOKENS = new Set([
  "bnin", "bnina", "bninaa", "bon", "good", "excellent", "super", "top", "Ù…Ù„ÙŠØ­", "Ø¨Ù†ÙŠÙ†", "Ù„Ø°ÙŠØ°",
]);

const NEGATIVE_TOKENS = new Set([
  "khayeb", "khayba", "mauvais", "bad", "ghali", "cher", "trop", "Ø±Ø¯ÙŠØ¡", "Ø³ÙŠØ¡", "Ø®Ø§ÙŠØ¨", "ØºØ§Ù„ÙŠ",
]);

const reviewCache = {
  path: "",
  mtimeMs: 0,
  rows: [],
};

const app = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

function getAllowedCorsOrigins() {
  const raw = String(process.env.CORS_ALLOW_ORIGINS || "").trim();
  if (!raw) return [...DEFAULT_CORS_ORIGINS];
  return [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))];
}

const allowedCorsOrigins = getAllowedCorsOrigins();
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

// Normalize URL in case Vercel rewrites stripped /api prefix
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith("/api") && req.url !== "/") {
    req.url = "/api" + req.url;
  }
  next();
});

function resolveDataPath() {
  const configured = String(process.env.REVIEW_DATA_PATH || "").trim();
  if (configured) {
    if (path.isAbsolute(configured)) return configured;
    return path.resolve(ROOT_DIR, configured);
  }
  const candidates = [
    DEFAULT_DATA_PATH,
    path.resolve(process.cwd(), "data", "augmented", "Ramy_data_augmented_target_1500.csv"),
    path.resolve(__dirname, "..", "data", "augmented", "Ramy_data_augmented_target_1500.csv"),
    path.resolve(__dirname, "data", "augmented", "Ramy_data_augmented_target_1500.csv"),
  ];
  for (const candidate of candidates) {
    if (fsSync.existsSync(candidate)) return candidate;
  }
  return DEFAULT_DATA_PATH;
}

function toBool(value, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return ["1", "true", "yes", "y", "on"].includes(value.trim().toLowerCase());
  return defaultValue;
}

function parsePort(value, fallback = 8000) {
  const raw = String(value ?? "").trim().replace(/^['\"]|['\"]$/g, "");
  const numeric = Number.parseInt(raw, 10);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 65535) {
    return numeric;
  }
  return fallback;
}

const GENERIC_LLM_FAILURE_DETAIL = "Prediction service is temporarily busy. Please try again shortly.";
let lastLlmRequestAtMs = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms || 0))));
}

function readEnvInt(name, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const raw = String(process.env[name] ?? "").trim().replace(/^['\"]|['\"]$/g, "");
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20_000) {
  const safeTimeoutMs = Math.max(1_000, Number(timeoutMs || 20_000));
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), safeTimeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error(`Provider request timeout after ${safeTimeoutMs} ms`);
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseRetryAfterHeader(value) {
  const raw = String(value || "").trim();
  if (!raw) return 0;

  const numericSeconds = Number.parseFloat(raw);
  if (Number.isFinite(numericSeconds) && numericSeconds >= 0) {
    return Math.round(numericSeconds * 1000);
  }

  const retryAt = Date.parse(raw);
  if (!Number.isNaN(retryAt)) {
    return Math.max(0, retryAt - Date.now());
  }

  return 0;
}

function parseRetryDelayFromMessage(message) {
  const text = String(message || "");
  const secondsMatch = text.match(/retry\s+in\s+([0-9]+(?:\.[0-9]+)?)s/i);
  if (secondsMatch) {
    const seconds = Number.parseFloat(secondsMatch[1]);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.round(seconds * 1000);
    }
  }
  return 0;
}

function attachProviderErrorMetadata(error, providerId, retryAfterMs = 0) {
  error.isLlmProviderFailure = true;
  error.providerId = providerId;
  error.publicDetail = GENERIC_LLM_FAILURE_DETAIL;
  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
    error.retryAfterMs = retryAfterMs;
  }
  return error;
}

function getPublicApiError(error, fallbackStatus = 503, fallbackDetail = "Service temporarily unavailable.") {
  const status = Number(error?.publicStatus || error?.status || fallbackStatus);
  const detail = String(error?.publicDetail || fallbackDetail);
  return {
    status: Number.isFinite(status) ? Math.max(400, Math.min(599, status)) : fallbackStatus,
    detail,
  };
}

async function applyLlmThrottleDelay() {
  const minIntervalMs = readEnvInt("LLM_MIN_REQUEST_INTERVAL_MS", 300, 0, 60_000);
  if (minIntervalMs <= 0) return;

  const waitMs = Math.max(0, (lastLlmRequestAtMs + minIntervalMs) - Date.now());
  if (waitMs > 0) {
    await sleep(waitMs);
  }
  lastLlmRequestAtMs = Date.now();
}

function extractTextTokens(text) {
  return String(text || "").toLowerCase().match(/[A-Za-z0-9_]+|[\u0600-\u06FF]+/g) || [];
}

function normalizeScoreMap(predictedClass, confidence, allScores = null) {
  const scores = Object.fromEntries(TARGET_CLASSES.map((cls) => [cls, 0]));

  if (allScores && typeof allScores === "object") {
    for (const [key, value] of Object.entries(allScores)) {
      const normalizedKey = String(key || "").toLowerCase();
      if (normalizedKey in scores) {
        const numeric = Number(value);
        scores[normalizedKey] = Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
      }
    }
  }

  let total = Object.values(scores).reduce((acc, value) => acc + value, 0);
  let pred = String(predictedClass || "").toLowerCase();
  const conf = Math.max(0, Math.min(Number(confidence || 0), 1));

  if (total <= 0) {
    if (!(pred in scores)) pred = "neutral";
    const remainder = Math.max(0, 1 - conf);
    const spread = remainder / (TARGET_CLASSES.length - 1);
    for (const cls of TARGET_CLASSES) {
      scores[cls] = cls === pred ? conf : spread;
    }
    total = Object.values(scores).reduce((acc, value) => acc + value, 0);
  }

  if (total > 0) {
    for (const cls of TARGET_CLASSES) {
      scores[cls] = scores[cls] / total;
    }
  }

  return scores;
}

function boostClass(scores, target, floor) {
  const safeFloor = Math.max(0, Math.min(Number(floor || 0), 1));
  const current = Number(scores[target] || 0);
  if (current >= safeFloor) {
    const total = Object.values(scores).reduce((acc, value) => acc + Number(value || 0), 0);
    if (total > 0) {
      const normalized = {};
      for (const [key, value] of Object.entries(scores)) {
        normalized[key] = Number(value || 0) / total;
      }
      return normalized;
    }
    return scores;
  }

  const remain = Math.max(0, 1 - safeFloor);
  const otherTotal = Math.max(1e-12, Object.entries(scores)
    .filter(([key]) => key !== target)
    .reduce((acc, [, value]) => acc + Number(value || 0), 0));

  const boosted = {};
  for (const [key, value] of Object.entries(scores)) {
    if (key === target) {
      boosted[key] = safeFloor;
    } else {
      boosted[key] = remain * (Number(value || 0) / otherTotal);
    }
  }

  const total = Object.values(boosted).reduce((acc, value) => acc + Number(value || 0), 0);
  if (total > 0) {
    for (const key of Object.keys(boosted)) {
      boosted[key] = boosted[key] / total;
    }
  }

  return boosted;
}

function applyRuleCalibration(text, predictedClass, confidence, allScores = null) {
  const tokens = extractTextTokens(text);
  const tokenSet = new Set(tokens);
  const raw = String(text || "").toLowerCase();

  const hasQuestionMark = raw.includes("?") || raw.includes("ØŸ");
  const hasQuestionToken = tokens.some((tok) => QUESTION_TOKENS.has(tok));
  const explicitQuestion = hasQuestionMark || hasQuestionToken;

  const explicitNegative = tokens.some((tok) => NEGATIVE_TOKENS.has(tok));

  let negatedPositive = false;
  for (let index = 0; index < tokens.length; index += 1) {
    const tok = tokens[index];
    if (!NEGATION_TOKENS.has(tok)) continue;
    const windowTokens = tokens.slice(index + 1, index + 4);
    if (windowTokens.some((candidate) => POSITIVE_TOKENS.has(candidate))) {
      negatedPositive = true;
      break;
    }
  }

  let scores = normalizeScoreMap(predictedClass, confidence, allScores);
  const appliedRules = [];

  if (negatedPositive) {
    scores = boostClass(scores, "negative", 0.8);
    appliedRules.push("negation_over_positive_pattern");
  } else if (explicitNegative) {
    scores = boostClass(scores, "negative", 0.7);
    appliedRules.push("explicit_negative_lexicon");
  } else if (explicitQuestion) {
    scores = boostClass(scores, "question", 0.7);
    appliedRules.push("question_cue");
  }

  const calibratedClass = Object.keys(scores).reduce((best, cls) => {
    if (!best) return cls;
    return Number(scores[cls] || 0) > Number(scores[best] || 0) ? cls : best;
  }, "neutral");

  return {
    predictedClass: calibratedClass,
    confidence: Number(scores[calibratedClass] || 0),
    allScores: scores,
    calibrationRules: appliedRules,
  };
}

function buildRuleXai(text, predictedClass, topK = 8) {
  const tokens = extractTextTokens(text);
  const weighted = [];

  tokens.forEach((token, index) => {
    let score = 1 / (index + 1.5);
    if (predictedClass === "negative" && (NEGATIVE_TOKENS.has(token) || NEGATION_TOKENS.has(token))) score += 1.4;
    if (predictedClass === "positive" && POSITIVE_TOKENS.has(token)) score += 1.4;
    if (predictedClass === "question" && QUESTION_TOKENS.has(token)) score += 1.2;
    weighted.push([token, score]);
  });

  const merged = new Map();
  for (const [token, score] of weighted) {
    merged.set(token, Math.max(score, merged.get(token) || 0));
  }

  const sorted = [...merged.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, Math.min(Number(topK || 8), 20)));

  const total = sorted.reduce((acc, [, score]) => acc + Number(score || 0), 0) || 1;
  const top_tokens = sorted.map(([token, score]) => [token, Number((score / total).toFixed(4))]);

  return {
    top_tokens,
    explanation_text: top_tokens.length
      ? `Top relative tokens for ${predictedClass}: ${top_tokens.map((entry) => `${entry[0]} (${Math.round(entry[1] * 100)}%)`).join(", ")}.`
      : `No token-level clues were extracted for ${predictedClass}.`,
    xai_method: "token-heuristic",
  };
}

function normalizeTopTokens(rawTokens, text = "", topK = 8) {
  if (!Array.isArray(rawTokens)) return [];

  const textLower = String(text || "").toLowerCase();
  const validTokensInText = new Set(extractTextTokens(text));

  const normalized = [];
  for (const entry of rawTokens) {
    let token = "";
    let score = 0;
    if (Array.isArray(entry) && entry.length >= 2) {
      token = String(entry[0] || "").trim();
      score = Number(entry[1]);
    } else if (entry && typeof entry === "object") {
      token = String(entry.token || entry.word || "").trim();
      score = Number(entry.score ?? entry.weight ?? entry.value ?? 0);
    }

    if (!token || !Number.isFinite(score) || score < 0) continue;

    const tokenLower = token.toLowerCase();
    // Validate that token exists in original comment text
    if (!textLower || validTokensInText.has(tokenLower) || textLower.includes(tokenLower)) {
      normalized.push([token, score]);
    }
  }

  const sorted = normalized
    .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
    .slice(0, Math.max(1, Math.min(Number(topK || 8), 20)));

  const total = sorted.reduce((acc, [, score]) => acc + Number(score || 0), 0);
  if (total <= 0) {
    return sorted.map(([token]) => [token, Number((1 / sorted.length).toFixed(4))]);
  }

  return sorted.map(([token, score]) => [token, Number((Number(score || 0) / total).toFixed(4))]);
}

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Empty LLM response body.");

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] || raw;

  try {
    return JSON.parse(candidate);
  } catch {
    const first = candidate.indexOf("{");
    const last = candidate.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(candidate.slice(first, last + 1));
    }
    throw new Error("Unable to parse JSON from LLM response.");
  }
}

function buildLlmPrompt(text, includeXai = false, topK = 8) {
  const xaiInstruction = includeXai
    ? `CRITICAL for top_tokens: MUST be an array of [token, score] containing ONLY words extracted directly from the Comment text verbatim (do NOT translate words into Arabic if the comment is Latin/French/Arabizi, do NOT add or hallucinate words not in the Comment). If the comment has 2 words, return at most 2 tokens. For off-topic comments return []. Scores should be relative importance between 0 and 1. Also include explanation_text in one short sentence.`
    : "Set top_tokens to [] and explanation_text to ''.";

  return [
    "You are a strict JSON API for enterprise sentiment intelligence exclusively for RAMY (Algerian beverage company: juices, drinks, sodas, dairy, water).",
    `Valid predicted_class values: ${TARGET_CLASSES.join(", ")}.`,
    "DOMAIN RELEVANCE RULE (CRITICAL):",
    "- You MUST only evaluate sentiment and questions specifically directed at Ramy, its products (juice, drinks, milk, water, packaging, price, taste, availability), or related customer feedback.",
    "- If the comment is off-topic, general, or unrelated to Ramy and its products (e.g. general political slogans like 'i love palestine', personal statements, greetings, or topics not about Ramy), you MUST classify it as 'neutral' with confidence >= 0.90.",
    "- For off-topic comments, set explanation_text to: 'Comment is unrelated to Ramy products or brand.' and top_tokens to [].",
    "Return JSON only with keys: predicted_class, confidence, all_scores, top_tokens, explanation_text, xai_method.",
    "all_scores must include exactly these classes and sum approximately to 1.",
    xaiInstruction,
    `Comment: ${text}`,
  ].join("\n");
}

function normalizeLlmPrediction(text, rawRow, options, providerId) {
  const rawPred = String(rawRow?.predicted_class || rawRow?.label || "neutral").toLowerCase();
  const rawConfidence = Number(rawRow?.confidence ?? rawRow?.score ?? 0.5);
  const isOffTopic = String(rawRow?.explanation_text || "").toLowerCase().includes("unrelated to ramy")
    || String(rawRow?.explanation_text || "").toLowerCase().includes("off-topic");

  const calibrated = isOffTopic
    ? {
        predictedClass: "neutral",
        confidence: Math.max(0.9, rawConfidence),
        allScores: { positive: 0.02, negative: 0.02, neutral: 0.92, improvement: 0.02, question: 0.02 },
        calibrationRules: ["off_topic_guard"],
      }
    : applyRuleCalibration(text, rawPred, rawConfidence, rawRow?.all_scores || null);

  let topTokens = [];
  let explanationText = String(rawRow?.explanation_text || "").trim();
  let xaiMethod = String(rawRow?.xai_method || "").trim() || `llm-${providerId}`;

  if (isOffTopic) {
    if (!explanationText) explanationText = "Comment is unrelated to Ramy products or brand.";
  } else if (options.includeXai) {
    topTokens = normalizeTopTokens(rawRow?.top_tokens || rawRow?.word_attributions || [], text, options.xaiTopK);

    if (!topTokens.length) {
      const fallbackXai = buildRuleXai(text, calibrated.predictedClass, options.xaiTopK);
      topTokens = fallbackXai.top_tokens;
      if (!explanationText) explanationText = fallbackXai.explanation_text;
      if (!xaiMethod) xaiMethod = fallbackXai.xai_method;
    }
  }

  return {
    text,
    predicted_class: calibrated.predictedClass,
    confidence: calibrated.confidence,
    all_scores: calibrated.allScores,
    calibration_rules: calibrated.calibrationRules,
    top_tokens: topTokens,
    explanation_text: explanationText,
    xai_method: xaiMethod,
    provider_id: providerId,
  };
}

function buildLlmProviderChain() {
  const providers = [];
  const onlyGemini = toBool(process.env.LLM_ONLY_GEMINI, false);

  const geminiPrimary = String(process.env.GEMINI_API_KEY_PRIMARY || "").trim();
  const geminiSecondary = String(process.env.GEMINI_API_KEY_SECONDARY || "").trim();
  const grokKey = String(process.env.GROK_API_KEY || "").trim();
  const nvidiaKey = String(process.env.NVIDIA_API_KEY || "").trim();

  const geminiModelPrimary = String(process.env.GEMINI_MODEL_PRIMARY || process.env.GEMINI_MODEL || "gemini-1.5-flash").trim();
  const geminiModelSecondary = String(process.env.GEMINI_MODEL_SECONDARY || process.env.GEMINI_MODEL || "gemini-1.5-flash").trim();
  const grokModel = String(process.env.GROK_MODEL || "llama-3.3-70b-versatile").trim();
  const nvidiaModel = String(process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct").trim();
  const nvidiaUrl = String(process.env.NVIDIA_API_URL || "https://integrate.api.nvidia.com/v1/chat/completions").trim();

  if (nvidiaKey) {
    providers.push({ id: "nvidia", type: "nvidia", apiKey: nvidiaKey, model: nvidiaModel, url: nvidiaUrl });
  }
  if (geminiPrimary) {
    providers.push({ id: "gemini-primary", type: "gemini", apiKey: geminiPrimary, model: geminiModelPrimary });
  }
  if (geminiSecondary) {
    providers.push({ id: "gemini-secondary", type: "gemini", apiKey: geminiSecondary, model: geminiModelSecondary });
  }
  if (!onlyGemini && grokKey) {
    providers.push({ id: "grok", type: "grok", apiKey: grokKey, model: grokModel });
  }

  const customUrl = String(process.env.LLM_API_URL || "").trim();
  if (!onlyGemini && customUrl) {
    providers.push({ id: "custom", type: "custom", url: customUrl });
  }

  const preferredProvider = String(process.env.LLM_PREFERRED_PROVIDER || "").trim().toLowerCase();
  if (preferredProvider) {
    const rank = (provider) => {
      if (preferredProvider === provider.id || preferredProvider === provider.type) return 0;
      if (preferredProvider === "nvidia" && provider.type === "nvidia") return 0;
      if (preferredProvider === "grok" && provider.type === "grok") return 0;
      if (preferredProvider === "gemini" && provider.type === "gemini") return 0;
      if (preferredProvider === "custom" && provider.type === "custom") return 0;
      return 1;
    };
    providers.sort((a, b) => rank(a) - rank(b));
  }

  return providers;
}

async function callGeminiProvider(provider, text, options) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(provider.model)}:generateContent?key=${encodeURIComponent(provider.apiKey)}`;
  const timeoutMs = readEnvInt("LLM_PROVIDER_TIMEOUT_MS", 20_000, 1_000, 180_000);

  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildLlmPrompt(text, options.includeXai, options.xaiTopK) }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  }, timeoutMs);

  const bodyText = await response.text();
  let payload = {};
  try {
    payload = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    // Keep raw body fallback.
  }

  if (!response.ok) {
    const detail = payload?.error?.message || payload?.detail || `Gemini failed (${response.status})`;
    const err = new Error(detail);
    err.status = response.status;
    const retryAfterMs = Math.max(
      parseRetryAfterHeader(response.headers.get("retry-after")),
      parseRetryDelayFromMessage(detail),
    );
    throw attachProviderErrorMetadata(err, provider.id, retryAfterMs);
  }

  const contentText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!contentText) {
    const err = new Error("Gemini response is missing content text.");
    err.status = response.status;
    throw err;
  }
  return extractJsonObject(contentText);
}

async function callGrokProvider(provider, text, options) {
  const endpoint = String(process.env.GROK_API_URL || "https://api.x.ai/v1/chat/completions").trim();
  const prompt = buildLlmPrompt(text, options.includeXai, options.xaiTopK);
  const timeoutMs = readEnvInt("LLM_PROVIDER_TIMEOUT_MS", 20_000, 1_000, 180_000);

  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.1,
      messages: [
        { role: "system", content: "You only return strict JSON responses." },
        { role: "user", content: prompt },
      ],
    }),
  }, timeoutMs);

  const bodyText = await response.text();
  let payload = {};
  try {
    payload = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    // Keep raw body fallback.
  }

  if (!response.ok) {
    const detail = payload?.error?.message || payload?.detail || `Grok failed (${response.status})`;
    const err = new Error(detail);
    err.status = response.status;
    const retryAfterMs = Math.max(
      parseRetryAfterHeader(response.headers.get("retry-after")),
      parseRetryDelayFromMessage(detail),
    );
    throw attachProviderErrorMetadata(err, provider.id, retryAfterMs);
  }

  const contentText = payload?.choices?.[0]?.message?.content;
  if (!contentText) {
    const err = new Error("Grok response is missing message content.");
    err.status = response.status;
    throw err;
  }

  return extractJsonObject(contentText);
}

async function callCustomProvider(provider, text, options) {
  const headers = { "Content-Type": "application/json" };
  const apiKey = String(process.env.LLM_API_KEY || "").trim();
  const apiKeyHeader = String(process.env.LLM_API_KEY_HEADER || "Authorization").trim();

  if (apiKey) {
    headers[apiKeyHeader] = apiKeyHeader.toLowerCase() === "authorization" && !apiKey.toLowerCase().startsWith("bearer ")
      ? `Bearer ${apiKey}`
      : apiKey;
  }

  const timeoutMs = readEnvInt("LLM_PROVIDER_TIMEOUT_MS", 20_000, 1_000, 180_000);

  const response = await fetchWithTimeout(provider.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: String(process.env.LLM_MODEL || "").trim() || undefined,
      task: "sentiment-classification",
      target_classes: TARGET_CLASSES,
      comments: [text],
      include_xai: options.includeXai,
      xai_top_k: options.xaiTopK,
    }),
  }, timeoutMs);

  const bodyText = await response.text();
  let payload = {};
  try {
    payload = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    // Keep raw body fallback.
  }

  if (!response.ok) {
    const detail = payload?.detail || payload?.error || `Custom LLM failed (${response.status})`;
    const err = new Error(detail);
    err.status = response.status;
    const retryAfterMs = Math.max(
      parseRetryAfterHeader(response.headers.get("retry-after")),
      parseRetryDelayFromMessage(detail),
    );
    throw attachProviderErrorMetadata(err, provider.id, retryAfterMs);
  }

  const row = Array.isArray(payload?.rows) ? payload.rows[0] : Array.isArray(payload?.predictions) ? payload.predictions[0] : null;
  if (!row || typeof row !== "object") {
    throw new Error("Custom LLM response must include rows[0] or predictions[0].");
  }
  return row;
}

async function callNvidiaProvider(provider, text, options) {
  const endpoint = String(provider.url || process.env.NVIDIA_API_URL || "https://integrate.api.nvidia.com/v1/chat/completions").trim();
  const prompt = buildLlmPrompt(text, options.includeXai, options.xaiTopK);
  const timeoutMs = readEnvInt("LLM_PROVIDER_TIMEOUT_MS", 30_000, 1_000, 180_000);

  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.1,
      messages: [
        { role: "system", content: "You only return strict JSON responses." },
        { role: "user", content: prompt },
      ],
    }),
  }, timeoutMs);

  const bodyText = await response.text();
  let payload = {};
  try {
    payload = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    // Keep raw body fallback.
  }

  if (!response.ok) {
    const detail = payload?.error?.message || payload?.detail || `NVIDIA failed (${response.status})`;
    const err = new Error(detail);
    err.status = response.status;
    const retryAfterMs = Math.max(
      parseRetryAfterHeader(response.headers.get("retry-after")),
      parseRetryDelayFromMessage(detail),
    );
    throw attachProviderErrorMetadata(err, provider.id, retryAfterMs);
  }

  const contentText = payload?.choices?.[0]?.message?.content;
  if (!contentText) {
    const err = new Error("NVIDIA response is missing message content.");
    err.status = response.status;
    throw err;
  }

  return extractJsonObject(contentText);
}

async function callLlmProvider(provider, text, options) {
  if (provider.type === "nvidia") return callNvidiaProvider(provider, text, options);
  if (provider.type === "gemini") return callGeminiProvider(provider, text, options);
  if (provider.type === "grok") return callGrokProvider(provider, text, options);
  return callCustomProvider(provider, text, options);
}

function isRateLimitLike(error) {
  const message = String(error?.message || "").toLowerCase();
  const status = Number(error?.status || 0);
  return status === 429
    || message.includes("quota")
    || message.includes("rate limit")
    || message.includes("resource exhausted")
    || message.includes("too many requests");
}

async function callLlmProviderWithRetry(provider, text, options) {
  const retries = readEnvInt("LLM_PROVIDER_RETRY_COUNT", 0, 0, 5);
  const baseDelayMs = readEnvInt("LLM_PROVIDER_RETRY_DELAY_MS", 700, 200, 60_000);
  const maxRetryWaitMs = readEnvInt("LLM_MAX_RETRY_WAIT_MS", 4_000, 500, 60_000);

  let attempt = 0;
  while (true) {
    await applyLlmThrottleDelay();

    try {
      return await callLlmProvider(provider, text, options);
    } catch (error) {
      const shouldRetry = isRateLimitLike(error) && attempt < retries;
      if (!shouldRetry) {
        throw error;
      }

      const retryDelayMs = Math.max(
        Number(error?.retryAfterMs || 0),
        baseDelayMs * (attempt + 1),
      );
      await sleep(Math.min(maxRetryWaitMs, retryDelayMs));
      attempt += 1;
    }
  }
}

function mockRuleClassify(text, options = {}) {
  const normalized = String(text || "").toLowerCase();
  const patterns = [
    { cls: "negative", keys: ["mauvais", "trop cher", "khayeb", "Ø±Ø¯ÙŠØ¡", "bad", "zero", "ghali"] },
    { cls: "improvement", keys: ["ameliore", "improve", "suggest", "Ø§Ù‚ØªØ±Ø§Ø­", "Ù…Ù…ÙƒÙ†", "please add"] },
    { cls: "question", keys: ["?", "ou", "where", "wach", "ÙÙŠÙ†", "comment", "kayen"] },
    { cls: "positive", keys: ["excellent", "top", "bnin", "tres bon", "Ø±ÙˆØ¹Ø©", "love", "super"] },
  ];

  let predicted = "neutral";
  for (const rule of patterns) {
    if (rule.keys.some((key) => normalized.includes(key))) {
      predicted = rule.cls;
    }
  }

  const baseScores = {
    positive: 0.18,
    negative: 0.18,
    neutral: 0.18,
    improvement: 0.18,
    question: 0.18,
  };
  baseScores[predicted] = 0.66;
  if (predicted === "question") baseScores.improvement = 0.11;

  const calibrated = applyRuleCalibration(text, predicted, Number(baseScores[predicted] || 0.66), baseScores);
  const row = {
    text,
    predicted_class: calibrated.predictedClass,
    confidence: calibrated.confidence,
    all_scores: calibrated.allScores,
    calibration_rules: calibrated.calibrationRules,
    top_tokens: [],
    explanation_text: "",
    xai_method: "",
  };

  if (options.includeXai) {
    const xai = buildRuleXai(text, calibrated.predictedClass, options.xaiTopK);
    row.top_tokens = xai.top_tokens;
    row.explanation_text = xai.explanation_text;
    row.xai_method = xai.xai_method;
  }

  return row;
}

async function predictWithLlmProvider(comments, options = {}) {
  const maxBatch = Math.max(1, Math.min(500, Number(process.env.LLM_MAX_BATCH || 120)));
  if (comments.length > maxBatch) {
    throw new Error(`LLM batch limit exceeded (${comments.length}). Max allowed is ${maxBatch}.`);
  }

  const providers = buildLlmProviderChain();
  if (!providers.length) {
    throw new Error("No LLM providers configured. Set GEMINI_API_KEY_PRIMARY / GEMINI_API_KEY_SECONDARY / GROK_API_KEY.");
  }

  const rows = [];
  let preferredProviderIndex = 0;
  const providerErrors = [];

  for (const text of comments) {
    let resolved = null;
    let lastError = null;

    for (let index = preferredProviderIndex; index < providers.length; index += 1) {
      const provider = providers[index];
      try {
        const rawPrediction = await callLlmProviderWithRetry(provider, text, options);
        resolved = normalizeLlmPrediction(text, rawPrediction, options, provider.id);
        preferredProviderIndex = index;
        break;
      } catch (error) {
        lastError = error;
        providerErrors.push(`[${provider.id}] ${String(error?.message || error)}`);
        if (isRateLimitLike(error)) {
          preferredProviderIndex = Math.min(index + 1, providers.length - 1);
        }
      }
    }

    if (!resolved) {
      const detail = String(lastError?.message || "Unknown LLM provider error");
      const err = new Error(`All configured LLM providers failed. Last error: ${detail}`);
      err.isLlmProviderFailure = true;
      err.publicDetail = GENERIC_LLM_FAILURE_DETAIL;
      err.providerErrors = providerErrors.slice(-8);
      throw err;
    }

    rows.push(resolved);
  }

  return rows;
}

async function predictComments(comments, options = {}) {
  const provider = String(process.env.CLASSIFIER_PROVIDER || "rule").trim().toLowerCase();
  if (provider === "llm") {
    return await predictWithLlmProvider(comments, options);
  }

  return comments.map((text) => mockRuleClassify(text, options));
}

function classifyCatalog(product, text = "") {
  const source = `${product || ""} ${text || ""}`.toLowerCase();

  if (source.includes("milky")) {
    if (/\b1\s?l\b|\b1l\b/.test(source)) return ["Boisson au lait", "milky : 1l"];
    if (/\b20\s?cl\b|\b20cl\b/.test(source)) return ["Boisson au lait", "milky : 20cl"];
    if (/\b300\s?ml\b|\b300ml\b/.test(source)) return ["Boisson au lait", "milky : 300ml"];
    if (/\b25\s?cl\b|\b25cl\b/.test(source)) return ["Boisson au lait", "milky : 25cl"];
    return ["Boisson au lait", "milky : 1l"];
  }

  if (["lait", "yupty", "raib", "lben", "cherebt", "duo"].some((key) => source.includes(key))) {
    if (source.includes("yupty")) return ["Produits laitiers", "yupty"];
    if (source.includes("raib") || source.includes("lben")) return ["Produits laitiers", "raib et lben"];
    if (source.includes("cherebt")) return ["Produits laitiers", "cherebt"];
    if (source.includes("duo")) return ["Produits laitiers", "ramy up duo"];
    return ["Produits laitiers", "lais"];
  }

  if (["gaze", "gaz", "sparkling", "verre", "water fruits"].some((key) => source.includes(key))) {
    if (source.includes("canette")) return ["Boisson gazÃ©ifiÃ©e", "Boisson gazeifiÃ©e canette"];
    if (source.includes("verre")) return ["Boisson gazÃ©ifiÃ©e", "Boisson gazeifiÃ©e verre"];
    return ["Boisson gazÃ©ifiÃ©e", "Water Fruits"];
  }

  if (source.includes("frutty")) return ["Boisson aux fruits", "Frutty"];
  if (source.includes("kids")) return ["Boisson aux fruits", "kids"];
  if (source.includes("canette")) return ["Boisson aux fruits", "canette"];
  if (source.includes("carton") || source.includes("fardeau") || source.includes("pack")) return ["Boisson aux fruits", "carton"];
  if (source.includes("extra")) return ["Boisson aux fruits", "EXTRA"];

  return ["Boisson aux fruits", "Classique"];
}

function normalizeLegacyRow(parts) {
  const text = String(parts[0] || "").trim();
  const product = String(parts[1] || "").trim();
  const label = String(parts[2] || "").trim().toLowerCase();
  if (!text || !label) return null;

  const [category, subcategory] = classifyCatalog(product, text);
  return {
    text,
    product: product || "Unknown",
    sentiment: label,
    platform: "dataset",
    wilaya: "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
    rating: 3,
    timestamp: new Date().toISOString(),
    aspects: {},
    category,
    subcategory,
  };
}

async function loadReviews() {
  const dataPath = resolveDataPath();

  if (!fsSync.existsSync(dataPath)) {
    throw new Error(`Dataset file not found: ${dataPath}`);
  }

  const stats = await fs.stat(dataPath);
  if (reviewCache.path === dataPath && reviewCache.mtimeMs === stats.mtimeMs) {
    return reviewCache.rows;
  }

  const content = await fs.readFile(dataPath, "utf-8");
  const parsed = Papa.parse(content, {
    delimiter: ";",
    skipEmptyLines: true,
  });

  const dataRows = Array.isArray(parsed.data) ? parsed.data : [];
  if (!dataRows.length) return [];

  const first = Array.isArray(dataRows[0]) ? dataRows[0] : [];
  const lowered = first.map((cell) => String(cell || "").trim().toLowerCase());
  const hasHeader = lowered.includes("text") && lowered.includes("product") && (lowered.includes("label") || lowered.includes("sentiment"));

  const rows = [];
  if (hasHeader) {
    const header = lowered;
    for (const record of dataRows.slice(1)) {
      if (!Array.isArray(record) || !record.length) continue;
      const row = {};
      for (let index = 0; index < header.length; index += 1) {
        row[header[index]] = String(record[index] ?? "").trim();
      }

      const text = String(row.text || "").trim();
      const sentiment = String(row.sentiment || row.label || "").trim().toLowerCase();
      if (!text || !sentiment) continue;

      const product = String(row.product || "Unknown");
      const [category, subcategory] = classifyCatalog(product, text);

      let aspects = {};
      if (row.aspects) {
        try {
          const parsedAspects = JSON.parse(row.aspects);
          if (parsedAspects && typeof parsedAspects === "object") aspects = parsedAspects;
        } catch {
          aspects = {};
        }
      }

      rows.push({
        text,
        product,
        sentiment,
        platform: row.platform || "dataset",
        wilaya: row.wilaya || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯",
        rating: Number(row.rating || 3),
        timestamp: row.timestamp || new Date().toISOString(),
        aspects,
        category: row.category || category,
        subcategory: row.subcategory || subcategory,
      });
    }
  } else {
    for (const record of dataRows) {
      if (!Array.isArray(record)) continue;
      const normalized = normalizeLegacyRow(record);
      if (normalized) rows.push(normalized);
    }
  }

  reviewCache.path = dataPath;
  reviewCache.mtimeMs = stats.mtimeMs;
  reviewCache.rows = rows;
  return rows;
}

function filterReviews(reviews, filters) {
  let filtered = reviews;

  const matchEq = (field, value) => {
    const target = String(value || "").trim().toLowerCase();
    if (!target) return;
    filtered = filtered.filter((row) => String(row[field] || "").trim().toLowerCase() === target);
  };

  matchEq("sentiment", filters.sentiment);
  matchEq("product", filters.product);
  matchEq("wilaya", filters.wilaya);
  matchEq("category", filters.category);
  matchEq("subcategory", filters.subcategory);

  if (filters.search) {
    const needle = String(filters.search || "").trim().toLowerCase();
    if (needle) {
      filtered = filtered.filter((row) => String(row.text || "").toLowerCase().includes(needle));
    }
  }

  return filtered;
}

function buildOverview(reviews) {
  const sentiments = {};
  const products = {};
  const categories = {};

  for (const review of reviews) {
    const sentiment = String(review.sentiment || "unknown");
    const product = String(review.product || "Unknown");
    const category = String(review.category || "Unknown");

    sentiments[sentiment] = (sentiments[sentiment] || 0) + 1;
    products[product] = (products[product] || 0) + 1;
    categories[category] = (categories[category] || 0) + 1;
  }

  const sortedProducts = Object.entries(products)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  const recent = [...reviews].slice(-10).reverse();

  return {
    total: reviews.length,
    distribution: sentiments,
    products: sortedProducts,
    categories,
    recent,
  };
}

function buildTrends(reviews) {
  const trend = new Map();

  for (const row of reviews) {
    const ts = String(row.timestamp || "");
    const date = Number.isNaN(Date.parse(ts)) ? new Date() : new Date(ts);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!trend.has(month)) trend.set(month, {});
    const bucket = trend.get(month);
    const sentiment = String(row.sentiment || "unknown");
    bucket[sentiment] = (bucket[sentiment] || 0) + 1;
  }

  const series = Array.from(trend.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, counts]) => ({ month, ...counts }));

  return { series };
}

function buildGeo(reviews) {
  const buckets = new Map();

  for (const row of reviews) {
    const wilaya = String(row.wilaya || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯");
    if (!buckets.has(wilaya)) buckets.set(wilaya, {});
    const item = buckets.get(wilaya);
    const sentiment = String(row.sentiment || "unknown");
    item[sentiment] = (item[sentiment] || 0) + 1;
  }

  const rows = [];
  for (const [wilaya, counts] of buckets.entries()) {
    const total = Object.values(counts).reduce((acc, value) => acc + Number(value || 0), 0);
    const score = total
      ? (((Number(counts.positive || 0) - Number(counts.negative || 0)) / total) * 100)
      : 0;
    rows.push({ wilaya, score: Number(score.toFixed(2)), total });
  }

  rows.sort((a, b) => b.score - a.score);
  return {
    rows,
    best: rows[0] || null,
    worst: rows.length ? rows[rows.length - 1] : null,
  };
}

function buildAspects(reviews) {
  const buckets = new Map();

  for (const row of reviews) {
    let aspects = row.aspects || {};
    if (typeof aspects === "string") {
      try {
        aspects = JSON.parse(aspects);
      } catch {
        aspects = {};
      }
    }

    if (!aspects || typeof aspects !== "object") continue;

    for (const [aspect, sentiment] of Object.entries(aspects)) {
      if (!buckets.has(aspect)) buckets.set(aspect, {});
      const item = buckets.get(aspect);
      item[sentiment] = (item[sentiment] || 0) + 1;
    }
  }

  const rows = [];
  for (const [aspect, counts] of buckets.entries()) {
    const total = Object.values(counts).reduce((acc, value) => acc + Number(value || 0), 0);
    if (!total) continue;
    rows.push({
      aspect,
      positive: Number(counts.positive || 0),
      negative: Number(counts.negative || 0),
      neutral: Number(counts.neutral || 0),
      score: Number((((Number(counts.positive || 0) - Number(counts.negative || 0)) / total) * 100).toFixed(2)),
    });
  }

  rows.sort((a, b) => b.score - a.score);
  return { rows };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[,;"\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function rowsToCsv(rows, headers, includeHeader = true, delimiter = ",") {
  const lines = [];
  if (includeHeader) {
    lines.push(headers.map((header) => csvEscape(header)).join(delimiter));
  }
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row?.[header] ?? "")).join(delimiter));
  }
  return lines.join("\n");
}

function detectLanguage(text) {
  const value = String(text || "");
  const hasArabic = /[\u0600-\u06FF]/.test(value);
  const hasLatin = /[A-Za-z]/.test(value);
  if (hasArabic && hasLatin) return "Mixed Arabic/Darja/French";
  if (hasArabic) return "Arabic / Darja";
  if (hasLatin) return "French / Latin";
  return "Unknown";
}

function parseUploadedTable(file) {
  const filename = String(file.originalname || "upload.csv").toLowerCase();
  const buffer = file.buffer;

  if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) {
      throw new Error("Excel file does not contain any sheet.");
    }
    const sheet = workbook.Sheets[firstSheet];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const columns = rows.length
      ? Object.keys(rows[0])
      : [];
    return { rows, columns };
  }

  let text;
  try {
    text = buffer.toString("utf-8");
  } catch {
    text = buffer.toString("latin1");
  }

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: "",
  });

  const headerFields = parsed.meta?.fields || [];
  if (headerFields.length) {
    return { rows: parsed.data, columns: headerFields };
  }

  const fallback = Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
    delimiter: "",
  });

  const matrix = Array.isArray(fallback.data) ? fallback.data : [];
  const width = matrix.reduce((maxWidth, row) => Array.isArray(row) ? Math.max(maxWidth, row.length) : maxWidth, 0);
  const columns = Array.from({ length: width }, (_, index) => `col_${index + 1}`);
  const rows = matrix.map((row) => {
    const payload = {};
    for (let index = 0; index < width; index += 1) {
      payload[columns[index]] = String((Array.isArray(row) ? row[index] : "") ?? "");
    }
    return payload;
  });

  return { rows, columns };
}

function resolveTextColumn(columns, rows, requestedColumn) {
  const allColumns = Array.isArray(columns) ? columns.map((col) => String(col)) : [];
  if (!allColumns.length) throw new Error("Uploaded file has no columns.");

  if (requestedColumn) {
    const target = String(requestedColumn).trim().toLowerCase();
    const matched = allColumns.find((col) => col.trim().toLowerCase() === target);
    if (!matched) {
      throw new Error(`Text column '${requestedColumn}' not found in file.`);
    }
    return matched;
  }

  const candidates = ["text", "comment", "message", "review", "content", "feedback"];
  for (const candidate of candidates) {
    const matched = allColumns.find((col) => col.trim().toLowerCase() === candidate);
    if (matched) return matched;
  }

  for (const col of allColumns) {
    const hasText = rows.some((row) => {
      const value = String(row?.[col] ?? "").trim();
      return value.length > 0;
    });
    if (hasText) return col;
  }

  return allColumns[0];
}

async function ensureSocialConfig() {
  const configPath = fsSync.existsSync(SOCIAL_CONFIG_PATH)
    ? SOCIAL_CONFIG_PATH
    : path.resolve(process.cwd(), "config", "social_connectors.json");
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // fallthrough to default config
  }

  const defaults = {
    updated_at: new Date().toISOString(),
    connectors: Object.fromEntries(SOCIAL_PLATFORMS.map((platform) => [
      platform,
      {
        platform,
        enabled: false,
        page_id: "",
        access_token: "",
        verify_token: "",
        webhook_url: `/api/social/webhook/${platform}`,
      },
    ])),
  };

  try {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(defaults, null, 2), "utf-8");
  } catch {
    // Read-only filesystem in serverless
  }
  return defaults;
}

async function saveSocialConfig(config) {
  const payload = { ...config, updated_at: new Date().toISOString() };
  const configPath = fsSync.existsSync(SOCIAL_CONFIG_PATH)
    ? SOCIAL_CONFIG_PATH
    : path.resolve(process.cwd(), "config", "social_connectors.json");
  try {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.warn("Unable to write social config to disk:", err.message);
  }
  return payload;
}

function maskSecret(secret) {
  const value = String(secret || "");
  if (!value) return "";
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}${"*".repeat(value.length - 8)}${value.slice(-4)}`;
}

function sanitizeConnector(connector) {
  const accessToken = String(connector.access_token || "");
  const verifyToken = String(connector.verify_token || "");
  return {
    platform: connector.platform,
    enabled: toBool(connector.enabled, false),
    page_id: String(connector.page_id || ""),
    webhook_url: String(connector.webhook_url || ""),
    has_access_token: Boolean(accessToken),
    access_token_masked: maskSecret(accessToken),
    has_verify_token: Boolean(verifyToken),
    verify_token_masked: maskSecret(verifyToken),
  };
}

async function loadSocialRows() {
  if (!fsSync.existsSync(SOCIAL_STREAM_PATH)) {
    return [];
  }

  const content = await fs.readFile(SOCIAL_STREAM_PATH, "utf-8");
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = Array.isArray(parsed.data) ? parsed.data : [];
  rows.sort((a, b) => String(b.ingested_at || "").localeCompare(String(a.ingested_at || "")));
  return rows;
}

const SOCIAL_STREAM_HEADERS = [
  "id",
  "platform",
  "page_id",
  "comment_id",
  "author",
  "text",
  "predicted_class",
  "confidence",
  "timestamp",
  "ingested_at",
  "source",
];

async function appendSocialRows(rows) {
  if (!rows.length) return;
  await fs.mkdir(path.dirname(SOCIAL_STREAM_PATH), { recursive: true });
  const exists = fsSync.existsSync(SOCIAL_STREAM_PATH);
  const chunk = `${rowsToCsv(rows, SOCIAL_STREAM_HEADERS, !exists)}\n`;
  await fs.appendFile(SOCIAL_STREAM_PATH, chunk, "utf-8");
}

function extractSocialComments(payload) {
  const comments = [];

  if (Array.isArray(payload?.comments)) {
    for (const item of payload.comments) {
      if (item && typeof item === "object") {
        const text = String(item.text || item.message || "").trim();
        if (!text) continue;
        comments.push({
          comment_id: String(item.id || item.comment_id || ""),
          author: String(item.author || item.username || ""),
          text,
          timestamp: String(item.timestamp || new Date().toISOString()),
        });
      } else {
        const text = String(item || "").trim();
        if (!text) continue;
        comments.push({
          comment_id: "",
          author: "",
          text,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  if (Array.isArray(payload?.entry)) {
    for (const entry of payload.entry) {
      if (!entry || typeof entry !== "object") continue;
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value;
        if (!value || typeof value !== "object") continue;
        const nestedComment = value.comment && typeof value.comment === "object" ? value.comment : {};
        const text = String(value.message || value.text || nestedComment.message || "").trim();
        if (!text) continue;
        const sender = value.from && typeof value.from === "object" ? value.from : {};
        comments.push({
          comment_id: String(value.comment_id || value.id || ""),
          author: String(sender.name || sender.id || ""),
          text,
          timestamp: String(value.created_time || value.timestamp || new Date().toISOString()),
        });
      }
    }
  }

  if (Array.isArray(payload?.data)) {
    for (const item of payload.data) {
      if (!item || typeof item !== "object") continue;
      const text = String(item.text || item.message || item.comment || "").trim();
      if (!text) continue;
      comments.push({
        comment_id: String(item.id || item.comment_id || ""),
        author: String(item.author || item.username || ""),
        text,
        timestamp: String(item.timestamp || new Date().toISOString()),
      });
    }
  }

  return comments;
}

async function ingestSocialComments(platform, pageId, comments, source = "api") {
  const normalizedPlatform = String(platform || "").trim().toLowerCase();
  if (!SOCIAL_PLATFORMS.includes(normalizedPlatform)) {
    throw new Error(`Unsupported platform '${platform}'.`);
  }

  const cleaned = comments
    .map((item) => ({
      comment_id: String(item.comment_id || item.id || ""),
      author: String(item.author || item.username || ""),
      text: String(item.text || item.message || "").trim(),
      timestamp: String(item.timestamp || new Date().toISOString()),
    }))
    .filter((item) => item.text);

  if (!cleaned.length) {
    throw new Error("No valid comments found for ingestion.");
  }
  if (cleaned.length > 500) {
    throw new Error("Too many comments in one request. Max allowed is 500.");
  }

  const predictions = await predictComments(cleaned.map((row) => row.text));
  const now = new Date().toISOString();

  const streamRows = cleaned.map((row, index) => ({
    id: crypto.randomUUID(),
    platform: normalizedPlatform,
    page_id: String(pageId || ""),
    comment_id: row.comment_id,
    author: row.author,
    text: row.text,
    predicted_class: predictions[index]?.predicted_class || "neutral",
    confidence: Number(predictions[index]?.confidence || 0),
    timestamp: row.timestamp || now,
    ingested_at: now,
    source,
  }));

  await appendSocialRows(streamRows);
  const distribution = streamRows.reduce((acc, row) => {
    const cls = String(row.predicted_class || "unknown");
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  return {
    platform: normalizedPlatform,
    ingested: streamRows.length,
    distribution,
    rows: streamRows,
  };
}

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

app.get("/", (req, res) => {
  res.json({
    service: "ramy-backend",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    dataset: resolveDataPath(),
  });
});

app.get("/api/model/status", (req, res) => {
  const provider = String(process.env.CLASSIFIER_PROVIDER || "rule").toLowerCase();
  const llmChain = provider === "llm" ? buildLlmProviderChain().map((entry) => entry.id) : [];
  const ready = provider === "llm" ? llmChain.length > 0 : true;
  res.json({
    ready,
    provider,
    llm_chain: llmChain,
    model_dir: provider === "llm" ? llmChain.join(" -> ") : "rule-based-classifier",
    error: ready ? "" : "No LLM provider configured. Add Gemini/Grok/NVIDIA keys in backend .env",
    xai_ready: provider === "llm",
    xai_error: provider === "llm" ? "" : "XAI is only enabled for LLM provider mode.",
  });
});

app.get("/api/model/predict", (req, res) => {
  res.json({
    detail: "Method Not Allowed for GET. Use POST with JSON body: {'comments': ['text1', 'text2']}",
    example: { comments: ["ramy tres bon", "prix trop cher"] },
  });
});

app.post("/api/model/predict", asyncRoute(async (req, res) => {
  const commentsRaw = req.body?.comments;
  let comments = [];

  if (typeof commentsRaw === "string") {
    comments = commentsRaw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  } else if (Array.isArray(commentsRaw)) {
    comments = commentsRaw.map((value) => String(value || "").trim()).filter(Boolean);
  }

  if (!comments.length) {
    return res.status(400).json({ detail: "Provide at least one comment in 'comments'." });
  }
  if (comments.length > 1000) {
    return res.status(400).json({ detail: "Too many comments. Max allowed is 1000." });
  }

  const includeXai = toBool(req.body?.include_xai, false);
  const xaiTopKRaw = Number(req.body?.xai_top_k ?? 8);
  const xaiTopK = Number.isFinite(xaiTopKRaw) ? Math.max(1, Math.min(20, xaiTopKRaw)) : 8;

  let rows = [];
  try {
    rows = await predictComments(comments, {
      includeXai,
      xaiTopK,
    });
  } catch (error) {
    if (error?.providerErrors?.length) {
      console.error("[LLM providers]", error.providerErrors.join(" | "));
    }
    console.error("[Predict error]", String(error?.stack || error?.message || error));
    const publicErr = getPublicApiError(error, 503, "Prediction service is temporarily unavailable.");
    return res.status(publicErr.status).json({ detail: publicErr.detail });
  }

  const distribution = rows.reduce((acc, row) => {
    const cls = String(row.predicted_class || "unknown");
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  const xaiUsed = includeXai && rows.some((row) => Array.isArray(row.top_tokens) && row.top_tokens.length > 0);
  const firstXaiMethod = rows.find((row) => row.xai_method)?.xai_method || "";

  res.json({
    total: rows.length,
    rows: rows.map((row) => ({
      ...row,
      language: detectLanguage(row.text),
    })),
    distribution,
    model_dir: String(process.env.CLASSIFIER_PROVIDER || "rule"),
    xai_used: xaiUsed,
    xai_method: xaiUsed ? firstXaiMethod : "",
    xai_error: includeXai && !xaiUsed ? "XAI was requested but no attribution was produced." : "",
  });
}));

app.post("/api/model/predict-file", upload.single("file"), asyncRoute(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: "File is required." });
  }

  const textColumn = String(req.body?.text_column || "").trim();
  const outputFormat = String(req.body?.output_format || "json").trim().toLowerCase();

  let table;
  try {
    table = parseUploadedTable(req.file);
  } catch (error) {
    return res.status(400).json({ detail: String(error.message || error) });
  }

  const rows = Array.isArray(table.rows) ? table.rows : [];
  const columns = Array.isArray(table.columns) ? table.columns : [];
  if (!rows.length) {
    return res.status(400).json({ detail: "Uploaded file has no data rows." });
  }

  let selectedColumn;
  try {
    selectedColumn = resolveTextColumn(columns, rows, textColumn);
  } catch (error) {
    return res.status(400).json({ detail: String(error.message || error) });
  }

  const validIndices = [];
  const comments = [];
  rows.forEach((row, index) => {
    const text = String(row?.[selectedColumn] ?? "").trim();
    if (!text) return;
    validIndices.push(index);
    comments.push(text);
  });

  if (!comments.length) {
    return res.status(400).json({ detail: "No valid text rows found in selected column." });
  }
  if (comments.length > 2000) {
    return res.status(400).json({ detail: "Too many rows to analyze. Max allowed is 2000." });
  }

  let predictions = [];
  try {
    predictions = await predictComments(comments, { includeXai: false, xaiTopK: 8 });
  } catch (error) {
    if (error?.providerErrors?.length) {
      console.error("[LLM providers]", error.providerErrors.join(" | "));
    }
    console.error("[Predict-file error]", String(error?.stack || error?.message || error));
    const publicErr = getPublicApiError(error, 503, "Prediction service is temporarily unavailable.");
    return res.status(publicErr.status).json({ detail: publicErr.detail });
  }
  const outRows = rows.map((row) => ({ ...row }));
  for (let i = 0; i < predictions.length; i += 1) {
    const targetIndex = validIndices[i];
    const pred = predictions[i];
    outRows[targetIndex].predicted_class = pred.predicted_class;
    outRows[targetIndex].confidence = Number(pred.confidence || 0);
    outRows[targetIndex].calibration_rules = Array.isArray(pred.calibration_rules) ? pred.calibration_rules.join(",") : "";
    outRows[targetIndex].all_scores_json = JSON.stringify(pred.all_scores || {});
  }

  const distribution = predictions.reduce((acc, row) => {
    const cls = String(row.predicted_class || "unknown");
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  const originalName = String(req.file.originalname || "predictions");
  const baseName = originalName.replace(/\.[^.]+$/, "") || "predictions";

  if (outputFormat === "csv") {
    const headers = Array.from(outRows.reduce((acc, row) => {
      Object.keys(row).forEach((key) => acc.add(key));
      return acc;
    }, new Set()));
    const content = rowsToCsv(outRows, headers, true, ",");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${baseName}_predictions.csv`);
    return res.send(content);
  }

  if (outputFormat === "xlsx") {
    const sheet = XLSX.utils.json_to_sheet(outRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "predictions");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${baseName}_predictions.xlsx`);
    return res.send(buffer);
  }

  return res.json({
    filename: originalName,
    text_column: selectedColumn,
    total_rows: outRows.length,
    analyzed_rows: predictions.length,
    skipped_rows: outRows.length - predictions.length,
    distribution,
    prediction_preview: predictions.slice(0, 200),
    table_preview: outRows.slice(0, 120),
    available_columns: Array.from(outRows.reduce((acc, row) => {
      Object.keys(row).forEach((key) => acc.add(key));
      return acc;
    }, new Set())),
  });
}));

app.get("/api/catalog", (req, res) => {
  res.json(CATALOG);
});

app.get("/api/options", asyncRoute(async (req, res) => {
  const reviews = await loadReviews();
  res.json({
    products: [...new Set(reviews.map((row) => String(row.product || "Unknown")))].sort(),
    sentiments: [...new Set(reviews.map((row) => String(row.sentiment || "unknown")))].sort(),
    wilayas: [...new Set(reviews.map((row) => String(row.wilaya || "ØºÙŠØ± Ù…Ø­Ø¯Ø¯")))].sort(),
    categories: [...new Set(reviews.map((row) => String(row.category || "")))].sort(),
    subcategories: [...new Set(reviews.map((row) => String(row.subcategory || "")))].sort(),
  });
}));

app.get("/api/overview", asyncRoute(async (req, res) => {
  const reviews = await loadReviews();
  const filtered = filterReviews(reviews, req.query || {});
  res.json(buildOverview(filtered));
}));

app.get("/api/trends", asyncRoute(async (req, res) => {
  const reviews = await loadReviews();
  const filtered = filterReviews(reviews, req.query || {});
  res.json(buildTrends(filtered));
}));

app.get("/api/geo", asyncRoute(async (req, res) => {
  const reviews = await loadReviews();
  const filtered = filterReviews(reviews, req.query || {});
  res.json(buildGeo(filtered));
}));

app.get("/api/aspects", asyncRoute(async (req, res) => {
  const reviews = await loadReviews();
  const filtered = filterReviews(reviews, req.query || {});
  res.json(buildAspects(filtered));
}));

app.get("/api/reviews", asyncRoute(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.max(5, Math.min(100, Number(req.query.page_size || 20)));

  const reviews = await loadReviews();
  const filtered = filterReviews(reviews, req.query || {});

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  res.json({
    page,
    page_size: pageSize,
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    rows: filtered.slice(start, end),
  });
}));

app.get("/api/export/reviews.csv", asyncRoute(async (req, res) => {
  const reviews = await loadReviews();
  const filtered = filterReviews(reviews, req.query || {});

  const headers = [
    "text",
    "product",
    "category",
    "subcategory",
    "sentiment",
    "platform",
    "wilaya",
    "rating",
    "timestamp",
  ];
  const content = rowsToCsv(filtered, headers, true, ";");
  const filename = `ramy_reviews_export_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(content);
}));

app.get("/api/social/connectors", asyncRoute(async (req, res) => {
  const config = await ensureSocialConfig();
  const connectors = config.connectors || {};
  const sanitized = SOCIAL_PLATFORMS.map((platform) => sanitizeConnector(connectors[platform] || {
    platform,
    enabled: false,
    page_id: "",
    access_token: "",
    verify_token: "",
    webhook_url: `/api/social/webhook/${platform}`,
  }));

  res.json({
    updated_at: config.updated_at || "",
    connectors: sanitized,
  });
}));

app.post("/api/social/connectors", asyncRoute(async (req, res) => {
  const platform = String(req.body?.platform || "").trim().toLowerCase();
  if (!SOCIAL_PLATFORMS.includes(platform)) {
    return res.status(400).json({ detail: `Unsupported platform '${platform}'.` });
  }

  const config = await ensureSocialConfig();
  if (!config.connectors || typeof config.connectors !== "object") {
    config.connectors = {};
  }

  const existing = config.connectors[platform] || {
    platform,
    enabled: false,
    page_id: "",
    access_token: "",
    verify_token: "",
    webhook_url: `/api/social/webhook/${platform}`,
  };

  existing.platform = platform;
  existing.enabled = toBool(req.body?.enabled, existing.enabled);
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "page_id")) {
    existing.page_id = String(req.body.page_id || "");
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "access_token")) {
    existing.access_token = String(req.body.access_token || "");
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, "verify_token")) {
    existing.verify_token = String(req.body.verify_token || "");
  }
  existing.webhook_url = `/api/social/webhook/${platform}`;

  config.connectors[platform] = existing;
  const saved = await saveSocialConfig(config);

  res.json({
    status: "saved",
    updated_at: saved.updated_at,
    connector: sanitizeConnector(existing),
  });
}));

app.post("/api/social/ingest", asyncRoute(async (req, res) => {
  const platform = String(req.body?.platform || "facebook").trim().toLowerCase();
  const pageId = String(req.body?.page_id || "");
  const source = String(req.body?.source || "api");
  const commentsInput = Array.isArray(req.body?.comments) ? req.body.comments : null;

  if (!commentsInput) {
    return res.status(400).json({ detail: "'comments' must be an array." });
  }

  try {
    const result = await ingestSocialComments(platform, pageId, commentsInput, source);
    const rows = await loadSocialRows();
    res.json({
      ...result,
      stream_total: rows.length,
      rows: result.rows.slice(0, 120),
    });
  } catch (error) {
    res.status(400).json({ detail: String(error.message || error) });
  }
}));

app.get("/api/social/comments", asyncRoute(async (req, res) => {
  const limit = Math.max(1, Math.min(1000, Number(req.query.limit || 100)));
  const platform = String(req.query.platform || "").trim().toLowerCase();
  const pageId = String(req.query.page_id || "").trim().toLowerCase();

  let rows = await loadSocialRows();
  if (platform) {
    rows = rows.filter((row) => String(row.platform || "").toLowerCase() === platform);
  }
  if (pageId) {
    rows = rows.filter((row) => String(row.page_id || "").toLowerCase() === pageId);
  }

  const distribution = rows.reduce((acc, row) => {
    const cls = String(row.predicted_class || "unknown");
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {});

  res.json({
    total: rows.length,
    distribution,
    rows: rows.slice(0, limit),
  });
}));

app.get("/api/social/export.csv", asyncRoute(async (req, res) => {
  const platform = String(req.query.platform || "").trim().toLowerCase();
  const pageId = String(req.query.page_id || "").trim().toLowerCase();

  let rows = await loadSocialRows();
  if (platform) rows = rows.filter((row) => String(row.platform || "").toLowerCase() === platform);
  if (pageId) rows = rows.filter((row) => String(row.page_id || "").toLowerCase() === pageId);

  const content = rowsToCsv(rows, SOCIAL_STREAM_HEADERS, true, ",");
  const filename = `ramy_social_stream_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(content);
}));

app.get("/api/social/export.xlsx", asyncRoute(async (req, res) => {
  const platform = String(req.query.platform || "").trim().toLowerCase();
  const pageId = String(req.query.page_id || "").trim().toLowerCase();

  let rows = await loadSocialRows();
  if (platform) rows = rows.filter((row) => String(row.platform || "").toLowerCase() === platform);
  if (pageId) rows = rows.filter((row) => String(row.page_id || "").toLowerCase() === pageId);

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "social_stream");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const filename = `ramy_social_stream_${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`;
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.send(buffer);
}));

app.get("/api/social/webhook/:platform", asyncRoute(async (req, res) => {
  const platform = String(req.params.platform || "").trim().toLowerCase();
  if (!SOCIAL_PLATFORMS.includes(platform)) {
    return res.status(404).json({ detail: "Unknown platform webhook." });
  }

  const mode = String(req.query["hub.mode"] || "");
  const verifyToken = String(req.query["hub.verify_token"] || "");
  const challenge = String(req.query["hub.challenge"] || "");

  const config = await ensureSocialConfig();
  const connector = config.connectors?.[platform] || {};
  const expected = String(connector.verify_token || "");

  if (mode === "subscribe" && challenge) {
    if (expected && verifyToken === expected) {
      res.setHeader("Content-Type", "text/plain");
      return res.send(challenge);
    }
    return res.status(403).json({ detail: "Webhook verification failed." });
  }

  return res.json({ status: "ok", platform });
}));

app.post("/api/social/webhook/:platform", asyncRoute(async (req, res) => {
  const platform = String(req.params.platform || "").trim().toLowerCase();
  if (!SOCIAL_PLATFORMS.includes(platform)) {
    return res.status(404).json({ detail: "Unknown platform webhook." });
  }

  const comments = extractSocialComments(req.body || {});
  if (!comments.length) {
    return res.json({
      platform,
      ingested: 0,
      distribution: {},
      rows: [],
      detail: "No comment text found in webhook payload.",
    });
  }

  try {
    const pageId = String(req.body?.page_id || req.body?.object_id || "");
    const result = await ingestSocialComments(platform, pageId, comments, "webhook");
    return res.json({ ...result, rows: result.rows.slice(0, 120) });
  } catch (error) {
    return res.status(400).json({ detail: String(error.message || error) });
  }
}));

app.use("/api", (req, res) => {
  res.status(404).json({ detail: "Not Found" });
});

app.use((error, req, res, next) => {
  const statusCode = Number(error?.statusCode || error?.status || 500);
  const detail = String(error?.message || "Internal server error");
  res.status(statusCode).json({ detail });
});

export default app;

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  const isDirectRun = process.argv[1] && (
    process.argv[1].endsWith("api/index.js") ||
    process.argv[1].endsWith("api\\index.js")
  );
  if (isDirectRun) {
    const port = parsePort(process.env.PORT, 8010);
    const server = app.listen(port, () => {
      console.log(`Ramy Node API running on port ${port}`);
    });
    server.on("error", (error) => {
      console.error("Server failed to start:", error);
      process.exit(1);
    });
  }
}
