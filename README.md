# HTTP Log Parser

Tails and aggregates well-formed [W3C httpd logs](https://www.w3.org/Daemon/User/Config/Logging.html).

## Usage

For basic usage just execute the `main.js` script:

```sh
$ ./main.js <PATH_TO_LOGS=/tmp/access.log> <RPC_WARN_LIMIT=10>
```

The arguments are both optional.

To test, run the following:

```sh
$ npm test
```
