'use strict';

// Parses lines based on the W3C httpd logging format
// @see https://www.w3.org/Daemon/User/Config/Logging.html

class Line {
  #line;
  #cursor_l = 0;
  #cursor_r;

  constructor(line) {
    if (!line || typeof line !== 'string') {
      throw new TypeError('Line() constructor expects a string');
    }

    this.#line = line;
    this.#cursor_r = line.length;

    // First we move in from the left
    this._parseRemoteHost();
    this._parseRfc931();
    this._parseAuthUser();
    this._parseDate();

    // Next we move in from the right
    this._parseBytes();
    this._parseStatus();

    // Finish in the middle so we don't have to worry about quote escaping
    this._parseRequest();
  }

  _parseRemoteHost() {
    const end = this.#line.indexOf(' ', this.#cursor_l);
    this.remotehost = this.#line.substr(this.#cursor_l, end - this.#cursor_l);
    this.#cursor_l = end + 1; // eat space
  }

  _parseRfc931() {
    const end = this.#line.indexOf(' ', this.#cursor_l);
    this.rfc931 = this.#line.substr(this.#cursor_l, end - this.#cursor_l);
    this.#cursor_l = end + 1;
  }

  _parseAuthUser() {
    const end = this.#line.indexOf(' ', this.#cursor_l);
    this.authuser = this.#line.substr(this.#cursor_l, end - this.#cursor_l);
    this.#cursor_l = end + 1;
  }

  _parseDate() {
    const end = this.#line.indexOf('] ', this.#cursor_l);
    this.date = this.#line.substr(this.#cursor_l + 1, end - this.#cursor_l - 1);
    this.#cursor_l = end + 2; // eat bracket and space
  }

  _parseBytes() {
    const start = this.#line.lastIndexOf(' ', this.#cursor_r);
    this.bytes = Number(this.#line.substr(start + 1, this.#cursor_r - start));
    this.#cursor_r = start - 1;
  }

  _parseStatus() {
    const start = this.#line.lastIndexOf(' ', this.#cursor_r);
    this.status = Number(this.#line.substr(start + 1, this.#cursor_r - start));
    this.#cursor_r = start - 1;
  }

  _parseRequest() {
    this.request = this.#line.substr(this.#cursor_l + 1, this.#cursor_r - this.#cursor_l - 1);
    const method_path_separator = this.request.indexOf(' ');

    this.request_method = this.request.substr(0, method_path_separator).toUpperCase();

    this.request_path = this.request.substr(
      method_path_separator + 1,
      this.request.lastIndexOf(' ') - method_path_separator - 1
    );

    this.request_section = this.request_path.substr(
      0,
      this.request_path.indexOf('/', 1)
    ) || this.request_path;

    // There's an edge case if URL has a single segment and query params
    // Since there's no second slash
    if (this.request_section.includes('?')) {
      this.request_section = this.request_section.substr(
        0,
        this.request_section.indexOf('?')
      );
    }
  }
}

module.exports = Line;
