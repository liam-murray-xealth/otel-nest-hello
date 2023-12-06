// Order is important. Import instrument lib before everything else.
import { startOtel, installShutdownOtelHooks, logger } from './instrument'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { INestApplication } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger } from '@nestjs/common'
import { LoggingInterceptor } from './interceptors/logging.interceptor'
import { runSpan } from './instrument'

/**
 * Setups up /api endoint to provide Swagger
 */
function initOpenApi(app: INestApplication, path: string) {
  const config = new DocumentBuilder()
    .setTitle('Hello Otel')
    .setDescription('Sample service demonstrating Node.js OpenTelemetry instrumentation')
    .setVersion('1.0')
    //.addTag('hello')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(path, app, document)
}

async function bootstrap() {
  Logger.log('Bootstrapping...')

  const app = await NestFactory.create(AppModule)
  app.useGlobalInterceptors(new LoggingInterceptor())

  const globalPrefix = ''
  const swaggerPath = 'api'

  app.setGlobalPrefix(globalPrefix)
  initOpenApi(app, swaggerPath)

  // Listen for shutown signals (SIGINT, SIGTERM, etc.)
  // For Terminus (health checks) and shutdown interception
  app.enableShutdownHooks()
  installShutdownOtelHooks()

  const port = process.env.PORT ?? 3010
  await app.listen(port, () => {
    Logger.log(`Serving http://localhost:${port}/${globalPrefix}`)
    Logger.log(`Swagger: http://localhost:${port}/${swaggerPath}`)
  })
}

async function main() {
  const env = [
    // 'OTEL_EXPORTER_JAEGER_ENDPOINT',
    // 'OTEL_EXPORTER_JAEGER_PROTOCOL',
    'OTEL_EXPORTER_OTLP_ENDPOINT',
    'OTEL_SERVICE_NAME',
    'OTEL_SDK_DISABLED',
    'OTEL_EXPORTER_PROMETHEUS_PORT',
    'GITHUB_SHA_SHORT',
  ]

  const envLog = env.reduce((p, c) => {
    p[c] = process.env[c] || '(unset)'
    return p
  }, {})
  logger.info(envLog, 'Environment')

  // Start SDK before nestjs factory create
  // TODO ignore paths is a hack
  const ingnorePaths = ['/metrics', '/health', '/^/health/.*$']
  await startOtel(ingnorePaths)

  // Run bootstrap under a span
  await runSpan(bootstrap, { name: 'bootstrap' })
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
