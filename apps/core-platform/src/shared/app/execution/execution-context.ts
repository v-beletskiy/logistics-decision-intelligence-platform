import { AuthorizationDeniedException } from "../../access-control/authorization/authorization.exceptions";
import type { Identity } from "../../access-control/identity/identity";

/** Trusted caller and tenant scope, created at the authenticated transport boundary. */
export class ExecutionContext {
  private constructor(
    readonly identity: Identity,
    readonly tenantId: string,
  ) {}

  static fromIdentity(identity: Identity): ExecutionContext {
    if (!identity.tenantId) {
      throw new AuthorizationDeniedException("Tenant access is denied.");
    }
    return new ExecutionContext(identity, identity.tenantId);
  }
}

/** Couples technical execution context to a pure use-case input. */
export interface ExecutionRequest<TInput> {
  readonly context: ExecutionContext;
  readonly input: TInput;
}
