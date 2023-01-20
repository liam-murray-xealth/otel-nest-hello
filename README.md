# OTEL demo

This project demonstrates a Nest.js service configured for traces and metrics using the [OTEL SDK for node](https://www.npmjs.com/package/@opentelemetry/sdk-node).

The SDK install guide (above link) tells you to install `@opentelemetry/auto-instrumentations-node`.

This brings in automatic instrumentation for popular node packages including Nest.js, Mongoose, etc. You don't need to install these packages separately.

Check out (and confirm) the [dev environment runtime configuration](./.env). This configures the Jaeger collector address, etc. You will see similar in the docker-compose file and Kubernetes example manifests.

# Quickstart

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

## References

### OpenTelemetry Tracing

- [Instrumentation Docs](https://opentelemetry.io/docs/instrumentation/js/instrumentation/)
- [Blog with trace examples](https://uptrace.dev/opentelemetry/js-tracing.html#quickstart)

### Nest.js

- [Great Nest.js REST API intro](https://www.thisdot.co/blog/introduction-to-restful-apis-with-nestjs) (source for posts service)
