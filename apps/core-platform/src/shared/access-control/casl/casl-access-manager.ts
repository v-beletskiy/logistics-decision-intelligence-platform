import { Injectable } from "@nestjs/common";

import { AccessManager } from "../authorization/access-manager";
import { AuthorizationException } from "../authorization/authorization.exception";
import type { Identity } from "../identity/identity";
import { Permission } from "../permissions/permission.enum";

@Injectable()
export class CaslAccessManager extends AccessManager {
  async authorize(_identity: Identity, _permission: Permission): Promise<void> {
    throw new AuthorizationException("Authorization denied.");
  }
}
