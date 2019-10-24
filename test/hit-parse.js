#!/usr/bin/env node

'use strict';

const test = require('tape');

const Hit = require('../lib/hit.js');

test('basic hit parsing', (t) => {
  const hit = new Hit('127.0.0.1 - jill [09/May/2018:16:00:41 +0000] "GET /api/user HTTP/1.0" 200 234');
  t.strictEqual(hit.remotehost, '127.0.0.1');
  t.strictEqual(hit.rfc931, '-');
  t.strictEqual(hit.authuser, 'jill');
  t.strictEqual(hit.date, '09/May/2018:16:00:41 +0000');
  t.strictEqual(hit.request, 'GET /api/user HTTP/1.0');
  t.strictEqual(hit.status, 200);
  t.strictEqual(hit.bytes, 234);

  t.strictEqual(hit.request_method, 'GET');
  t.strictEqual(hit.request_path, '/api/user');
  t.strictEqual(hit.request_section, '/api');

  t.end();
});

test('basic hit parsing', (t) => {
  const hit = new Hit('127.0.0.1 - frank [09/May/2018:16:00:42 +0000] "POST /api/user HTTP/1.0" 100 0');
  t.strictEqual(hit.status, 100);
  t.strictEqual(hit.bytes, 0);
  t.strictEqual(hit.request_section, '/api');

  t.end();
});

test('query params long path', (t) => {
  const hit = new Hit('127.0.0.1 - mary [09/May/2018:16:00:42 +0000] "POST /api/user?foo=bar HTTP/1.0" 503 12');
  t.strictEqual(hit.request_section, '/api');

  t.end();
});

test('query params short path', (t) => {
  const hit = new Hit('127.0.0.1 - james [09/May/2018:16:00:39 +0000] "GET /report?foo HTTP/1.0" 200 123');
  t.strictEqual(hit.request_section, '/report');

  t.end();
});

test('quote inside path', (t) => {
  const hit = new Hit('127.0.0.1 - james [09/May/2018:16:00:39 +0000] "GET /report/\\"hello\\" HTTP/1.0" 200 123');
  t.strictEqual(hit.request_path, '/report/\\"hello\\"');

  t.end();
});
