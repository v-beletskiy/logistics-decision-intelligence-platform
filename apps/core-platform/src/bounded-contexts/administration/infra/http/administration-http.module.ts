import { Module } from "@nestjs/common";

import { AuthenticationCommandModule } from "../../modules/authentication/composition/authentication-command.module.js";
import { AuthenticationController } from "../../modules/authentication/infra/http/authentication.controller.js";

@Module({
  imports: [AuthenticationCommandModule],
  controllers: [AuthenticationController],
})
export class AdministrationHttpModule {}
