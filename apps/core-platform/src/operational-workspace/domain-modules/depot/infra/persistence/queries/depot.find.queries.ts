/** Types generated for queries found in "src/operational-workspace/domain-modules/depot/infra/persistence/queries/depot.find.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindDepots' parameters type */
export type IFindDepotsParams = void;

/** 'FindDepots' return type */
export interface IFindDepotsResult {
  building_number: string;
  city: string;
  country: string;
  driver_capacity: number;
  driver_count: number;
  id: string;
  name: string;
  postal_code: string;
  state_or_region: string | null;
  status: string;
  street: string;
  vehicle_capacity: number;
  vehicle_count: number;
}

/** 'FindDepots' query type */
export interface IFindDepotsQuery {
  params: IFindDepotsParams;
  result: IFindDepotsResult;
}

const findDepotsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count\nFROM operational_workspace.depots\nORDER BY name"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count
 * FROM operational_workspace.depots
 * ORDER BY name
 * ```
 */
export const findDepots = new PreparedQuery<IFindDepotsParams,IFindDepotsResult>(findDepotsIR);


