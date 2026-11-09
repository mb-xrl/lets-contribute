import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express } from 'express';
import { config } from './config';
import { AppModule } from './app.module';

export type BootstrappedApp = {
  express: Express;
  close: () => Promise<void>;
};

/**
 * Builds the app once and hands back the underlying Express instance so it can
 * be either `listen()`ed (local dev) or invoked per-request (Vercel function).
 */
export async function bootstrapExpress(): Promise<BootstrappedApp> {
  const server = express();
  server.set('trust proxy', 1);

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: config.isProduction ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug'],
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [config.webOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableShutdownHooks();

  await app.init();
  return { express: server, close: () => app.close() };
}

/** Used by the Vercel function in api/index.js. */
export async function createExpressApp(): Promise<Express> {
  const { express } = await bootstrapExpress();
  Logger.log('NestJS ready (serverless)', 'Bootstrap');
  return express;
}
