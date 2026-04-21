# Frontend README (React + Vite)

## Purpose

The frontend provides a practical UI for:
- submitting Strategy and Implementation text
- viewing drift analysis results
- submitting human confirmation feedback
- exploring history and charts

## Stack

- React 18
- Vite 5
- Tailwind CSS
- Recharts
- i18next + react-i18next

## Scripts

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
```

## API Integration

Vite dev proxy is configured in `vite.config.js`:
- requests to `/api/*` are proxied to `http://localhost:8000`
- `/api` prefix is stripped before forwarding

## LLM Decision Transparency (UI)

This UI displays LLM-assisted analysis from the backend. It should be treated as decision support, not final authority.

- Findings are machine-generated under a constrained prompt.
- The UI includes human feedback submission to confirm/correct output.
- Teams should review high-impact results manually before acting.

## Expected Backend Endpoints

- `POST /analyze`
- `POST /feedback`
- `GET /history`
- `GET /feedback/disagreements`
- `GET /health`

## Development Notes

- Keep backend running on port 8000 during local frontend development.
- If API calls fail, verify proxy config and backend health endpoint.
- `frontend/requirements.txt` is only an npm dependency snapshot; use `package.json` as the source of truth.
