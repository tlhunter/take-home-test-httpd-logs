#!/usr/bin/env node

const Line = require('../line.js');
const assert = require('assert');

{
  const line = new Line('127.0.0.1 - jill [09/May/2018:16:00:41 +0000] "GET /api/user HTTP/1.0" 200 234');
  assert.strictEqual(line.remotehost, '127.0.0.1');
  assert.strictEqual(line.rfc931, '-');
  assert.strictEqual(line.authuser, 'jill');
  assert.strictEqual(line.date, '09/May/2018:16:00:41 +0000');
  assert.strictEqual(line.request, 'GET /api/user HTTP/1.0');
  assert.strictEqual(line.status, 200);
  assert.strictEqual(line.bytes, 234);

  assert.strictEqual(line.request_method, 'GET');
  assert.strictEqual(line.request_path, '/api/user');
  assert.strictEqual(line.request_section, '/api');
}

{
  const line = new Line('127.0.0.1 - frank [09/May/2018:16:00:42 +0000] "POST /api/user HTTP/1.0" 100 0');
  assert.strictEqual(line.status, 100);
  assert.strictEqual(line.bytes, 0);
  assert.strictEqual(line.request_section, '/api');
}

{
  const line = new Line('127.0.0.1 - mary [09/May/2018:16:00:42 +0000] "POST /api/user HTTP/1.0" 503 12');
  assert.strictEqual(line.request_section, '/api');
}

{
  const line = new Line('127.0.0.1 - james [09/May/2018:16:00:39 +0000] "GET /report HTTP/1.0" 200 123');
  assert.strictEqual(line.request_section, '/report');
}
