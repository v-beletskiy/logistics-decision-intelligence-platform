import { AuthorizationDeniedException } from "../authorization/authorization.exceptions";
import type { Identity } from "../identity/identity";

/** Trusted caller and tenant scope, created at the authenticated transport boundary. */
export class UseCaseContext {
  private constructor(
    readonly identity: Identity,
    readonly tenantId: string,
  ) {}

  static fromIdentity(identity: Identity): UseCaseContext {
    if (!identity.tenantId) {
      throw new AuthorizationDeniedException("Tenant access is denied.");
    }
    return new UseCaseContext(identity, identity.tenantId);
  }
}

/** Couples technical execution context to a pure use-case input. */
export interface UseCaseRequest<TInput> {
  readonly context: UseCaseContext;
  readonly input: TInput;
}
