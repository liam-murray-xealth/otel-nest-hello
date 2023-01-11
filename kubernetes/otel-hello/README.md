# Kubernetes

## Deploy

Deploy to the cluster

```bash
cd otel-overlay/overlay
kustomize build | kubectl apply -f -
```

That will create the namespace `otel-hello` and deploy the service.

The service is configured to send traces to the opentelemetry collector Jaeger endpoint at `collector.opentelemetry`. The open telemetry collector should be configured to forward traces to Tempo.

It also adds a ServiceMonitor so metrics are picked up via the Prometheus Operator.

## Verify

Establish a port-forward to the service http-web port.

(If you are using [k9s](https://k9scli.io/) you can "shift-f" on the service to start the port-forward session.)

Once you do that open the Swagger UI and send a couple requests.

```bash
open http://localhost:8040/api
```

These should produce traces that are visible in Tempo.

You should also see metrics show up in prometheus (hello_count_total)

## Cleanup

```bash
kubectl delete ns otel-hello
```
