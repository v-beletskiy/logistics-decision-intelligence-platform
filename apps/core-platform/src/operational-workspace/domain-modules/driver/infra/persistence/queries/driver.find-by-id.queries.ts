/** Types generated for queries found in "src/operational-workspace/domain-modules/driver/infra/persistence/queries/driver.find-by-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindDriverById' parameters type */
export interface IFindDriverByIdParams {
  id: string;
}

/** 'FindDriverById' return type */
export interface IFindDriverByIdResult {
  depot_id: string | null;
  first_name: string;
  id: string;
  last_name: string;
  license_number: string;
  phone_number: string | null;
  status: string;
}

/** 'FindDriverById' query type */
export interface IFindDriverByIdQuery {
  params: IFindDriverByIdParams;
  result: IFindDriverByIdResult;
}

const findDriverByIdIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":127,"b":130}]}],"statement":"SELECT id, first_name, last_name, license_number, depot_id, phone_number, status\nFROM operational_workspace.drivers\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, first_name, last_name, license_number, depot_id, phone_number, status
 * FROM operational_workspace.drivers
 * WHERE id = :id!
 * ```
 */
export const findDriverById = new PreparedQuery<IFindDriverByIdParams,IFindDriverByIdResult>(findDriverByIdIR);


