'use strict';

const fs = require('fs');

const Statistics = require('./statistics.js');
const Line = require('./line.js');
const POLL = 1_000;

class Monitor {
  #threshold_rps;
  #log_path;
  #last_byte_offset = 0;
  #fd = null;
  #watcher = null;
  #last_poll_buffer = null;
  #global_stats;

  constructor(opts = {}) {
    this.#threshold_rps = opts.threshold_rps || 10;
    this.#log_path = opts.log_path || '/tmp/access.log';

    this.#global_stats = new Statistics();
  }

  start(cb) {
    this.stop();
    this.#watcher = fs.watchFile(
      this.#log_path,
      {interval: POLL},
      this._fileChangeHandler.bind(this)
    );

    fs.open(this.#log_path, (err, fd) => {
      if (err) {
        cb(err);
        return;
      }

      this.#fd = fd;

      cb();
    });
  }

  _fileChangeHandler(current, previous) {
    const start = previous.size;
    const end = current.size;
    const length = end - start;

    const buffer = Buffer.alloc(length);
    fs.read(this.#fd, buffer, 0, length, start, (err) => {
      if (err) {
        throw err;
      }

      const hits = buffer.toString()
        .trim()
        .split('\n');
      const batch = new Statistics();

      for (let hit of hits) {
        const line = new Line(hit);
        this.#global_stats.track(line);
        batch.track(line);
      }

      this.#global_stats.print('Global');
      batch.print('Batch');
      console.log('\n');
    });
  }

  stop() {
    if (!this.#watcher) {
      return;
    }

    this.#watcher.close();
    this.#watcher = null;

    fs.close(this.#fd, (err) => {
      if (err) {
        throw err;
      }
    });
    this.#fd = null;
  }
}

module.exports = Monitor;
