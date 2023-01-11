# Dockerfile

## Quickstart

Run using docker compose

```bash
docker compose up --build
```

See [docker build env vars](./.env). For trace metrics to work you currently need to bring up Jaeger on the host.

Test metrics enpoint exposed from container

```bash
curl localhost:9090/metrics
```

Launch swagger UI exposed from container

```bash
open http://127.0.0.1:8040/api
```
