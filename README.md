# MSTICPy AI Toolkit

Next.js frontend + Python (msticpy) backend for ingesting alerts, enriching
IOCs via threat intel providers, and (eventually) generating MITRE
ATT&CK-mapped incident reports via OpenRouter.

## Running the app

You need both the backend and frontend running at the same time.

### 1. Backend (Python / msticpy)

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows (bash/zsh shell)
# .venv\Scripts\activate.bat    # Windows (cmd.exe)
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

cp .env.example .env
# edit .env and set VIRUSTOTAL_API_KEY

uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. See `backend/README.md` for details
(CLI usage, config format, next milestones).

### 2. Frontend (Next.js)

In a separate terminal, from the repo root:

```bash
cp .env.local.example .env.local
pnpm install
pnpm dev
```

Frontend runs at `http://localhost:3000` and proxies its `/api/*` routes to
the backend (`BACKEND_URL` in `.env.local`, defaults to
`http://localhost:8000`).

Open `http://localhost:3000` to test IOCs or upload alert data. If the
backend isn't running, the panels show an error with a retry button.

## Deploying

- **Frontend** → Vercel. Set `BACKEND_URL` to the deployed backend's public
  URL.
- **Backend** → Railway (or another platform that runs a persistent
  container, not serverless functions — msticpy's dependencies are too
  heavy for typical serverless size limits, and its streaming endpoint
  needs a long-lived process). See `backend/README.md` for the Railway
  setup steps.

## Adding components

To add shadcn/ui components to the app, run:

```bash
pnpm dlx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
