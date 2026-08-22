import { Module } from "@nestjs/common";

import { AdministrationAppModule } from "../../app/administration-app.module";
import { AuthenticationController } from "../../modules/authentication/infra/http/authentication.controller";

@Module({
  imports: [AdministrationAppModule],
  controllers: [AuthenticationController],
})
export class AdministrationHttpModule {}
