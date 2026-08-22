import { Global, Module } from "@nestjs/common";

import { HealthController } from "./health.controller";
import { HttpExceptionFilter } from "./http-exception.filter";

@Global()
@Module({
  controllers: [HealthController],
  providers: [HttpExceptionFilter],
  exports: [HttpExceptionFilter],
})
export class HttpInfraModule {}
