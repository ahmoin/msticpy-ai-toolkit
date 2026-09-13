# Backend (msticpy pipeline)

Python service for ingesting alerts and enriching IOCs via msticpy. This is
milestone 1: ingest + enrich only (no LLM/report generation yet).

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt

cp msticpyconfig.yaml.example msticpyconfig.yaml
cp .env.example .env
# edit .env and set VIRUSTOTAL_API_KEY
```

msticpy reads `msticpyconfig.yaml` from the current directory by default, so
run all commands from `backend/`.

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

## Next milestones

- Timeline construction (`msticpy.vis`) and process trees.
- OpenRouter integration: send enriched telemetry + timeline as structured
  JSON, get back severity, affected assets, MITRE ATT&CK mapping, and a
  markdown/PDF remediation report.
- Next.js frontend calls this API to display enriched alerts and reports.
