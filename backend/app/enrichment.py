import pandas as pd
from msticpy.context.tilookup import TILookup

from app.models import EnrichedIoc, Ioc

_IOC_TYPE_MAP = {
    "ipv4": "ipv4",
    "ipv6": "ipv6",
    "dns": "dns",
    "file_hash": "file_hash",
    "url": "url",
}


def enrich_iocs(iocs: list[Ioc], ti_lookup: TILookup | None = None) -> list[EnrichedIoc]:
    ti_lookup = ti_lookup or TILookup()
    enriched: list[EnrichedIoc] = []

    for ioc in iocs:
        result_df = ti_lookup.lookup_ioc(
            observable=ioc.value, ioc_type=_IOC_TYPE_MAP[ioc.ioc_type]
        )
        if isinstance(result_df, tuple):
            result_df = result_df[1]

        if not isinstance(result_df, pd.DataFrame) or result_df.empty:
            enriched.append(
                EnrichedIoc(
                    ioc_type=ioc.ioc_type,
                    value=ioc.value,
                    provider="unknown",
                    severity=None,
                    details={},
                    raw_result_available=False,
                )
            )
            continue

        for _, row in result_df.iterrows():
            enriched.append(
                EnrichedIoc(
                    ioc_type=ioc.ioc_type,
                    value=ioc.value,
                    provider=str(row.get("Provider", "unknown")),
                    severity=row.get("Severity"),
                    details=_safe_details(row.get("Details")),
                    raw_result_available=bool(row.get("RawResult")),
                )
            )

    return enriched


def _safe_details(details: object) -> dict:
    if isinstance(details, dict):
        return details
    return {}
