import { metrics } from '@opentelemetry/api'

// Refs (most blogs out of date!)
//  https://www.npmjs.com/package/@opentelemetry/sdk-metrics
//  https://opentelemetry.io/docs/reference/specification/metrics/data-model/
//  https://www.timescale.com/blog/a-deep-dive-into-open-telemetry-metrics/
//  https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/examples/prometheus
//
// Meter is like a metrics context and contains multiple instruments.
// Each instrument records observations
//
// Exemplars
//   https://github.com/open-telemetry/opentelemetry-js/issues/2594

/**
 * OTEL SDK must be initialized prior to this
 */
export function createMetricInstruments() {
  const meter = metrics.getMeter('app', '1.0.0')
  //
  // Instruments
  //
  // See
  //  https://github.com/open-telemetry/opentelemetry-js/blob/369b07e1c7483556fa9da952ba27c2e2828ecefb/packages/sdk-metrics/test/Instruments.test.ts
  //  https://github.com/open-telemetry/opentelemetry-js/blob/main/experimental/packages/opentelemetry-instrumentation-http/src/http.ts
  // Or
  //  search "_updateMetricInstruments" in SDK repo
  //
  const helloCount = meter.createCounter('hello.count', {
    description: 'Counts alias collisions',
  })
  // helloCount.add(1, { foo: 'foo-value' })

  return {
    helloCount,
  }
}

export type Instruments = ReturnType<typeof createMetricInstruments>
