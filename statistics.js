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

  track(hit/*: Hit*/) {
    this.total++;
    this.bytes += hit.bytes;

    if (hit.status >= 400) {
      this.failures++;
    }

    if (hit.request_method in this.methods) {
      this.methods[hit.request_method]++;
    } else {
      console.error(`UNKNOWN METHOD: ${hit.request_method}`);
    }

    if (!this.sections.has(hit.request_section)) {
      this.sections.set(hit.request_section, 1);
    } else {
      this.sections.set(
        hit.request_section,
        this.sections.get(hit.request_section) + 1
      );
    }

    if (!this.users.has(hit.authuser)) {
      this.users.set(hit.authuser, 1);
    } else {
      this.users.set(
        hit.authuser,
        this.users.get(hit.authuser) + 1
      );
    }

    if (!this.hosts.has(hit.remotehost)) {
      this.hosts.set(hit.remotehost, 1);
    } else {
      this.hosts.set(
        hit.remotehost,
        this.hosts.get(hit.remotehost) + 1
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
