/** Types generated for queries found in "src/administration/domain-modules/user/infra/persistence/repository/queries/user.find-by-email.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type stringArray = string[];

export interface IFindUserAccountByEmailParams {
  email: string;
}

export interface IFindUserAccountByEmailResult {
  active: boolean;
  email: string;
  id: string;
  password_hash: string;
  roles: stringArray;
  tenant_id: string;
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

export const findUserAccountByEmail = new PreparedQuery<
  IFindUserAccountByEmailParams,
  IFindUserAccountByEmailResult
>(findUserAccountByEmailIR);
