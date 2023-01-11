# OTEL demo

See: [OTEL SDK for node](https://www.npmjs.com/package/@opentelemetry/sdk-node)

Note the SDK install tells you to install `@opentelemetry/auto-instrumentations-node`. This brings in automatic instrumentation for popular node packages including Nest.js, Mongoose, etc.

See (and confirm) [environment configuration](./env). This configures collector address, etc.

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

Build docker (for testing docker build)

```bash
./build-docker.sh
```
