/** Types generated for queries found in "src/bounded-contexts/administration/modules/user/infra/persistence/repository/queries/user.find-by-email.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type stringArray = string[];

/** 'FindUserAccountByEmail' parameters type */
export interface IFindUserAccountByEmailParams {
  email: string;
}

/** 'FindUserAccountByEmail' return type */
export interface IFindUserAccountByEmailResult {
  active: boolean;
  email: string;
  id: string;
  password_hash: string;
  roles: stringArray;
  tenant_id: string;
}

/** 'FindUserAccountByEmail' query type */
export interface IFindUserAccountByEmailQuery {
  params: IFindUserAccountByEmailParams;
  result: IFindUserAccountByEmailResult;
}

const findUserAccountByEmailIR: any = {
  usedParamSet: { email: true },
  params: [
    {
      name: "email",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 98, b: 104 }],
    },
  ],
  statement:
    "SELECT id, tenant_id, email, password_hash, roles, active\nFROM administration.users\nWHERE email = :email!",
};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, tenant_id, email, password_hash, roles, active
 * FROM administration.users
 * WHERE email = :email!
 * ```
 */
export const findUserAccountByEmail = new PreparedQuery<
  IFindUserAccountByEmailParams,
  IFindUserAccountByEmailResult
>(findUserAccountByEmailIR);
