import logging
import re
from contextlib import contextmanager

_REDACT = re.compile(r"(apikey|api_key|x-apikey)=[^&\s]+", re.IGNORECASE)


class _ListHandler(logging.Handler):
    def __init__(self) -> None:
        super().__init__()
        self.lines: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.lines.append(_REDACT.sub(r"\1=***", record.getMessage()))


@contextmanager
def capture_http_trace():
    """Capture the real outgoing HTTP request/response lines httpx logs for
    this block, with API keys redacted. Yields the list the lines land in."""
    handler = _ListHandler()
    logger = logging.getLogger("httpx")
    prev_level = logger.level
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)
    try:
        yield handler.lines
    finally:
        logger.removeHandler(handler)
        logger.setLevel(prev_level)
