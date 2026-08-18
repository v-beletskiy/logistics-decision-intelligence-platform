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
  latitude: number;
  longitude: number;
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

const findDepotByIdIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":241,"b":250}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":263,"b":266}]}],"statement":"SELECT id, name, country, state_or_region, city, street, building_number, postal_code, latitude, longitude, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count, revision\nFROM operational_workspace.depots\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, name, country, state_or_region, city, street, building_number, postal_code, latitude, longitude, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count, revision
 * FROM operational_workspace.depots
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const findDepotById = new PreparedQuery<IFindDepotByIdParams,IFindDepotByIdResult>(findDepotByIdIR);


