import { Global, Module } from '@nestjs/common';

import { AccessManager } from './authorization/access-manager';
import { CaslAccessManager } from './casl/casl-access-manager';

@Global()
@Module({
  providers: [
    {
      provide: AccessManager,
      useClass: CaslAccessManager,
    },
  ],
  exports: [AccessManager],
})
export class AccessControlModule {}
