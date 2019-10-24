#!/usr/bin/env node

'use strict';

const test = require('tape');

const Monitor = require('../lib/monitor.js');

test('test high traffic alert threshold', (t) => {
  const monitor = new Monitor({
    threshold_rps: 3
  });

  for (let i = 0; i < 12; i++) {
    // _checkAlerts() is called every 10 seconds
    // so we send 30 alerts to average 3 per second
    t.equal(monitor._checkAlerts(30), '', 'no alerts as we approach RPS threshold');
  }

  t.equal(monitor._checkAlerts(30), '', 'no messages even after rollover');

  t.ok(monitor._checkAlerts(31).includes('High traffic generated an alert'), 'alert was given');

  t.ok(monitor._checkAlerts(1).includes('High traffic has passed'), 'alert went away');

  t.equal(monitor._checkAlerts(1), '', 'still low traffic');

  t.end();
});
