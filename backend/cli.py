import json
import sys

from dotenv import load_dotenv

from app.enrichment import enrich_iocs
from app.ingestion import load_alerts


def main() -> None:
    load_dotenv()
    path = sys.argv[1] if len(sys.argv) > 1 else "sample_data/alerts.json"
    alerts = load_alerts(path)

    for alert in alerts:
        print(f"\n=== {alert.alert_id}: {alert.title} ===")
        enriched = enrich_iocs(alert.iocs)
        for item in enriched:
            print(json.dumps(item.model_dump(), indent=2))


if __name__ == "__main__":
    main()
