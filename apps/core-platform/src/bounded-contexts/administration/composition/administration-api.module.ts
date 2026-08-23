import { Module } from "@nestjs/common";

import { AdministrationHttpModule } from "../infra/http/administration-http.module";

@Module({
  imports: [AdministrationHttpModule],
})
export class AdministrationApiModule {}
