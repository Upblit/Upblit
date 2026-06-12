from __future__ import annotations

import asyncio
import inspect
import threading
import time
from collections.abc import Awaitable, Callable
from typing import Any, Optional, TypeVar
from uuid import uuid4

from .context import get_context
from .transport import Transport, TransportError
from .types import LogEntry, Trace, iso_now

T = TypeVar("T")

DEFAULT_BASE_URL = "https://ingest.upblit.dev"
DEFAULT_FLUSH_INTERVAL = 30.0


class SDK:
    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        flush_interval: float = DEFAULT_FLUSH_INTERVAL,
        transport: Optional[Transport] = None,
    ) -> None:
        self.api_key = api_key
        self.base_url = base_url.rstrip("/") or DEFAULT_BASE_URL
        self.flush_interval = flush_interval
        self.transport = transport or Transport()

        self._lock = threading.RLock()
        self._trace_buffer: list[Trace] = []
        self._log_buffer: list[LogEntry] = []
        self._stop = threading.Event()
        self._thread: Optional[threading.Thread] = None

        if flush_interval > 0:
            self._thread = threading.Thread(target=self._flush_loop, daemon=True)
            self._thread.start()

    def close(self) -> None:
        self._stop.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1)

    def _flush_loop(self) -> None:
        while not self._stop.wait(self.flush_interval):
            self.flush()

    def push_trace(self, trace: Trace) -> None:
        with self._lock:
            self._trace_buffer.append(trace)

    def push_log(self, entry: LogEntry, *, instant: bool = False) -> None:
        if instant:
            try:
                self._send_logs([entry])
            except TransportError:
                pass
            return

        with self._lock:
            self._log_buffer.append(entry)

    def flush(self) -> None:
        trace_error = None
        try:
            self.flush_traces()
        except TransportError as exc:
            trace_error = exc

        try:
            self.flush_logs()
        except TransportError as exc:
            if trace_error is None:
                trace_error = exc

        if trace_error is not None:
            raise trace_error

    def flush_traces(self) -> None:
        with self._lock:
            if not self._trace_buffer:
                return
            batch = list(self._trace_buffer)
            self._trace_buffer.clear()

        try:
            self._send_traces(batch)
        except TransportError:
            with self._lock:
                self._trace_buffer = batch + self._trace_buffer
            raise

    def flush_logs(self) -> None:
        with self._lock:
            if not self._log_buffer:
                return
            batch = list(self._log_buffer)
            self._log_buffer.clear()

        try:
            self._send_logs(batch)
        except TransportError:
            with self._lock:
                self._log_buffer = batch + self._log_buffer
            raise

    def _send_traces(self, traces: list[Trace]) -> None:
        self.transport.post_json(
            f"{self.base_url}/ingest/traces",
            self.api_key,
            {"timestamp": iso_now(), "traces": traces},
        )

    def _send_logs(self, logs: list[LogEntry]) -> None:
        self.transport.post_json(
            f"{self.base_url}/ingest/logs",
            self.api_key,
            {"timestamp": iso_now(), "logs": logs},
        )

    def log(self, level_or_message: str, message: Optional[str] = None) -> None:
        level = "info"
        text = level_or_message
        if message is not None:
            level = level_or_message
            text = message

        context = get_context()
        trace_id = context.trace_id if context else None
        timestamp = iso_now()
        entry = LogEntry(
            traceId=trace_id,
            level=level,
            type="app",
            message=text,
            timestamp=timestamp,
            clientTimestamp=timestamp,
        )
        self.push_log(entry, instant=level == "fatal")

    async def service(self, name: str, fn: Callable[[], T | Awaitable[T]]) -> T:
        return await self._span(f"service:{name}", fn)

    async def call(self, name: str, fn: Callable[[], T | Awaitable[T]]) -> T:
        return await self._span(f"external:{name}", fn)

    async def controller(self, name: str, fn: Callable[[], T | Awaitable[T]]) -> T:
        return await self._span(f"controller:{name}", fn)

    async def _span(self, name: str, fn: Callable[[], T | Awaitable[T]]) -> T:
        context = get_context()
        if context is None:
            return await _maybe_await(fn())

        span_id = str(uuid4())
        parent_span_id = context.current_span
        started = time.time()
        context.current_span = span_id

        status = 200
        try:
            return await _maybe_await(fn())
        except Exception:
            status = 500
            raise
        finally:
            self.push_trace(
                Trace(
                    timestamp=iso_now(),
                    requestMethod=name,
                    requestURL="",
                    responseStatus=status,
                    traceId=context.trace_id,
                    spanId=span_id,
                    parentSpanId=parent_span_id,
                    durationMs=int((time.time() - started) * 1000),
                )
            )
            context.current_span = parent_span_id


async def _maybe_await(value: T | Awaitable[T]) -> T:
    if inspect.isawaitable(value):
        return await value
    return value


_default_lock = threading.RLock()
_default_sdk: Optional[SDK] = None


def init(api_key: str, **kwargs: Any) -> SDK:
    global _default_sdk
    sdk = SDK(api_key, **kwargs)
    with _default_lock:
        if _default_sdk is not None:
            _default_sdk.close()
        _default_sdk = sdk
    return sdk


def default() -> SDK:
    global _default_sdk
    with _default_lock:
        if _default_sdk is None:
            _default_sdk = SDK("")
        return _default_sdk


def close() -> None:
    with _default_lock:
        if _default_sdk is not None:
            _default_sdk.close()


def flush() -> None:
    default().flush()


def log(level_or_message: str, message: Optional[str] = None) -> None:
    default().log(level_or_message, message)


async def service(name: str, fn: Callable[[], T | Awaitable[T]]) -> T:
    return await default().service(name, fn)


async def call(name: str, fn: Callable[[], T | Awaitable[T]]) -> T:
    return await default().call(name, fn)


async def controller(name: str, fn: Callable[[], T | Awaitable[T]]) -> T:
    return await default().controller(name, fn)
