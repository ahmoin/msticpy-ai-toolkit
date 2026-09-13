from typing import Literal

from pydantic import BaseModel

IocType = Literal["ipv4", "ipv6", "dns", "file_hash", "url"]


class Ioc(BaseModel):
    ioc_type: IocType
    value: str


class Alert(BaseModel):
    alert_id: str
    timestamp: str
    title: str
    severity: Literal["low", "medium", "high", "critical"]
    host: str
    description: str
    iocs: list[Ioc]


class EnrichedIoc(BaseModel):
    ioc_type: IocType
    value: str
    provider: str
    severity: str | None = None
    details: dict
    raw_result_available: bool


class EnrichedAlert(BaseModel):
    alert_id: str
    timestamp: str
    title: str
    severity: str
    host: str
    description: str
    enriched_iocs: list[EnrichedIoc]


class IocLookupRequest(BaseModel):
    values: list[str]


class IocLookupResult(BaseModel):
    value: str
    ioc_type: IocType | None
    error: str | None = None
    enriched: EnrichedIoc | None = None
