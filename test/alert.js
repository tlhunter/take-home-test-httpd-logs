#!/usr/bin/env node

'use strict';

const Monitor = require('../monitor.js');
const assert = require('assert');

const messages = [];

const monitor = new Monitor({
  threshold_rps: 3
});

stub();

// This will set the RPS to exactly three
for (let i = 0; i < 12; i++) {
  // _checkAlerts() is called every 10 seconds
  // so we send 30 alerts to average 3 per second
  monitor._checkAlerts(30);
}

assert.strictEqual(messages.length, 0);

// Should still be three
monitor._checkAlerts(30);

assert.strictEqual(messages.length, 0);

// Should now be slightly over three
monitor._checkAlerts(31);

assert.strictEqual(messages.length, 1);
assert.ok(messages[0].includes('High traffic generated an alert'));

// Should now be below threshold
monitor._checkAlerts(1);

assert.strictEqual(messages.length, 2);
assert.ok(messages[1].includes('High traffic has passed'));

// Still below threshold, but won't make a new message
monitor._checkAlerts(1);

assert.strictEqual(messages.length, 2);

// restore();

function stub() {
  global.CONSOLE_LOG_BACKUP = global.console.log;
  global.console.log = (message) => {
    messages.push(message);
  };
}

function restore() {
  global.console.log = global.CONSOLE_LOG_BACKUP;
  delete global.CONSOLE_LOG_BACKUP;
}
