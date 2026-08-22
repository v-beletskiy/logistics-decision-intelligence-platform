import { defineErrorCodes } from "../../../../../shared/domain/domain.exceptions";

export const USER_ERROR_CODES = defineErrorCodes("user", {
  invalidId: "invalid-id",
  invalidTenantId: "invalid-tenant-id",
  passwordHashRequired: "password-hash-required",
  invalidRoles: "invalid-roles",
  duplicateRoles: "duplicate-roles",
  invalidActiveState: "invalid-active-state",
  invalidEmail: "email-invalid",
});
