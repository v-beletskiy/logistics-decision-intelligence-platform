import { Module } from "@nestjs/common";

import { AuthenticationAppModule } from "./authentication/authentication-app.module";
import { UserAppModule } from "./user/user-app.module";

@Module({
  imports: [AuthenticationAppModule, UserAppModule],
  exports: [AuthenticationAppModule, UserAppModule],
})
export class AdministrationAppModule {}
