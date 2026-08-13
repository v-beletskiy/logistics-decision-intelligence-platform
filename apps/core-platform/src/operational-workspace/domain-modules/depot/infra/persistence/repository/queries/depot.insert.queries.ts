/** Types generated for queries found in "src/operational-workspace/domain-modules/depot/infra/persistence/repository/queries/depot.insert.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertDepot' parameters type */
export interface IInsertDepotParams {
  buildingNumber: string;
  city: string;
  country: string;
  driverCapacity: number;
  driverCount: number;
  id: string;
  name: string;
  postalCode: string;
  stateOrRegion?: string | null | void;
  status: string;
  street: string;
  tenantId: string;
  vehicleCapacity: number;
  vehicleCount: number;
}

/** 'InsertDepot' return type */
export type IInsertDepotResult = void;

/** 'InsertDepot' query type */
export interface IInsertDepotQuery {
  params: IInsertDepotParams;
  result: IInsertDepotResult;
}

const insertDepotIR: any = {"usedParamSet":{"tenantId":true,"id":true,"name":true,"country":true,"stateOrRegion":true,"city":true,"street":true,"buildingNumber":true,"postalCode":true,"status":true,"vehicleCapacity":true,"driverCapacity":true,"vehicleCount":true,"driverCount":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":215,"b":224}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":227,"b":230}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":233,"b":238}]},{"name":"country","required":true,"transform":{"type":"scalar"},"locs":[{"a":241,"b":249}]},{"name":"stateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":252,"b":265}]},{"name":"city","required":true,"transform":{"type":"scalar"},"locs":[{"a":268,"b":273}]},{"name":"street","required":true,"transform":{"type":"scalar"},"locs":[{"a":276,"b":283}]},{"name":"buildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":286,"b":301}]},{"name":"postalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":304,"b":315}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":318,"b":325}]},{"name":"vehicleCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":328,"b":344}]},{"name":"driverCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":347,"b":362}]},{"name":"vehicleCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":365,"b":378}]},{"name":"driverCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":381,"b":393}]}],"statement":"INSERT INTO operational_workspace.depots\n  (tenant_id, id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count)\nVALUES (:tenantId!, :id!, :name!, :country!, :stateOrRegion, :city!, :street!, :buildingNumber!, :postalCode!, :status!, :vehicleCapacity!, :driverCapacity!, :vehicleCount!, :driverCount!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.depots
 *   (tenant_id, id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count)
 * VALUES (:tenantId!, :id!, :name!, :country!, :stateOrRegion, :city!, :street!, :buildingNumber!, :postalCode!, :status!, :vehicleCapacity!, :driverCapacity!, :vehicleCount!, :driverCount!)
 * ```
 */
export const insertDepot = new PreparedQuery<IInsertDepotParams,IInsertDepotResult>(insertDepotIR);


