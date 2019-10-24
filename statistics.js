class Statistics {
  constructor() {
    this.total = 0;
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
  console.log(`  \x1b[32m${left.padEnd(12, ' ')}\x1b[0m\t${right}`);
}

module.exports = Statistics;
