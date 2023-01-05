import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import * as process from 'process';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { logger } from './logging';
import { IncomingMessage } from 'http';

// Most OTEL SDK can be configured via env vars:
//  https://opentelemetry.io/docs/reference/specification/sdk-environment-variables/
//
// OTEL_EXPORTER_PROMETHEUS_PORT: 9464 (default)
// OTEL_SERVICE_NAME "urls-backend"
// OTEL_EXPORTER_JAEGER_PROTOCOL: "http/thrift.binary" (default)
// OTEL_EXPORTER_JAEGER_ENDPOINT: http://localhost:14268/api/traces (jaeger http endpont)
// OTEL_SDK_DISABLED: false (default)
//

/**
 * Mapp
 */
function mapDiagLevel(level: string): DiagLogLevel {
  if (level === undefined) {
    return DiagLogLevel.NONE;
  }
  const map = {
    debug: DiagLogLevel.DEBUG,
    info: DiagLogLevel.INFO,
    warn: DiagLogLevel.WARN,
    error: DiagLogLevel.ERROR,
    none: DiagLogLevel.NONE,
  };
  const ret = map[level];
  if (ret === undefined) {
    throw new Error(`Unrecognized OTEL_API_DEBUG_LEVEL ${level}`);
  }
  return ret;
}

function createSdk(ignorePaths: string[]) {
  //
  // HTTP instrumentation and Nest/Express instrumentation run side-by-side
  // Ideally we want to ignore incoming on all non-routes
  //
  function shouldIgnore(route: string): boolean {
    return !!ignorePaths.find((a) => route.match(a));
  }

  // For troubleshooting, set the log level to DiagLogLevel.DEBUG
  const otelLogLevel = mapDiagLevel(process.env.OTELSDK_LOG_LEVEL);
  logger.info({ otelLogLevel }, 'OtelSDK creating...');
  diag.setLogger(new DiagConsoleLogger(), otelLogLevel);

  // Auto instruments common Node libs
  //   http
  //   pino
  //   mongoose,
  //   fs,
  //   etc.
  //
  // TODO
  //  - http instrumentation adds noisy route level metrics (can we disable?)
  //  - figure out way to enable/disable traces based on route annotations
  //  - configure sampler so we let ingress determine which paths to sample
  //
  const nodeInstrumentations = getNodeAutoInstrumentations({
    //'@opentelemetry/instrumentation-express': {},
    '@opentelemetry/instrumentation-fs': {
      // Noisy (produces spans outside of routes)
      enabled: false,
    },
    '@opentelemetry/instrumentation-http': {
      ignoreIncomingRequestHook: (req: IncomingMessage) => {
        // For incoming this is too low-level
        // We want to include only express routes
        const { method, url } = req;
        logger.debug({ method, url }, 'RequestHook');
        if (req.method === 'OPTIONS') {
          return true;
        }
        if (shouldIgnore(req.url)) {
          return true;
        }
        return false;
      },
    },
  });

  // Access the meter to create instruments for recording observations:
  //
  //  const meter = metrics.getMeter('default', '1.0.0')
  //
  const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;
  const prometheusExporter = new PrometheusExporter({}, () => {
    logger.info(`Prometheus metrics: http://localhost:${port}${endpoint}`);
  });

  const sdk = new NodeSDK({
    metricReader: prometheusExporter,
    spanProcessor: new BatchSpanProcessor(new JaegerExporter()),
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
    instrumentations: [
      nodeInstrumentations,
      // What does this provide beyond mongoose?
      new MongoDBInstrumentation({
        enhancedDatabaseReporting: true,
      }),
    ],
  });
  return sdk;
}

// TODO figure this out (see TODO above)
const defaultIgnorePaths = ['/metrics', '/health', '/^/health/.*$'];

let otelSDK;
export async function startOtel(ignorePaths: string[] = defaultIgnorePaths) {
  if (otelSDK) {
    throw new Error('OtelSDK already started');
  }
  if (exitPending) {
    throw new Error('OtelSDK exit pending');
  }
  otelSDK = createSdk(ignorePaths);
  return otelSDK.start();
}

let exitPending = false;
export async function shutdownOtel() {
  if (exitPending) {
    logger.info('shutdown pending (ignoring)');
    return;
  }
  logger.info('shutting down...');
  exitPending = true;
  try {
    await otelSDK.shutdown();
    logger.info('OTEL SDK: completed shutdown');
  } catch (err) {
    logger.info(err, 'OTEL SDK: failed to shut down gracefully');
  }
  process.exit(0);
}

/**
 * Needs to be done after you enableShutdownHooks() in Nest.js (otherwise nest clobbers)
 */
export async function installShutdownOtelHooks() {
  process.on('SIGINT', shutdownOtel);
  process.on('SIGTERM', shutdownOtel);
}
