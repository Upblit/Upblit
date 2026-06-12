import asyncio
import unittest

from upblit import SDK, UpblitMiddleware
from upblit.transport import TransportError


class RecordingTransport:
    def __init__(self, fail=False):
        self.fail = fail
        self.requests = []

    def post_json(self, url, api_key, payload):
        self.requests.append((url, api_key, payload))
        if self.fail:
            raise TransportError("failed")


async def run_asgi(app, method="GET", path="/users/1", query_string=b"active=true"):
    messages = []

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        messages.append(message)

    scope = {
        "type": "http",
        "method": method,
        "path": path,
        "query_string": query_string,
    }
    await app(scope, receive, send)
    return messages


class SDKTests(unittest.TestCase):
    def test_health_does_not_trace(self):
        async def scenario():
            sdk = SDK("token", flush_interval=0)

            async def app(scope, receive, send):
                raise AssertionError("health should not call app")

            messages = await run_asgi(UpblitMiddleware(app, sdk=sdk), path="/health", query_string=b"")

            self.assertEqual(messages[0]["status"], 200)
            self.assertEqual(sdk._trace_buffer, [])

        asyncio.run(scenario())

    def test_request_service_call_and_log_are_recorded(self):
        async def scenario():
            sdk = SDK("token", flush_interval=0)

            async def app(scope, receive, send):
                async def load_user():
                    sdk.log("info", "user loaded")

                    async def query_db():
                        return "ok"

                    await sdk.call("database", query_db)
                    return {"id": 1}

                await sdk.service("users.get", load_user)
                await send({"type": "http.response.start", "status": 201, "headers": []})
                await send({"type": "http.response.body", "body": b""})

            await run_asgi(UpblitMiddleware(app, sdk=sdk))

            self.assertEqual(
                [trace.requestMethod for trace in sdk._trace_buffer],
                ["external:database", "service:users.get", "controller:GET"],
            )
            self.assertEqual(sdk._trace_buffer[-1].requestURL, "/users/1?active=true")
            self.assertEqual(sdk._trace_buffer[-1].responseStatus, 201)
            self.assertEqual(len(sdk._log_buffer), 1)
            self.assertEqual(sdk._log_buffer[0].traceId, sdk._trace_buffer[-1].traceId)

        asyncio.run(scenario())

    def test_flush_posts_telemetry(self):
        transport = RecordingTransport()
        sdk = SDK("token", base_url="http://ingest.test", flush_interval=0, transport=transport)
        sdk_trace = sdk_trace_factory()
        sdk.push_trace(sdk_trace)
        sdk.log("hello")

        sdk.flush()

        self.assertEqual(transport.requests[0][0], "http://ingest.test/ingest/traces")
        self.assertEqual(transport.requests[0][1], "token")
        self.assertEqual(transport.requests[1][0], "http://ingest.test/ingest/logs")
        self.assertEqual(sdk._trace_buffer, [])
        self.assertEqual(sdk._log_buffer, [])
        self.assertEqual(sdk_trace.traceId, "trace")

    def test_failed_flush_restores_batch(self):
        transport = RecordingTransport(fail=True)
        sdk = SDK("token", base_url="http://ingest.test", flush_interval=0, transport=transport)
        sdk.push_trace(sdk_trace_factory())

        with self.assertRaises(TransportError):
            sdk.flush_traces()

        self.assertEqual(len(sdk._trace_buffer), 1)

    def test_fatal_log_sends_immediately(self):
        transport = RecordingTransport()
        sdk = SDK("token", base_url="http://ingest.test", flush_interval=0, transport=transport)

        sdk.log("fatal", "boom")

        self.assertEqual(transport.requests[0][0], "http://ingest.test/ingest/logs")
        self.assertEqual(transport.requests[0][2]["logs"][0].level, "fatal")
        self.assertEqual(sdk._log_buffer, [])


def sdk_trace_factory():
    from upblit.types import Trace

    return Trace(
        timestamp="now",
        requestMethod="controller:GET",
        requestURL="/",
        responseStatus=200,
        traceId="trace",
        spanId="span",
        parentSpanId=None,
        durationMs=1,
    )


if __name__ == "__main__":
    unittest.main()
