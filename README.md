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
window.__API_BASE__ = "http://127.0.0.1:8000";
```
