import { Inject } from "@nestjs/common";

import { Permission } from "../permissions/permission.enum";
import type { ExecutionRequest } from "../../app/execution/execution-context";
import {
  AccessManager,
  type AuthorizationContext,
} from "./access-manager";

const ACCESS_MANAGER_PROPERTY = Symbol("authorizedAccessManager");

interface AuthorizedInstance {
  readonly [ACCESS_MANAGER_PROPERTY]: AccessManager;
}

type AuthorizedOperation<TInput, TResult> = (
  request: ExecutionRequest<TInput>,
) => Promise<TResult>;

type AuthorizationContextFactory<TInput> = (
  request: ExecutionRequest<TInput>,
) => AuthorizationContext | undefined;

function defaultAuthorizationContext(
  request: ExecutionRequest<unknown>,
): AuthorizationContext {
  return { tenantId: request.context.tenantId };
}

class AuthorizedInvocation<TInput, TResult> {
  constructor(
    private readonly access: AccessManager,
    private readonly permission: Permission,
    private readonly operation: AuthorizedOperation<TInput, TResult>,
    private readonly contextFrom: AuthorizationContextFactory<TInput>,
  ) {}

  async exec(request: ExecutionRequest<TInput>): Promise<TResult> {
    await this.access.authorize(
      request.context.identity,
      this.permission,
      this.contextFrom(request),
    );
    return this.operation(request);
  }
}

export function Authorized<TInput = unknown>(
  permission: Permission,
  contextFrom?: AuthorizationContextFactory<TInput>,
): MethodDecorator {
  return (
    target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Inject(AccessManager)(target, ACCESS_MANAGER_PROPERTY);
    Object.defineProperty(target, ACCESS_MANAGER_PROPERTY, {
      configurable: true,
      writable: true,
    });
    const operation = descriptor.value as AuthorizedOperation<unknown, unknown>;

    descriptor.value = function (
      this: AuthorizedInstance,
      request: ExecutionRequest<unknown>,
    ): Promise<unknown> {
      return new AuthorizedInvocation(
        this[ACCESS_MANAGER_PROPERTY],
        permission,
        operation.bind(this),
        (contextFrom as AuthorizationContextFactory<unknown>) ??
          defaultAuthorizationContext,
      ).exec(request);
    };
    return descriptor;
  };
}
