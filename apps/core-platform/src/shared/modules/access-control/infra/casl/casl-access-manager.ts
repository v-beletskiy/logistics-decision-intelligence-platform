import { Injectable } from "@nestjs/common";
import {
  AbilityBuilder,
  createMongoAbility,
  subject,
  type MongoAbility,
} from "@casl/ability";

import { AccessManager } from "../../app/authorization/access-manager.js";
import { AuthorizationDeniedException } from "../../app/authorization/authorization.exceptions.js";
import type { Identity } from "../../app/identity/identity.js";
import { IdentityType } from "../../app/identity/identity-type.enum.js";
import { Permission } from "../../app/permissions/permission.enum.js";
import { ROLE_PERMISSIONS } from "../../app/roles/role-permissions.js";
import { ServiceScope } from "../../app/scopes/service-scope.enum.js";

const TENANT_RESOURCE = "TenantResource" as const;
interface TenantResource {
  readonly __caslSubjectType__: typeof TENANT_RESOURCE;
  readonly tenantId: string;
}
type PlatformAbility = MongoAbility<
  [Permission, typeof TENANT_RESOURCE | TenantResource]
>;

const SERVICE_SCOPE_PERMISSIONS: Readonly<
  Record<ServiceScope, readonly Permission[]>
> = {
  [ServiceScope.RouteAnalysisRead]: [Permission.RouteRead],
};

@Injectable()
export class CaslAccessManager extends AccessManager {
  async authorize(
    identity: Identity,
    permission: Permission,
    context?: { readonly tenantId?: string },
  ): Promise<void> {
    const ability = abilityFor(identity);
    const tenantId = context?.tenantId ?? identity.tenantId;
    const isAllowed =
      tenantId !== undefined &&
      ability.can(
        permission,
        subject(TENANT_RESOURCE, { tenantId }) as TenantResource,
      );

    if (!isAllowed) {
      throw new AuthorizationDeniedException("Authorization denied.");
    }
  }
}

function abilityFor(identity: Identity): PlatformAbility {
  const { can, build } = new AbilityBuilder<PlatformAbility>(
    createMongoAbility,
  );
  if (identity.tenantId === undefined) return build();

  const permissions =
    identity.type === IdentityType.User
      ? identity.roles.flatMap((role) => ROLE_PERMISSIONS[role])
      : identity.scopes.flatMap((scope) => SERVICE_SCOPE_PERMISSIONS[scope]);

  for (const permission of new Set(permissions)) {
    can(permission, TENANT_RESOURCE, { tenantId: identity.tenantId });
  }
  return build();
}
