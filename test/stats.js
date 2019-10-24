#!/usr/bin/env node

'use strict';

const test = require('tape');

const Statistics = require('../lib/statistics.js');
const Hit = require('../lib/hit.js');

test('aggregate statistics', (t) => {
  const stat = new Statistics();

  stat.track(new Hit('127.0.0.1 - james [09/May/2018:16:00:39 +0000] "GET /report HTTP/1.0" 200 123'));
  stat.track(new Hit('127.0.0.1 - jill [09/May/2018:16:00:41 +0000] "GET /api/user HTTP/1.0" 200 234'));
  stat.track(new Hit('127.0.0.1 - frank [09/May/2018:16:00:42 +0000] "POST /api/user HTTP/1.0" 200 34'));
  stat.track(new Hit('127.0.0.1 - mary [09/May/2018:16:00:42 +0000] "POST /api/user HTTP/1.0" 503 12'));

  t.strictEqual(stat.total, 4);
  t.strictEqual(stat.methods.GET, 2);
  t.strictEqual(stat.methods.POST, 2);
  t.strictEqual(stat.methods.PUT, 0);

  t.strictEqual(stat.sections.get('/report'), 1);
  t.strictEqual(stat.sections.get('/api'), 3);
  t.strictEqual(stat.sections.get('/help'), undefined);

  t.strictEqual(stat.users.get('frank'), 1);
  t.strictEqual(stat.users.get('thomas'), undefined);

  t.strictEqual(stat.hosts.get('127.0.0.1'), 4);
  t.strictEqual(stat.hosts.get('foo'), undefined);

  t.end();
});
