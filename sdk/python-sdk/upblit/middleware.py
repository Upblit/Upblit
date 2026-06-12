from __future__ import annotations

import json
import time
from collections.abc import Awaitable, Callable
from typing import Any
from uuid import uuid4

from .context import TraceContext, reset_context, set_context
from .sdk import SDK, default
from .types import Trace, iso_now

ASGIApp = Callable[[dict[str, Any], Callable[[], Awaitable[dict[str, Any]]], Callable[[dict[str, Any]], Awaitable[None]]], Awaitable[None]]


class UpblitMiddleware:
    def __init__(self, app: ASGIApp, sdk: SDK | None = None) -> None:
        self.app = app
        self.sdk = sdk or default()

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        method = scope.get("method", "")
        path = scope.get("path", "")
        if method == "GET" and path == "/health":
            await _send_health(send)
            return

        trace_id = str(uuid4())
        root_span_id = str(uuid4())
        started = time.time()
        status_code = 200
        token = set_context(TraceContext(trace_id=trace_id, current_span=root_span_id))

        async def send_wrapper(message: dict[str, Any]) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message.get("status", status_code)
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception:
            status_code = 500
            raise
        finally:
            self.sdk.push_trace(
                Trace(
                    timestamp=iso_now(),
                    requestMethod=f"controller:{method}",
                    requestURL=_request_url(scope),
                    responseStatus=status_code,
                    traceId=trace_id,
                    spanId=root_span_id,
                    parentSpanId=None,
                    durationMs=int((time.time() - started) * 1000),
                )
            )
            reset_context(token)


async def _send_health(send) -> None:
    body = json.dumps({"status": "ok"}).encode("utf-8")
    await send(
        {
            "type": "http.response.start",
            "status": 200,
            "headers": [
                (b"content-type", b"application/json"),
                (b"content-length", str(len(body)).encode("ascii")),
            ],
        }
    )
    await send({"type": "http.response.body", "body": body})


def _request_url(scope) -> str:
    path = scope.get("path") or ""
    query = scope.get("query_string") or b""
    if query:
        return f"{path}?{query.decode('latin-1')}"
    return path
