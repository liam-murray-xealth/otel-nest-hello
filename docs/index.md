# OTEL demo

This project demonstrates a Nest.js service configured for traces and metrics using the [OTEL SDK for node](https://www.npmjs.com/package/@opentelemetry/sdk-node).

It also has some useful random experimentation:git :)

- posts api
- memory leak

The SDK install guide (above link) tells you to install `@opentelemetry/auto-instrumentations-node`.

This brings in automatic instrumentation for popular node packages including Nest.js, Mongoose, etc. You don't need to install these packages separately.

Check out (and confirm) the [dev environment runtime configuration](./.env). This configures the Jaeger collector address, etc. You will see similar in the docker-compose file and Kubernetes example manifests.

## Quickstart

Start server

```bash
npm run start:dev
```

Open API

```bash
open http://localhost:3010/api
```

See prom metrics

```bash
curl http://localhost:9464/metrics
```

Run local jaeger to see traces (we could move these to npm scripts)

- task explorer->run
- task explorer->browser

Next steps:

- Build and test docker image: [docker build readme](./docker/README.md)
- Deploy to kubernetes: [Kubernetes deploy readme](./kubernetes/otel-hello/README.md)

## Nest.js

Generate new REST API

```bash
npx @nestjs/cli@latest generate resource memoryleak
```

## Memory leak

Run with insepector

1. Run start:debug
1. Output will have `Debugger listening on ws://127.0.0.1:9229`
1. Launch [chrome://inspect/](chrome://inspect/)

## References

### OpenTelemetry Tracing

- [Instrumentation Docs](https://opentelemetry.io/docs/instrumentation/js/instrumentation/)
- [Blog with trace examples](https://uptrace.dev/opentelemetry/js-tracing.html#quickstart)

### Nest.js

- [Great Nest.js REST API intro](https://www.thisdot.co/blog/introduction-to-restful-apis-with-nestjs) (source for posts service)

## Project layout

    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.
