const { randomUUID } = require("crypto");
const { getContext } = require("./context");
const transport = require("./service");

function span(name, fn) {
    const ctx = getContext();

    if (!ctx) {
        return fn ? fn() : undefined;
    }

    const spanId = randomUUID();
    const parentSpanId = ctx.currentSpan;
    const start = Date.now();

    ctx.currentSpan = spanId;

    const end = (status = 200) => {
        transport.pushTrace({
            timestamp:  new Date().toISOString(),
            requestMethod: name,
            requestURL: "",
            responseStatus: status,
            traceId: ctx.traceId,
            spanId,
            parentSpanId,
            durationMs:  new Date().toISOString() - start
        });

        ctx.currentSpan = parentSpanId;
    };

    try {
        const result = fn ? fn() : undefined;

        if (result && typeof result.then === "function") {
            return result
                .then((res) => {
                    end(200);
                    return res;
                })
                .catch((err) => {
                    end(500);
                    throw err;
                });
        }

        end(200);
        return result;

    } catch (err) {
        end(500);
        throw err;
    }
}

module.exports = {
    service: (name, fn) => span(`service:${name}`, fn),
    call: (name, fn) => span(`external:${name}`, fn)
};