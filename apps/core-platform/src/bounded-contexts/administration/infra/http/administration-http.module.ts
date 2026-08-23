import { Module } from "@nestjs/common";

import { AuthenticationCommandModule } from "../../modules/authentication/composition/authentication-command.module";
import { AuthenticationController } from "../../modules/authentication/infra/http/authentication.controller";

@Module({
  imports: [AuthenticationCommandModule],
  controllers: [AuthenticationController],
})
export class AdministrationHttpModule {}
