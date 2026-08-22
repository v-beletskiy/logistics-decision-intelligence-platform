import { Module } from "@nestjs/common";

import { AuthenticationAppModule } from "../modules/authentication/app/authentication-app.module";
import { UserAppModule } from "../modules/user/app/user-app.module";

@Module({
  imports: [AuthenticationAppModule, UserAppModule],
  exports: [AuthenticationAppModule, UserAppModule],
})
export class AdministrationAppModule {}
