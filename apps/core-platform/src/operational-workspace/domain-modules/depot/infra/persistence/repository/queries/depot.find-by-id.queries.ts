/** Types generated for queries found in "src/operational-workspace/domain-modules/depot/infra/persistence/repository/queries/depot.find-by-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindDepotById' parameters type */
export interface IFindDepotByIdParams {
  id: string;
  tenantId: string;
}

/** 'FindDepotById' return type */
export interface IFindDepotByIdResult {
  building_number: string;
  city: string;
  country: string;
  driver_capacity: number;
  driver_count: number;
  id: string;
  name: string;
  postal_code: string;
  revision: string;
  state_or_region: string | null;
  status: string;
  street: string;
  vehicle_capacity: number;
  vehicle_count: number;
}

/** 'FindDepotById' query type */
export interface IFindDepotByIdQuery {
  params: IFindDepotByIdParams;
  result: IFindDepotByIdResult;
}

const findDepotByIdIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":220,"b":229}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":242,"b":245}]}],"statement":"SELECT id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count, revision\nFROM operational_workspace.depots\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count, revision
 * FROM operational_workspace.depots
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const findDepotById = new PreparedQuery<IFindDepotByIdParams,IFindDepotByIdResult>(findDepotByIdIR);


