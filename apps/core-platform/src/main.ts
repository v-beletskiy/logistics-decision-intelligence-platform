import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";
import { APP_CONFIG, type AppConfig } from "./shared/infra/config/app-config";
import { appConfig } from "./shared/infra/config/app-config.module";
import { HttpExceptionFilter } from "./shared/infra/http/http-exception.filter";

async function bootstrap(): Promise<void> {
  const isNotApi = !appConfig.processRoles.includes("api");
  if (isNotApi) {
    const app = await NestFactory.createApplicationContext(AppModule);
    app.enableShutdownHooks();
    return;
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const config = app.get<AppConfig>(APP_CONFIG);

  app.enableShutdownHooks();
  app.setGlobalPrefix("api", { exclude: ["health/live", "health/ready"] });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalFilters(app.get(HttpExceptionFilter));

  await app.listen({ host: config.host, port: config.port });
}

void bootstrap();
