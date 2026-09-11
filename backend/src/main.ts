import 'dotenv/config';
import { startTracing } from './platform/otel.js';
startTracing();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { JsonExceptionFilter } from './http/json-exception.filter.js';

function corsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  const allowed = (process.env.CORS_ORIGINS || '*').trim();
  if (!origin) {
    callback(null, true);
    return;
  }
  if (allowed === '*') {
    callback(null, true);
    return;
  }
  const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  if (
    list.includes(origin) ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.endsWith('.vercel.app')
  ) {
    callback(null, true);
    return;
  }
  callback(null, false);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: false }));
  app.useGlobalFilters(new JsonExceptionFilter());
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  });
  const swagger = new DocumentBuilder()
    .setTitle('Little Royals School OS API')
    .setDescription('Kindergarten and primary school API')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger), { useGlobalPrefix: true });
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, host);
}

await bootstrap();
