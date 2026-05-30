const { AsyncLocalStorage } = require("async_hooks");

const store = new AsyncLocalStorage();

function runWithContext(data, cb) {
    store.run(data, cb);
}

function getContext() {
    return store.getStore();
}

module.exports = { runWithContext, getContext };