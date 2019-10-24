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

  hit(line/*: Line*/) {
    this.total++;

    if (line.request_method in this.methods) {
      this.methods[line.request_method]++;
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
}

module.exports = Statistics;
