import { Global, Module } from "@nestjs/common";

import { HealthController } from "./health.controller.js";
import { HttpExceptionFilter } from "./http-exception.filter.js";

@Global()
@Module({
  controllers: [HealthController],
  providers: [HttpExceptionFilter],
  exports: [HttpExceptionFilter],
})
export class HttpInfraModule {}
