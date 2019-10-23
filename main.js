#!/usr/bin/env node

const Monitor = require('./monitor.js');

const monitor = new Monitor({
  threshold_rps: 20,
  log_path: './access.log'
});


console.log(monitor);
process.exit();

