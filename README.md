# apollo-federation-service-outage-test

An Apollo gateway backed by two services, `foo` and `bar`. `foo` is flaky - for 10 seconds it throws errors, then it shuts down altogether.

## Usage

Start the gateway and backing services:

```console
$ yarn install
$ yarn start
```

In another console tab:

```console
$ yarn query
```

## Results

The gateway resolves the query, returning a 200 status code and including both `data` and `errors` in the response.

`data.foo` is `null` because of the failure to resolve, but `data.bar` is populated successfully.

`errors` includes the details of the failure.

### For the first 10 seconds, when `foo` throws an error

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 1344
ETag: W/"540-fSW2ujoVdiUxkjqDtBpGL1ycW8Q"
Date: Fri, 25 Sep 2020 13:30:00 GMT
Connection: keep-alive
```

```json
{
  "errors": [
    {
      "message": "💥",
      "path": [
        "foo"
      ],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "serviceName": "foo",
        "query": "{foo}",
        "variables": {},
        "exception": {
          "stacktrace": [
            "Error: 💥",
            "    at foo (/Users/andrew/zencargo/federation-test/index.js:15:17)",
            "    at field.resolve (/Users/andrew/zencargo/federation-test/node_modules/graphql-extensions/dist/index.js:134:26)",
            "    at field.resolve (/Users/andrew/zencargo/federation-test/node_modules/apollo-server-core/dist/utils/schemaInstrumentation.js:52:26)",
            "    at resolveFieldValueOrError (/Users/andrew/zencargo/federation-test/node_modules/graphql/execution/execute.js:502:18)",
            "    at resolveField (/Users/andrew/zencargo/federation-test/node_modules/graphql/execution/execute.js:460:16)",
            "    at executeFields (/Users/andrew/zencargo/federation-test/node_modules/graphql/execution/execute.js:297:18)",
            "    at executeOperation (/Users/andrew/zencargo/federation-test/node_modules/graphql/execution/execute.js:241:122)",
            "    at executeImpl (/Users/andrew/zencargo/federation-test/node_modules/graphql/execution/execute.js:119:14)",
            "    at Object.execute (/Users/andrew/zencargo/federation-test/node_modules/graphql/execution/execute.js:63:35)",
            "    at /Users/andrew/zencargo/federation-test/node_modules/apollo-server-core/dist/requestPipeline.js:249:48"
          ]
        }
      }
    }
  ],
  "data": {
    "foo": null,
    "bar": "bar"
  }
}
```

### After 10 seconds, when `foo` is down

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
Content-Length: 783
ETag: W/"30f-MZKDS9FEIPUpd7ZKWyXul2/Gzbc"
Date: Fri, 25 Sep 2020 13:49:20 GMT
Connection: keep-alive
```

```json
{
  "errors": [
    {
      "message": "request to http://localhost:4001/ failed, reason: connect ECONNREFUSED 127.0.0.1:4001",
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "exception": {
          "stacktrace": [
            "FetchError: request to http://localhost:4001/ failed, reason: connect ECONNREFUSED 127.0.0.1:4001",
            "    at ClientRequest.<anonymous> (/Users/andrew/zencargo/federation-test/node_modules/node-fetch/lib/index.js:1461:11)",
            "    at ClientRequest.emit (events.js:315:20)",
            "    at Socket.socketErrorListener (_http_client.js:426:9)",
            "    at Socket.emit (events.js:315:20)",
            "    at emitErrorNT (internal/streams/destroy.js:92:8)",
            "    at emitErrorAndCloseNT (internal/streams/destroy.js:60:3)",
            "    at processTicksAndRejections (internal/process/task_queues.js:84:21)"
          ]
        }
      }
    }
  ],
  "data": {
    "foo": null,
    "bar": "bar"
  }
}
```
