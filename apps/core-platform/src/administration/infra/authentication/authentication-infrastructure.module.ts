import { Module } from "@nestjs/common";

import { PasswordHasher } from "../../app/authentication/password-hasher";
import { Argon2PasswordHasher } from "./argon2-password-hasher";

@Module({
  providers: [
    {
      provide: PasswordHasher,
      useClass: Argon2PasswordHasher,
    },
  ],
  exports: [PasswordHasher],
})
export class AuthenticationInfrastructureModule {}
