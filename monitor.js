const fs = require('fs');

const Line = require('./line.js');
const Statistics = require('./statistics.js');
const POLL = 10_1000;

class Monitor {
  constructor(opts = {}) {
    this.threshold_rps = opts.threshold_rps || 10;
    this.log_path = opts.log_path || '/tmp/access.log';

    this.last_byte_offset = 0;
    this.fd = null;
    this.watcher = null;
    this.last_poll_buffer = null;
  }

  start(cb) {
    this.stop();
    this.watcher = fs.watchFile(
      this.log_path,
      {interval: POLL},
      this._fileChangeHandler
    );

    fs.open(this.log_path, (err, fd) => {
      if (err) {
        cb(err);
        return;
      }

      this.fd = fd;

      cb();
    });
  }

  _fileChangeHandler(current, previous) {
    console.log('stat handler', this);
    const start = previous.bytes;
    const end = current.bytes;

    const buffer = new Buffer();
    fs.read(this.fd, buffer, 0, end - start, start, (err, bytesRead, buf) => {
      if (err) {
        throw err;
      }
      if (bytesRead !== end - start) {
        throw new Error(`expected to read ${end - start}, actually read bytesRead`);
      }
      if (buffer !== buf) {
        throw new Error('buffers not equal');
      }

      console.log('NEW', buffer);
    });
  }

  stop() {
    if (!this.watcher) {
      return;
    }
    console.log('w', this.watcher);

    this.watcher.close();
    this.watcher = null;

    fs.close(this.fd, (err) => {
      if (err) {
        throw err;
      }
    });
    this.fd = null;
  }
}

module.exports = Monitor;
