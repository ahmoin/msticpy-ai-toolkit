import json
from pathlib import Path

from app.models import Alert


def load_alerts(path: str | Path) -> list[Alert]:
    return parse_alerts(Path(path).read_text(encoding="utf-8"))


def parse_alerts(raw_json: str) -> list[Alert]:
    data = json.loads(raw_json)
    if isinstance(data, dict):
        data = [data]
    return [Alert.model_validate(item) for item in data]
