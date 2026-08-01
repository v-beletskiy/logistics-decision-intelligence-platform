import { Global, Module } from '@nestjs/common';
import { env } from 'node:process';

import { APP_CONFIG, type AppConfig } from './app-config';

const appConfig: AppConfig = {
  host: env.HOST ?? '0.0.0.0',
  port: Number(env.PORT ?? 3000),
};

@Global()
@Module({
  providers: [
    {
      provide: APP_CONFIG,
      useValue: appConfig,
    },
  ],
  exports: [APP_CONFIG],
})
export class ConfigModule {}
