import json

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import ValidationError

load_dotenv()

from app.enrichment import enrich_iocs
from app.ingestion import load_alerts, parse_alerts
from app.ioc_detect import detect_ioc_type
from app.models import EnrichedAlert, Ioc, IocLookupRequest, IocLookupResult
from app.trace import capture_http_trace

app = FastAPI(title="msticpy-ai-toolkit backend")

SAMPLE_ALERTS_PATH = "sample_data/alerts.json"


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


def _enrich_alerts(alerts: list) -> list[EnrichedAlert]:
    enriched_alerts: list[EnrichedAlert] = []
    for alert in alerts:
        enriched_iocs = enrich_iocs(alert.iocs)
        enriched_alerts.append(
            EnrichedAlert(
                alert_id=alert.alert_id,
                timestamp=alert.timestamp,
                title=alert.title,
                severity=alert.severity,
                host=alert.host,
                description=alert.description,
                enriched_iocs=enriched_iocs,
            )
        )
    return enriched_alerts


@app.get("/api/alerts/enrich", response_model=list[EnrichedAlert])
def enrich_sample_alerts() -> list[EnrichedAlert]:
    try:
        alerts = load_alerts(SAMPLE_ALERTS_PATH)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return _enrich_alerts(alerts)


@app.post("/api/alerts/upload", response_model=list[EnrichedAlert])
def upload_alerts(file: UploadFile) -> list[EnrichedAlert]:
    raw = file.file.read().decode("utf-8")
    try:
        alerts = parse_alerts(raw)
    except (ValueError, ValidationError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid alert file: {exc}") from exc

    return _enrich_alerts(alerts)


@app.post("/api/iocs/lookup", response_model=list[IocLookupResult])
def lookup_iocs(request: IocLookupRequest) -> list[IocLookupResult]:
    results: list[IocLookupResult] = []

    for raw_value in request.values:
        value = raw_value.strip()
        if not value:
            continue

        ioc_type = detect_ioc_type(value)
        if ioc_type is None:
            results.append(
                IocLookupResult(value=value, ioc_type=None, error="Could not detect IOC type")
            )
            continue

        enriched = enrich_iocs([Ioc(ioc_type=ioc_type, value=value)])
        results.append(
            IocLookupResult(
                value=value,
                ioc_type=ioc_type,
                enriched=enriched[0] if enriched else None,
            )
        )

    return results


@app.post("/api/iocs/lookup/stream")
def lookup_iocs_stream(request: IocLookupRequest) -> StreamingResponse:
    def generate():
        def emit(event: dict) -> str:
            return json.dumps(event) + "\n"

        for raw_value in request.values:
            value = raw_value.strip()
            if not value:
                continue

            yield emit(
                {"event": "log", "message": f">>> detect_ioc_type({value!r})", "kind": "call"}
            )
            ioc_type = detect_ioc_type(value)

            if ioc_type is None:
                yield emit(
                    {"event": "log", "message": "<<< None (type not recognized)", "kind": "return"}
                )
                yield emit(
                    {
                        "event": "result",
                        "result": IocLookupResult(
                            value=value, ioc_type=None, error="Could not detect IOC type"
                        ).model_dump(),
                    }
                )
                continue

            yield emit({"event": "log", "message": f"<<< {ioc_type!r}", "kind": "return"})
            yield emit(
                {
                    "event": "log",
                    "message": f">>> TILookup().lookup_ioc(observable={value!r}, ioc_type={ioc_type!r})",
                    "kind": "call",
                }
            )

            with capture_http_trace() as trace_lines:
                enriched = enrich_iocs([Ioc(ioc_type=ioc_type, value=value)])

            for line in trace_lines:
                yield emit({"event": "log", "message": line, "kind": "http"})

            result = IocLookupResult(
                value=value,
                ioc_type=ioc_type,
                enriched=enriched[0] if enriched else None,
            )

            if result.enriched:
                yield emit(
                    {
                        "event": "log",
                        "message": (
                            f"<<< severity={result.enriched.severity!r} "
                            f"provider={result.enriched.provider!r}"
                        ),
                        "kind": "return",
                    }
                )
            else:
                yield emit({"event": "log", "message": "<<< no provider response", "kind": "return"})

            yield emit({"event": "result", "result": result.model_dump()})

        yield emit({"event": "done"})

    return StreamingResponse(generate(), media_type="application/x-ndjson")
