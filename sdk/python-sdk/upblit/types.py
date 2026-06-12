from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return utc_now().isoformat()


@dataclass
class Trace:
    timestamp: str
    requestMethod: str
    requestURL: str
    responseStatus: int
    traceId: str
    spanId: str
    parentSpanId: Optional[str]
    durationMs: int


@dataclass
class LogEntry:
    traceId: Optional[str]
    level: str
    type: str
    message: str
    timestamp: str
    clientTimestamp: str
