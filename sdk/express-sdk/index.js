const middleware = require("./middleware");
const service = require("./service");
const tracer = require("./tracer");
const log = require("./logger");

function upblit(apiKey) {
    service.init(apiKey);
    return middleware();
}

upblit.service = tracer.service;
upblit.controller = tracer.controller;
upblit.call = tracer.call;
upblit.log = log;

module.exports = upblit;