import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { ApiCompositionModule } from "./composition/api-composition.module.js";
import { WorkerCompositionModule } from "./composition/worker-composition.module.js";
import {
  APP_CONFIG,
  type ApiAppConfig,
} from "./shared/infra/config/app-config.js";
import { appConfig } from "./shared/infra/config/app-config.module.js";
import { HttpExceptionFilter } from "./shared/infra/http/http-exception.filter.js";

async function bootstrap(): Promise<void> {
  if (appConfig.processRole === "worker") {
    const app = await NestFactory.createApplicationContext(
      WorkerCompositionModule,
    );
    app.enableShutdownHooks();
    return;
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    ApiCompositionModule,
    new FastifyAdapter(),
  );
  const config = app.get<ApiAppConfig>(APP_CONFIG);

  app.enableShutdownHooks();
  app.setGlobalPrefix("api", { exclude: ["health/live", "health/ready"] });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalFilters(app.get(HttpExceptionFilter));

  await app.listen({ host: config.http.host, port: config.http.port });
}

void bootstrap();
