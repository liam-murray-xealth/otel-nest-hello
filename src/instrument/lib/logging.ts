import * as pino from 'pino'
import { trace, context } from '@opentelemetry/api'

// Below we inject trace id and span.
// Also see:
//  - https://www.npmjs.com/package/@opentelemetry/instrumentation-pino
//  - https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-pino
//

export const logger = pino.pino({
  level: process.env['LOG_LEVEL'] || 'info',
  name: process.env['SERVICE_NAME'] || process.env['OTEL_SERVICE_NAME'] || 'service',
  formatters: {
    log(object: object) {
      // Log trace and span IDs if tracing context is active
      const span = trace.getSpan(context.active())
      if (!span) {
        return { ...object }
      }
      const { spanId, traceId } = span.spanContext()
      return { ...object, spanId, traceId }
    },
  },
})
