# upblit-express

`upblit-express` is a small Express middleware package that adds request tracing and log collection to an app using an Upblit API key.

It automatically records incoming requests, creates trace context for downstream work, and batches traces and logs to the local ingestion service.

## Installation

```bash
npm install upblit-express
```

---

## 📌 Prerequisites

1. Create an Express application at https://upblit.dev
2. Generate your observation token from the dashboard

---

## ⚡ Quick Setup

Add the middleware to your Express app.

```js
const upblit = require("upblit-express");

app.use(upblit("<YOUR_TOKEN>"));
```

That’s it. Observation is now enabled.

---

## 🧠 How It Works

`upblit-express` adds monitoring and observation capabilities to your Express application using your Upblit token. Once connected, your app automatically starts sending observation data to Upblit.

---

## 🧩 Example

```js
const express = require("express");
const upblit = require("upblit-express");

const app = express();

app.use(upblit("<YOUR_API_KEY>"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000);
```

## What It Does

- Creates a trace for each incoming request.
- Exposes a built-in `GET /health` endpoint that returns `{ "status": "ok" }`.
- Buffers traces and logs in memory and flushes them every 30 seconds.
- Sends trace data to `http://ingest.upblit.dev/ingest/traces`.
- Sends log data to `http://ingest.upblit.dev/ingest/logs`.

## API

The default export is the middleware setup function:

```js
const upblit = require("upblit-express");

app.use(upblit("<YOUR_API_KEY>"));
```

The package also exposes helpers for tracing and logging:

```js
upblit.service(name, fn);
upblit.call(name, fn);
upblit.log(message);
upblit.log(level, message);
```

### `upblit.service(name, fn)`

Wraps internal application work in a service span.

### `upblit.call(name, fn)`

Wraps external or downstream calls in a span.

### `upblit.log(message)`

Records an `info` log message in the current trace context.

### `upblit.log(level, message)`

Records a log message with an explicit level. If `level` is `fatal`, the log is sent immediately.

## Example

```js
const express = require("express");
const upblit = require("upblit-express");

const app = express();

app.use(upblit("<YOUR_API_KEY>"));

app.get("/users/:id", async (req, res) => {
  const user = await upblit.service("users.getById", async () => {
    return { id: req.params.id, name: "Ada" };
  });

  upblit.log("info", "user loaded");
  res.json(user);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
```

## Notes

- The middleware currently uses an in-memory buffer for telemetry.
- Requests to `/health` are excluded from tracing.
- If the ingestion service is unavailable, the SDK keeps buffered telemetry and retries on the next flush.

## Support

For issues or feature requests, please open an issue in the repository.
