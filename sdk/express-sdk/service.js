const axios = require("axios");
const { time } = require("node:console");

let API_KEY = null;
let traceBuffer = [];
let logBuffer = [];

const API_URL = "https://ingest.upblit.com";
const TRACE_URL = API_URL+"/ingest/traces";
const LOG_URL = API_URL+"/ingest/logs";

function init(key) {
    API_KEY = key;

    setInterval(flushTraces, 30000);
    setInterval(flushLogs, 30000);
}

async function flushTraces() {
    if (!traceBuffer.length) return;

    const batch = traceBuffer;
    traceBuffer = [];

    await axios.post(TRACE_URL, {
        timestamp:  new Date().toISOString(),
        traces: batch
    }, {
        headers: { "x-api-key": API_KEY }
    }).catch(() => traceBuffer.unshift(...batch));
}

async function flushLogs() {
    if (!logBuffer.length) return;

    const batch = logBuffer;
    logBuffer = [];

    await axios.post(LOG_URL, {
        timestamp: new Date().toISOString(),
        logs:batch}, {
        headers: { "x-api-key": API_KEY }
    }).catch(() => logBuffer.unshift(...batch));
}

function pushTrace(trace) {
    traceBuffer.push(trace);
}

function pushLog(log, instant = false) {
    if (instant) {
        return axios.post(LOG_URL,{timestamp: new Date().toISOString, logs: [log]}, {
            headers: { "x-api-key": API_KEY }
        }).catch(() => {});
    }
    logBuffer.push(log);
}

module.exports = {
    init,
    pushTrace,
    pushLog
};