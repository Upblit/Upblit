# upblit-fastapi

`upblit-fastapi` is a small Python SDK for FastAPI and ASGI applications. It mirrors the Express SDK behavior: request tracing, trace context, app logs, in-memory batching, and ingestion to Upblit.

## Installation

```bash
pip install upblit-fastapi
```

## FastAPI Quick Setup

```python
from fastapi import FastAPI
import upblit
from upblit import UpblitMiddleware

sdk = upblit.init("<YOUR_TOKEN>")

app = FastAPI()
app.add_middleware(UpblitMiddleware, sdk=sdk)


@app.get("/users/{user_id}")
async def get_user(user_id: str):
    async def load_user():
        upblit.log("info", "user loaded")
        return {"id": user_id, "name": "Ada"}

    return await upblit.service("users.getById", load_user)
```

That is enough to enable observation.

## What It Does

- Creates a trace for each incoming HTTP request.
- Exposes a built-in `GET /health` endpoint that returns `{ "status": "ok" }`.
- Buffers traces and logs in memory and flushes them every 30 seconds.
- Sends trace data to `https://ingest.upblit.com/ingest/traces`.
- Sends log data to `https://ingest.upblit.com/ingest/logs`.
- Sends `fatal` logs immediately.

## API

```python
sdk = upblit.init("<YOUR_TOKEN>")

await upblit.service("name", fn)
await upblit.call("name", fn)
await upblit.controller("name", fn)

upblit.log("message")
upblit.log("fatal", "something failed")
upblit.flush()
upblit.close()
```

### `UpblitMiddleware`

ASGI middleware for FastAPI or Starlette-style apps.

```python
app.add_middleware(UpblitMiddleware, sdk=sdk)
```

### `service(name, fn)`

Wraps internal application work in a `service:<name>` span. `fn` may be sync or async.

### `call(name, fn)`

Wraps external or downstream work in an `external:<name>` span. `fn` may be sync or async.

### `log(message)` and `log(level, message)`

Records an app log in the current trace context. If the level is `fatal`, the log is sent immediately.

## Configuration

```python
sdk = upblit.init(
    "<YOUR_TOKEN>",
    base_url="https://ingest.upblit.com",
    flush_interval=30,
)
```

Set `flush_interval=0` in tests or short-lived tools to disable the background flusher and call `upblit.flush()` manually.

## Notes

- Telemetry is buffered in memory.
- Requests to `/health` are excluded from tracing.
- If ingestion is unavailable, buffered telemetry is restored and retried on the next flush.
- Call `upblit.close()` during application shutdown to stop the background flusher.
