import { Module } from "@nestjs/common";

import { UserCommandModule } from "../bounded-contexts/administration/modules/user/composition/user-command.module.js";
import { AppConfigModule } from "../shared/infra/config/app-config.module.js";
import { PersistenceInfraModule } from "../shared/infra/persistence/persistence-infra.module.js";

@Module({
  imports: [AppConfigModule, PersistenceInfraModule, UserCommandModule],
})
export class AdministrationCliCompositionModule {}
