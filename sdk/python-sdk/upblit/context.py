from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass
from typing import Optional


@dataclass
class TraceContext:
    trace_id: str
    current_span: str


_trace_context: ContextVar[Optional[TraceContext]] = ContextVar(
    "upblit_trace_context", default=None
)


def get_context() -> Optional[TraceContext]:
    return _trace_context.get()


def set_context(context: TraceContext):
    return _trace_context.set(context)


def reset_context(token) -> None:
    _trace_context.reset(token)
