#!/usr/bin/env node

const Monitor = require('./monitor.js');

const monitor = new Monitor({
  threshold_rps: process.argv[3],
  log_path: process.argv[2]
});

monitor.start((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }

  console.log('running...');
});
