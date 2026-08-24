import { Role } from "../../domain/role.js";
import { ServiceScope } from "../scopes/service-scope.enum.js";

import { IdentityType } from "./identity-type.enum.js";

interface BaseIdentity {
  readonly id: string;
  readonly tenantId?: string;
}

export interface UserIdentity extends BaseIdentity {
  readonly type: IdentityType.User;
  readonly roles: readonly Role[];
}

export interface ServiceIdentity extends BaseIdentity {
  readonly type: IdentityType.Service;
  readonly scopes: readonly ServiceScope[];
}

export type Identity = UserIdentity | ServiceIdentity;
