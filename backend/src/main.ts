import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
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
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new JsonExceptionFilter());
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  });
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, host);
}

await bootstrap();
