const { randomUUID } = require("crypto");
const { runWithContext } = require("./context");
const transport = require("./service");

function middleware() {
    return (req, res, next) => {
        if (req.method === "GET" && req.path === "/health") {
            return res.status(200).json({ status: "ok" });
        }

        const traceId = randomUUID();
        const rootSpanId = randomUUID();
        const start = Date.now();

        runWithContext({
            traceId,
            currentSpan: rootSpanId
        }, () => {

            res.on("finish", () => {

    

                transport.pushTrace({
                    timestamp: new Date().toISOString(),
                    requestMethod: `controller:${req.method}`,
                    requestURL: req.originalUrl,
                    responseStatus: res.statusCode,
                    traceId,
                    spanId: rootSpanId,
                    parentSpanId: null,
                    durationMs: Date.now() - start
                });
            });

            next();
        });
    };
}

module.exports = middleware;