import re

from app.models import IocType

_IPV4 = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")
_IPV6 = re.compile(r"^[0-9a-fA-F:]{2,}:[0-9a-fA-F:]*$")
_HASH = re.compile(r"^[0-9a-fA-F]{32}$|^[0-9a-fA-F]{40}$|^[0-9a-fA-F]{64}$")
_URL = re.compile(r"^https?://", re.IGNORECASE)
_DNS = re.compile(r"^(?!\d+\.\d+\.\d+\.\d+$)[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)+$")


def detect_ioc_type(value: str) -> IocType | None:
    value = value.strip()
    if not value:
        return None
    if _URL.match(value):
        return "url"
    if _IPV4.match(value):
        return "ipv4"
    if _HASH.match(value):
        return "file_hash"
    if _IPV6.match(value) and value.count(":") >= 2:
        return "ipv6"
    if _DNS.match(value):
        return "dns"
    return None
