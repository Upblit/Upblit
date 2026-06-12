from __future__ import annotations

import json
from dataclasses import asdict, is_dataclass
from typing import Any
from urllib.error import HTTPError
from urllib.request import Request, urlopen


class TransportError(Exception):
    pass


def to_jsonable(value: Any) -> Any:
    if is_dataclass(value):
        return asdict(value)
    if isinstance(value, list):
        return [to_jsonable(item) for item in value]
    if isinstance(value, dict):
        return {key: to_jsonable(item) for key, item in value.items()}
    return value


class Transport:
    def post_json(self, url: str, api_key: str, payload: dict[str, Any]) -> None:
        body = json.dumps(to_jsonable(payload)).encode("utf-8")
        request = Request(
            url,
            data=body,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
            },
        )

        try:
            with urlopen(request, timeout=10) as response:
                status = response.status
        except HTTPError as exc:
            status = exc.code
        except OSError as exc:
            raise TransportError("upblit: ingestion request failed") from exc

        if status < 200 or status >= 300:
            raise TransportError("upblit: ingestion request failed with non-2xx status")
