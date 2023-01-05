import * as pino from 'pino'
import { trace, context } from '@opentelemetry/api'

export const logger = pino.pino({
  level: process.env['LOG_LEVEL'] || 'info',
  name: 'urls', //envStr('SERVICE_NAME'),
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
