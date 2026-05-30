const { getContext } = require("./context");
const service = require("./service");

function log(levelOrMsg, msg) {
    const ctx = getContext();

    let level = "info";
    let message = levelOrMsg;

    if (msg !== undefined) {
        level = levelOrMsg;
        message = msg;
    }

    const logData = {
        traceId: ctx?.traceId || null,
        level,
        type: "app",
        message,
        timestamp: new Date(),
        clientTimestamp: new Date()
    };

    const isFatal = level === "fatal";

    service.pushLog(logData, isFatal);
}

module.exports = log;