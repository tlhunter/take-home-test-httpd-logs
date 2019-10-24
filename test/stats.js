#!/usr/bin/env node

'use strict';

const assert = require('assert');

const Statistics = require('../statistics.js');
const Line = require('../line.js');

{
  const stat = new Statistics();

  stat.track(new Line('127.0.0.1 - james [09/May/2018:16:00:39 +0000] "GET /report HTTP/1.0" 200 123'));
  stat.track(new Line('127.0.0.1 - jill [09/May/2018:16:00:41 +0000] "GET /api/user HTTP/1.0" 200 234'));
  stat.track(new Line('127.0.0.1 - frank [09/May/2018:16:00:42 +0000] "POST /api/user HTTP/1.0" 200 34'));
  stat.track(new Line('127.0.0.1 - mary [09/May/2018:16:00:42 +0000] "POST /api/user HTTP/1.0" 503 12'));

  assert.strictEqual(stat.total, 4);
  assert.strictEqual(stat.methods.GET, 2);
  assert.strictEqual(stat.methods.POST, 2);
  assert.strictEqual(stat.methods.PUT, 0);

  assert.strictEqual(stat.sections.get('/report'), 1);
  assert.strictEqual(stat.sections.get('/api'), 3);
  assert.strictEqual(stat.sections.get('/help'), undefined);

  assert.strictEqual(stat.users.get('frank'), 1);
  assert.strictEqual(stat.users.get('thomas'), undefined);

  assert.strictEqual(stat.hosts.get('127.0.0.1'), 4);
  assert.strictEqual(stat.hosts.get('foo'), undefined);
}
