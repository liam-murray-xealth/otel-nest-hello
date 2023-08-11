import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core'
import { nodeInstrumentations, setIgnorePaths } from './instrumentations'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
// import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger'
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import * as process from 'process'
import { DropAggregation, View } from '@opentelemetry/sdk-metrics'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { logger } from './logging'

// Most OTEL SDK can be configured via env vars:
//  https://opentelemetry.io/docs/reference/specification/sdk-environment-variables/
//
// OTEL_EXPORTER_PROMETHEUS_PORT: 9464 (default)
// OTEL_SERVICE_NAME "urls-backend"
// OTEL_SDK_DISABLED: false (default)
//

// DEPRECATED
// OTEL_EXPORTER_JAEGER_PROTOCOL: "http/thrift.binary" (default)
// OTEL_EXPORTER_JAEGER_ENDPOINT: http://localhost:14268/api/traces (jaeger http endpont)
//
// NEW (traces go to /v1/traces under this)
// See: https://opentelemetry.io/docs/concepts/sdk-configuration/otlp-exporter-configuration/
// OTEL_EXPORTER_OTLP_ENDPOINT  http://localhost:4318
//
/**
 * Map OTEL_API_DEBUG_LEVEL=>DiagLogLevel
 */
function mapDiagLevel(level: string | undefined): DiagLogLevel {
  if (level === undefined) {
    return DiagLogLevel.NONE
  }
  const map = {
    debug: DiagLogLevel.DEBUG,
    info: DiagLogLevel.INFO,
    warn: DiagLogLevel.WARN,
    error: DiagLogLevel.ERROR,
    none: DiagLogLevel.NONE,
  }
  const ret = map[level]
  if (ret === undefined) {
    throw new Error(`Unrecognized OTEL_API_DEBUG_LEVEL ${level}`)
  }
  return ret
}

// TODO
//  - figure out way to enable/disable traces based on route annotations
//  - configure sampler so we let ingress determine which paths to sample
//

function createSdk(ignorePaths: string[]) {
  // For troubleshooting, set the log level to DiagLogLevel.DEBUG
  const otelLogLevel = mapDiagLevel(process.env.OTELSDK_LOG_LEVEL)
  logger.info({ otelLogLevel }, 'OtelSDK creating...')
  diag.setLogger(new DiagConsoleLogger(), otelLogLevel)

  setIgnorePaths(ignorePaths)

  // Access the meter to create instruments for recording observations:
  //
  //  const meter = metrics.getMeter('default', '1.0.0')
  //
  const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS
  const prometheusExporter = new PrometheusExporter({}, () => {
    logger.info(`Prometheus metrics: http://localhost:${port}${endpoint}`)
  })

  // https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/metrics.md
  const dropHttpMetricsView = new View({
    aggregation: new DropAggregation(),
    meterName: '@opentelemetry/instrumentation-http',
  })

  const sdk = new NodeSDK({
    metricReader: prometheusExporter,
    views: [dropHttpMetricsView],
    //spanProcessor: new BatchSpanProcessor(new JaegerExporter()),
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({
        // url: '<opentelemetry-collector-url>', // default is http://localhost:4318/v1/traces
        headers: {}, // an optional object containing custom headers to be sent with each request
        concurrencyLimit: 10, // an optional limit on pending requests
      })
    ),
    contextManager: new AsyncLocalStorageContextManager(),
    textMapPropagator: new CompositePropagator({
      // Define the types of trace headers we can receive and forward along
      propagators: [
        new JaegerPropagator(),
        new W3CTraceContextPropagator(),
        new W3CBaggagePropagator(),
        new B3Propagator(),
        new B3Propagator({
          injectEncoding: B3InjectEncoding.MULTI_HEADER,
        }),
      ],
    }),
    instrumentations: [nodeInstrumentations],
  })
  return sdk
}

// TODO figure this out (see TODO above)
const defaultIgnorePaths = ['/metrics', '/health', '/^/health/.*$']

let otelSDK
export async function startOtel(ignorePaths: string[] = defaultIgnorePaths) {
  if (otelSDK) {
    throw new Error('OtelSDK already started')
  }
  if (shutdownCalled) {
    throw new Error('OtelSDK shutdown called (restart not supported)')
  }
  otelSDK = createSdk(ignorePaths)
  await otelSDK.start()
}

let shutdownCalled = false
export async function shutdownOtel() {
  if (shutdownCalled) {
    logger.info('shutdown already called (ignoring)')
    return
  }
  logger.info('shutting down...')
  shutdownCalled = true
  try {
    await otelSDK.shutdown()
    logger.info('OTEL SDK: completed shutdown')
  } catch (err) {
    logger.info(err, 'OTEL SDK: failed to shut down gracefully')
  }
}

/**
 * Needs to be done after you enableShutdownHooks() in Nest.js (otherwise nest clobbers)
 */
export function installShutdownOtelHooks() {
  process.on('SIGINT', shutdownOtel)
  process.on('SIGTERM', shutdownOtel)
}
