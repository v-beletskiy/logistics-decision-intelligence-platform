import type { Identity } from "../identity/identity.js";
import { Permission } from "../permissions/permission.enum.js";

/** Resource attributes required to make an authorization decision. */
export interface AuthorizationContext {
  readonly tenantId?: string;
}

export abstract class AccessManager {
  abstract authorize(
    identity: Identity,
    permission: Permission,
    context?: AuthorizationContext,
  ): Promise<void>;
}
