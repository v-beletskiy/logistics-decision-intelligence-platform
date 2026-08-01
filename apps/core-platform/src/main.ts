import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { APP_CONFIG, type AppConfig } from './shared/infra/config/app-config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const config = app.get<AppConfig>(APP_CONFIG);

  await app.listen({ host: config.host, port: config.port });
}

void bootstrap();
