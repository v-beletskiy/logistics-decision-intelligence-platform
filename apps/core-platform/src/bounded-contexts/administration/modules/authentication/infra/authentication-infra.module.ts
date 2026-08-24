import { Module } from "@nestjs/common";

import { PasswordHasher } from "../app/password-hasher.js";
import { Argon2PasswordHasher } from "./argon2-password-hasher.js";

@Module({
  providers: [
    {
      provide: PasswordHasher,
      useClass: Argon2PasswordHasher,
    },
  ],
  exports: [PasswordHasher],
})
export class AuthenticationInfraModule {}
