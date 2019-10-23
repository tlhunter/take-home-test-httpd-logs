const fs = require('fs');

const Line = require('./line.js');

class Monitor {
  constructor(opts = {}) {
    this.threshold_rps = opts.threshold_rps || 10;
    this.log_path = opts.log_path || '/tmp/access.log';

    this.watcher = null;

    this.start();
  }

  start() {
    this.stop();
    this.watcher = fs.watch(this.log_path, this._handler);
  }

  _handler(eventType, content) {
    console.log('handler', eventType, content);
  }

  stop() {
    if (!this.watcher) {
      return;
    }
    this.watcher.close();
    this.watcher = null;
  }

  static parse(line) {
  }
}

module.exports = Monitor;
