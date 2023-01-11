import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { IncomingMessage } from 'http'

let ignorePaths = []

export function setIgnorePaths(paths: string[]) {
  ignorePaths = paths
}

//
// HTTP instrumentation and Nest/Express instrumentation run side-by-side
// Ideally we want to ignore incoming on all non-routes
//
function shouldIgnore(route: string): boolean {
  return !!ignorePaths.find(a => route.match(a))
}

function renameField(record: Record<string, unknown>, from: string, to: string) {
  if (from in record) {
    record[to] = record[from]
    delete record[from]
  }
}
function renameFields(record: Record<string, unknown>, mapping: Record<string, string>) {
  for (const [key, value] of Object.entries(mapping)) {
    renameField(record, key, value)
  }
}

// This function (getNodeAutoInstrumentations) automatically instruments a variety
// of common node libraries such as http, pino, mongoose, fs, etc.
//
// It needs to be called before the modules it hooks are loaded. If you set the log
// level to warn you will see warnings if it detects that modules have already been
// loaded.
//
// This module (instrumentations.ts) must therefore be required as soon as possible.
//
export const nodeInstrumentations = getNodeAutoInstrumentations({
  //'@opentelemetry/instrumentation-express': {},
  '@opentelemetry/instrumentation-fs': {
    // Noisy (produces spans outside of routes)
    enabled: false,
  },
  '@opentelemetry/instrumentation-pino': {
    enabled: true,
    logHook: (_span, record: Record<string, unknown>, _level?: number) => {
      // Customize names (e.g. Grafana datasource looks for traceId, etc.)
      renameFields(record, {
        trace_id: 'traceId',
        span_id: 'spanId',
        trace_flags: 'traceFlags',
      })
    },
  },
  '@opentelemetry/instrumentation-http': {
    ignoreIncomingRequestHook: (req: IncomingMessage) => {
      // For incoming this is too low-level
      // We want to include only express routes
      // const { method, url } = req
      // logger.debug({ method, url }, 'RequestHook')
      if (req.method === 'OPTIONS') {
        return true
      }
      if (shouldIgnore(req.url)) {
        return true
      }
      // logger.debug({ method, url }, 'RequestHook: not ignoring')
      return false
    },
  },
})
