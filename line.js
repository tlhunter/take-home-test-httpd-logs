class Line {
  constructor(line) {
    if (!line || typeof line !== 'string') {
      throw new TypeError('Line() constructor expects a string');
    }

    this.remotehost = '';
    this.rfc931 = ''; // always '-' with sample data
    this.authuser = '';
    this.date = '';
    this.request = '';
    this.status = -1;
    this.bytes = -1;

    this.request_method = '';
    this.request_path = '';
    this.request_section = ''; // might not belong here

    let cursor_l = 0;
    let cursor_r = line.length;

    // First we move in from the left

    { // remotehost
      const end = line.indexOf(' ', cursor_l);
      this.remotehost = line.substr(cursor_l, end - cursor_l);
      cursor_l = end + 1; // eat space
    }

    { // rfc931
      const end = line.indexOf(' ', cursor_l);
      this.rfc931 = line.substr(cursor_l, end - cursor_l);
      cursor_l = end + 1;
    }

    { // authuser
      const end = line.indexOf(' ', cursor_l);
      this.authuser = line.substr(cursor_l, end - cursor_l);
      cursor_l = end + 1;
    }

    { // date
      const end = line.indexOf('] ', cursor_l);
      this.date = line.substr(cursor_l + 1, end - cursor_l - 1);
      cursor_l = end + 2; // eat bracket and space
    }

    // Next we move in from the right

    { // bytes
      const start = line.lastIndexOf(' ', cursor_r);
      this.bytes = Number(line.substr(start + 1, cursor_r - start));
      cursor_r = start - 1;
    }

    { // status
      const start = line.lastIndexOf(' ', cursor_r);
      this.status = Number(line.substr(start + 1, cursor_r - start));
      cursor_r = start - 1;
    }

    // Finish in the middle
    // (This way we don't have to worry about weird symbols in path)

    { // request
      this.request = line.substr(cursor_l + 1, cursor_r - cursor_l - 1);
      const method_path_separator = this.request.indexOf(' ');

      this.request_method = this.request.substr(0, method_path_separator);

      this.request_path = this.request.substr(
        method_path_separator + 1,
        this.request.lastIndexOf(' ') - method_path_separator - 1
      );

      // Attempting to avoid the cost of url.parse()
      this.request_section = this.request_path.substr(
        0,
        this.request_path.indexOf('/', 1)
      ) || this.request_path; // TODO: /foo?bar=1
    }
  }
}

module.exports = Line;
