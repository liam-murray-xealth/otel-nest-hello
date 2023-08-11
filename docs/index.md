# OTEL demo

Playground project that demonstrates

- a Nest.js service configured for traces and metrics using the [OTEL SDK for node](https://www.npmjs.com/package/@opentelemetry/sdk-node).
- Memory leak testing
- Basic REST APIs with OpenAPI endpoint

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

Run local [jaeger](https://www.jaegertracing.io/docs/1.47/getting-started/) to see traces (we could move these to npm scripts)

- task explorer->run
- task explorer->browser

This will listen for various export formats. We will use [otel http](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http) (on 4318) since exporter-jaeger is being deprecated.

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

## Project layout

```text
    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.
```
