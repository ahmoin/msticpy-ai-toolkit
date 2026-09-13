# Backend (msticpy pipeline)

Python service for ingesting alerts and enriching IOCs via msticpy. This is
milestone 1: ingest + enrich only (no LLM/report generation yet).

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt

cp .env.example .env
# edit .env and set VIRUSTOTAL_API_KEY
```

`msticpyconfig.yaml` is already tracked in this directory (it contains no
secret, just a pointer to the `VIRUSTOTAL_API_KEY` env var). msticpy reads it
from the current directory by default, so run all commands from `backend/`.

## Run the API

```bash
uvicorn app.main:app --reload
```

Then hit `GET /api/alerts/enrich` to ingest `sample_data/alerts.json` and
enrich its IOCs via VirusTotal.

## Run the CLI (no API layer)

```bash
python cli.py sample_data/alerts.json
```

## Deploying (Railway)

1. Create a new Railway service from this GitHub repo, with **root
   directory** set to `backend`.
2. Railway auto-detects Python via `requirements.txt`. The `Procfile` sets
   the start command (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
3. Add an environment variable: `VIRUSTOTAL_API_KEY`.
4. Deploy. Note the public URL Railway gives the service — you'll set this
   as `BACKEND_URL` on the Vercel-deployed frontend.

## Next milestones

- Timeline construction (`msticpy.vis`) and process trees.
- OpenRouter integration: send enriched telemetry + timeline as structured
  JSON, get back severity, affected assets, MITRE ATT&CK mapping, and a
  markdown/PDF remediation report.
- Next.js frontend calls this API to display enriched alerts and reports.
