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
$ npm install
$ npm test
```


## Try it Out

First, make a local access log file:

```sh
$ touch access.log
```

Next, run the tool with an RPS threshold of 2:

```sh
$ ./main.js access.log 2
```

In another tab, continuously generate 1 request per second:

```sh
$ watch -n1 ./trigger-1.sh
```

This can run for a while and you'll see data displayed in the main application.

In a third tab, go ahead and generate 4 requests per second:

```sh
$ watch -n1 ./trigger-4.sh
```

The throughput will then approach 5 requests per second. Once the total RPS over two minutes passes the 2 RPS threshold you'll see a message displayed.

Once the message has been displayed, kill the 4 RPS generator, and after enough time passes a message will be displayed that the high RPS threshold is no longer surpassed.


## Output

```
High traffic generated an alert - hits = 246 (2.0 r/s), triggered at 9:34:49 PM

### Global ###
  Total Hits    246
  Failures      99 (40.2%)
  Total Bytes   69,697
Methods:
  GET           148
  POST          98
  PUT           0
  DELETE        0
  PATCH         0
  HEAD          0
Sections:
  /report       99
  /api          147
Users:
  thomas        50
  james         49
  jill          49
  frank         49
  mary          49
Hosts:
  127.0.0.1     246

### Batch ###
  Total Hits    50
  Failures      20 (40.0%)
  Total Bytes   14,020
Methods:
  GET           30
  POST          20
  PUT           0
  DELETE        0
  PATCH         0
  HEAD          0
Sections:
  /report       20
  /api          30
Users:
  james         10
  jill          10
  frank         10
  mary          10
  thomas        10
Hosts:
  127.0.0.1     50
```


## Improvements

I would make the following improvements if this were a production application:

- The output is ugly and space inefficient. Since this is a terminal application I'd switch to something like `ncurses` to draw output to specified coordinates.

- When the access log changes the entire different is loaded into memory. So if 1MB of data is added every 10 seconds to a 100MB log file, this reads in the new 1MB of data all at once. Ideally I would specify a maximum buffer size, perhaps 100KB, and continuously read the file difference into the buffer, calculating the statistics and discarding the lines. This would keep memory usage from jumping so much.

- The code assumes at least one visit happens during the 10 second polling window. To make this more resilient I would move the display logic into a method called via `setInterval(fn, 10000)`. I would also set the `fs.watchFile()` interval to a lower value, perhaps 1 second.

