'use strict';

const fs = require('fs');

const Statistics = require('./statistics.js');
const Hit = require('./hit.js');

const DEFAULT_THRESHOLD_RPS = 10;
const DEFAULT_LOG_PATH = '/tmp/access.log';
const POLL_SECONDS = 10;
const ALERT_RANGE_SECONDS = 2 * 60;

const COLOR_RED = '\x1b[31m';
const COLOR_CYAN = '\x1b[36m';
const COLOR_RESET = '\x1b[0m';

class Monitor {
  #threshold_rps;
  #log_path;
  #last_byte_offset = 0;
  #fd = null;
  #watcher = null;
  #last_poll_buffer = null;
  #global_stats;

  #alert_mode = false;
  #alert_ring_buffer = new Array(Math.ceil(ALERT_RANGE_SECONDS / POLL_SECONDS)).fill(0);
  #alert_ring_cursor = 0;

  constructor(opts = {}) {
    this.#threshold_rps = opts.threshold_rps || DEFAULT_THRESHOLD_RPS;
    this.#log_path = opts.log_path || DEFAULT_LOG_PATH;

    this.#global_stats = new Statistics();
  }

  start(cb) {
    this.stop();
    this.#watcher = fs.watchFile(
      this.#log_path,
      {interval: POLL_SECONDS * 1_000},
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
        hit = new Hit(hit);
        this.#global_stats.track(hit);
        batch.track(hit);
      }

      console.log(this._checkAlerts(hits.length));

      this.#global_stats.print('Global');
      batch.print('Batch');
      console.log('\n');
    });
  }

  stop() {
    if (!this.#watcher) {
      return;
    }

    fs.unwatchFile(this.#log_path, this.#watcher);
    this.#watcher = null;

    this.#alert_mode = false;

    fs.close(this.#fd, (err) => {
      if (err) {
        throw err;
      }
    });
    this.#fd = null;
  }

  _checkAlerts(alert_count) {
    let response = '';

    if (this.#alert_ring_cursor >= this.#alert_ring_buffer.length) {
      this.#alert_ring_cursor = 0;
    }

    this.#alert_ring_buffer[this.#alert_ring_cursor] = alert_count;

    this.#alert_ring_cursor++;

    const recent_hits = this.#alert_ring_buffer.reduce((a, b) => a + b);
    const rps = recent_hits / this.#alert_ring_buffer.length / POLL_SECONDS;

    if (rps > this.#threshold_rps) {
      this.#alert_mode = true;
      response += `${COLOR_RED}High traffic generated an alert - hits = ${recent_hits} (${rps.toFixed(1)} r/s), triggered at ${(new Date()).toLocaleTimeString()}${COLOR_RESET}\n`;
    } else if (this.#alert_mode) {
      this.#alert_mode = false;
      response += `${COLOR_CYAN}High traffic has passed${COLOR_RESET}`;
    }

    return response;
  }
}

module.exports = Monitor;
