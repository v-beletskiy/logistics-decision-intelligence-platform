import { Injectable } from "@nestjs/common";

import { AccessManager } from "../authorization/access-manager";
import { AuthorizationDeniedException } from "../authorization/authorization.exceptions";
import type { Identity } from "../identity/identity";
import { IdentityType } from "../identity/identity-type.enum";
import { Permission } from "../permissions/permission.enum";
import { ROLE_PERMISSIONS } from "../roles/role-permissions";

@Injectable()
export class CaslAccessManager extends AccessManager {
  async authorize(
    identity: Identity,
    permission: Permission,
    context?: { readonly tenantId?: string },
  ): Promise<void> {
    const isSameTenant =
      context?.tenantId === undefined || context.tenantId === identity.tenantId;
    const isAllowed =
      identity.type === IdentityType.User &&
      isSameTenant &&
      identity.roles.some((role) =>
        ROLE_PERMISSIONS[role].includes(permission),
      );

    if (!isAllowed) {
      throw new AuthorizationDeniedException("Authorization denied.");
    }
  }
}
