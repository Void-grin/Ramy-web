# Ramy-web

Standalone frontend (no Python) using React UMD + Babel for runtime rendering.

## Run

```bash
cd frontend
npm install
npm run dev
```

Default URL: `http://127.0.0.1:5173`

The frontend sends API requests to `window.__API_BASE__` configured in `frontend/index.html`.
By default:

```html
window.__API_BASE__ = "http://127.0.0.1:8010";
```

## Deploy on Vercel

1. Push this frontend folder to its own repo.
2. In Vercel: `Add New Project` -> import frontend repo.
3. Framework preset: `Other` (static).
4. Build command: leave empty.
5. Output directory: leave empty (root static files).
6. Deploy.

After deploy, update API base in `index.html` to Railway URL:

```html
window.__API_BASE__ = "https://your-railway-backend.up.railway.app";
```

Then redeploy frontend.
