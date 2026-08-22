import { Module } from "@nestjs/common";

import { AdministrationAppModule } from "./app/administration-app.module";
import { AdministrationHttpModule } from "./infra/http/administration-http.module";

@Module({
  imports: [AdministrationAppModule, AdministrationHttpModule],
})
export class AdministrationModule {}
