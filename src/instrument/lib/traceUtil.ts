import { trace, SpanStatusCode } from '@opentelemetry/api'
//import { SemanticAttributes } from '@opentelemetry/semantic-conventions'

export type SpanOpts = {
  // Span name
  name?: string
}

export async function runSpan<T>(func: () => Promise<T>, opts: SpanOpts = {}): Promise<T> {
  const name = opts.name || 'somefunc'
  const serviceName = process.env.OTEL_SERVICE_NAME || 'default'

  const tracer = trace.getTracer(serviceName)
  let res, error
  await tracer.startActiveSpan(name, async span => {
    try {
      res = await func()
    } catch (err_: unknown) {
      error = err_
      const err = err_ instanceof Error ? err_ : new Error(`Error: ${err_}`)
      span.recordException(err)
      // Exceptions don't count as errors by default (since they can be handled).
      // This sets error flag indicating the operation failed.
      span.setStatus({
        code: SpanStatusCode.ERROR,
      })
    }
    span.end()
  })
  if (error) {
    throw error
  }
  return res
}

/**
 * Wraps work promise func with promise that records a span.
 *
 * The returned promise has the same signature as the wrapped promise (func).
 *
 * const workerFuncTraced = withSpan(getWorkerFunc())
 * workerFuncTraced(...workerFuncArgs)
 */
export function withSpan<A extends unknown[], R>(
  func: (...args: A) => Promise<R>,
  opts: SpanOpts = {}
): (...args: A) => Promise<R> {
  return (...args: A): Promise<R> => {
    return runSpan(() => {
      return func(...args)
    }, opts)
  }
}
