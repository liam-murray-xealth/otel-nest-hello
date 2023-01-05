import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { startOtel, installShutdownOtelHooks, logger } from './instrument';
import { Logger } from '@nestjs/common';

//
/**
 * Setups up /api endoint to provide Swagger
 */
function initOpenApi(app: INestApplication, path: string) {
  const config = new DocumentBuilder()
    .setTitle('Url Shortener')
    .setDescription('Provides short URL aliases and redirection')
    .setVersion('1.0')
    .addTag('urls')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, document);
}

async function bootstrap() {
  Logger.log('Bootstrapping...');

  const env = [
    'OTEL_EXPORTER_JAEGER_ENDPOINT',
    'OTEL_EXPORTER_JAEGER_PROTOCOL',
    'OTEL_SERVICE_NAME',
    'OTEL_SDK_DISABLED',
    'OTEL_EXPORTER_PROMETHEUS_PORT',
    'GITHUB_SHA_SHORT',
  ];

  const envLog = env.reduce((p, c) => {
    p[c] = process.env[c] || '(unset)';
    return p;
  }, {});
  logger.info(envLog, 'Environment');

  // Start SDK before nestjs factory create
  const ingnorePaths = ['/metrics', '/health', '/^/health/.*$'];
  await startOtel(ingnorePaths);

  const app = await NestFactory.create(AppModule);

  const globalPrefix = '';
  const swaggerPath = 'api';

  app.setGlobalPrefix(globalPrefix);
  initOpenApi(app, swaggerPath);

  // Listen for shutown signals (SIGINT, SIGTERM, etc.)
  // For Terminus (health checks) and shutdown interception
  app.enableShutdownHooks();
  installShutdownOtelHooks();

  const port = process.env.port ?? 3010;
  await app.listen(port, () => {
    Logger.log(`Serving http://localhost:${port}/${globalPrefix}`);
    Logger.log(`Swagger: http://localhost:${port}/${swaggerPath}`);
  });
}
bootstrap();
