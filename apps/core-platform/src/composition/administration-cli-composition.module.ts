import { Module } from "@nestjs/common";

import { UserCommandModule } from "../bounded-contexts/administration/modules/user/composition/user-command.module";
import { AppConfigModule } from "../shared/infra/config/app-config.module";
import { PersistenceInfraModule } from "../shared/infra/persistence/persistence-infra.module";

@Module({
  imports: [AppConfigModule, PersistenceInfraModule, UserCommandModule],
})
export class AdministrationCliCompositionModule {}
