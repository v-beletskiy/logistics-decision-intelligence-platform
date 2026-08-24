import { Global, Module } from "@nestjs/common";
import { APP_CONFIG, createAppConfig } from "./app-config.js";

export const appConfig = createAppConfig();

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
export class AppConfigModule {}
