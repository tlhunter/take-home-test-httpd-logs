'use strict';

const COLOR_GREEN = '\x1b[32m';
const COLOR_RESET = '\x1b[0m';

class Statistics {
  constructor() {
    this.total = 0;
    this.failures = 0;
    this.bytes = 0;
    this.methods = {
      GET: 0,
      POST: 0,
      PUT: 0,
      DELETE: 0,
      PATCH: 0,
      HEAD: 0
    };
    this.sections = new Map();
    this.users = new Map();
    this.hosts = new Map();
  }

  track(line/*: Line*/) {
    this.total++;
    this.bytes += line.bytes;

    if (line.status >= 400) {
      this.failures++;
    }

    if (line.request_method in this.methods) {
      this.methods[line.request_method]++;
    } else {
      console.error(`UNKNOWN METHOD: ${line.request_method}`);
    }

    if (!this.sections.has(line.request_section)) {
      this.sections.set(line.request_section, 1);
    } else {
      this.sections.set(
        line.request_section,
        this.sections.get(line.request_section) + 1
      );
    }

    if (!this.users.has(line.authuser)) {
      this.users.set(line.authuser, 1);
    } else {
      this.users.set(
        line.authuser,
        this.users.get(line.authuser) + 1
      );
    }

    if (!this.hosts.has(line.remotehost)) {
      this.hosts.set(line.remotehost, 1);
    } else {
      this.hosts.set(
        line.remotehost,
        this.hosts.get(line.remotehost) + 1
      );
    }
  }

  print(title) {
    console.log();
    console.log(`### ${title} ###`);
    printCols('Total Hits', this.total);
    printCols('Failures', `${this.failures} (${(this.failures / this.total * 100).toFixed(1)}%)`);
    printCols('Total Bytes', this.bytes.toLocaleString());

    console.log('Methods:');
    for (let key in this.methods) {
      printCols(key, this.methods[key]);
    }

    console.log('Sections:');
    for (let [key, value] of this.sections.entries()) {
      printCols(key, value);
    }

    console.log('Users:');
    for (let [key, value] of this.users.entries()) {
      printCols(key, value);
    }

    console.log('Hosts:');
    for (let [key, value] of this.hosts.entries()) {
      printCols(key, value);
    }
  }
}

function printCols(left, right) {
  console.log(`  ${COLOR_GREEN}${left.padEnd(12, ' ')}${COLOR_RESET}\t${right}`);
}

module.exports = Statistics;
