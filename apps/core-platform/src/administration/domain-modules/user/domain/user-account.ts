import { isUuid } from "@logistics-decision-intelligence/validation";
import { randomUUIDv7 } from "node:crypto";

import { Role } from "../../../../shared/access-control/roles/role.enum";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";

import { UserEmail } from "./user-email.value-object";

const INVALID_USER_ACCOUNT_ID_ERR_CODE = "user.id-invalid";
const INVALID_USER_TENANT_ID_ERR_CODE = "user.tenant-id-invalid";
const USER_PASSWORD_HASH_REQUIRED_ERR_CODE = "user.password-hash-required";
const INVALID_USER_ROLES_ERR_CODE = "user.roles-invalid";
const DUPLICATE_USER_ROLES_ERR_CODE = "user.roles-duplicate";
const INVALID_USER_ACTIVE_STATE_ERR_CODE = "user.active-state-invalid";

export interface UserAccountProps {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly roles: readonly Role[];
  readonly active: boolean;
}

/** Local human identity owned by the Administration bounded context. */
export class UserAccount {
  readonly id: string;
  readonly tenantId: string;
  private readonly _email: UserEmail;
  private _passwordHash: string;
  private _roles: readonly Role[];
  private _active: boolean;

  private constructor(props: UserAccountProps) {
    if (!isUuid(props.id)) {
      throw new DomainException(
        "User identifier is invalid.",
        INVALID_USER_ACCOUNT_ID_ERR_CODE,
      );
    }
    if (!isUuid(props.tenantId)) {
      throw new DomainException(
        "User tenant identifier is invalid.",
        INVALID_USER_TENANT_ID_ERR_CODE,
      );
    }
    if (
      typeof props.passwordHash !== "string" ||
      props.passwordHash.trim().length === 0
    ) {
      throw new DomainException(
        "User password hash must be specified.",
        USER_PASSWORD_HASH_REQUIRED_ERR_CODE,
      );
    }
    if (typeof props.active !== "boolean") {
      throw new DomainException(
        "User active state is invalid.",
        INVALID_USER_ACTIVE_STATE_ERR_CODE,
      );
    }

    this.id = props.id;
    this.tenantId = props.tenantId;
    this._email = UserEmail.create(props.email);
    this._passwordHash = props.passwordHash;
    this._roles = validateRoles(props.roles);
    this._active = props.active;
  }

  get email(): string {
    return this._email.value;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get roles(): readonly Role[] {
    return [...this._roles];
  }

  get active(): boolean {
    return this._active;
  }

  static create(props: Omit<UserAccountProps, "id" | "active">): UserAccount {
    return new UserAccount({ ...props, id: randomUUIDv7(), active: true });
  }

  static reconstitute(props: UserAccountProps): UserAccount {
    return new UserAccount(props);
  }
}

function validateRoles(roles: readonly Role[]): readonly Role[] {
  if (
    !Array.isArray(roles) ||
    roles.length === 0 ||
    roles.some((role) => !Object.values(Role).includes(role))
  ) {
    throw new DomainException(
      "User roles are invalid.",
      INVALID_USER_ROLES_ERR_CODE,
    );
  }
  if (new Set(roles).size !== roles.length) {
    throw new DomainException(
      "User roles must be unique.",
      DUPLICATE_USER_ROLES_ERR_CODE,
    );
  }
  return [...roles];
}
