/** Types generated for queries found in "src/bounded-contexts/administration/modules/user/infra/persistence/repository/queries/user.insert.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type stringArray = string[];

/** 'InsertUserAccount' parameters type */
export interface IInsertUserAccountParams {
  active: boolean;
  email: string;
  id: string;
  passwordHash: string;
  roles: stringArray;
  tenantId: string;
}

/** 'InsertUserAccount' return type */
export type IInsertUserAccountResult = void;

/** 'InsertUserAccount' query type */
export interface IInsertUserAccountQuery {
  params: IInsertUserAccountParams;
  result: IInsertUserAccountResult;
}

const insertUserAccountIR: any = {
  usedParamSet: {
    id: true,
    tenantId: true,
    email: true,
    passwordHash: true,
    roles: true,
    active: true,
  },
  params: [
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 111, b: 114 }],
    },
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 119, b: 128 }],
    },
    {
      name: "email",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 133, b: 139 }],
    },
    {
      name: "passwordHash",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 144, b: 157 }],
    },
    {
      name: "roles",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 162, b: 168 }],
    },
    {
      name: "active",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 173, b: 180 }],
    },
  ],
  statement:
    "INSERT INTO administration.users (\n  id,\n  tenant_id,\n  email,\n  password_hash,\n  roles,\n  active\n)\nVALUES (\n  :id!,\n  :tenantId!,\n  :email!,\n  :passwordHash!,\n  :roles!,\n  :active!\n)",
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO administration.users (
 *   id,
 *   tenant_id,
 *   email,
 *   password_hash,
 *   roles,
 *   active
 * )
 * VALUES (
 *   :id!,
 *   :tenantId!,
 *   :email!,
 *   :passwordHash!,
 *   :roles!,
 *   :active!
 * )
 * ```
 */
export const insertUserAccount = new PreparedQuery<
  IInsertUserAccountParams,
  IInsertUserAccountResult
>(insertUserAccountIR);
