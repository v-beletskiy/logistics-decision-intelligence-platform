/** Types generated for queries found in "src/operational-workspace/domain-modules/driver/infra/persistence/queries/driver.find-available.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindAvailableDrivers' parameters type */
export interface IFindAvailableDriversParams {
  status: string;
}

/** 'FindAvailableDrivers' return type */
export interface IFindAvailableDriversResult {
  depot_id: string | null;
  first_name: string;
  id: string;
  last_name: string;
  license_number: string;
  phone_number: string | null;
  status: string;
}

/** 'FindAvailableDrivers' query type */
export interface IFindAvailableDriversQuery {
  params: IFindAvailableDriversParams;
  result: IFindAvailableDriversResult;
}

const findAvailableDriversIR: any = {"usedParamSet":{"status":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":138}]}],"statement":"SELECT id, first_name, last_name, license_number, depot_id, phone_number, status\nFROM operational_workspace.drivers\nWHERE status = :status!\nORDER BY last_name, first_name"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, first_name, last_name, license_number, depot_id, phone_number, status
 * FROM operational_workspace.drivers
 * WHERE status = :status!
 * ORDER BY last_name, first_name
 * ```
 */
export const findAvailableDrivers = new PreparedQuery<IFindAvailableDriversParams,IFindAvailableDriversResult>(findAvailableDriversIR);


