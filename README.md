# OTEL demo

OTEL SDK installed for [sdk node](https://www.npmjs.com/package/@opentelemetry/sdk-node)

See env in `.env`

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

Run local jaeger to see traces

- task explorer->run
- task explorer->browser
