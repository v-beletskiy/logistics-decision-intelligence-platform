/** Types generated for queries found in "src/operational-workspace/domain-modules/depot/infra/persistence/queries/depot.insert.sql" */
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

const insertDepotIR: any = {"usedParamSet":{"id":true,"name":true,"country":true,"stateOrRegion":true,"city":true,"street":true,"buildingNumber":true,"postalCode":true,"status":true,"vehicleCapacity":true,"driverCapacity":true,"vehicleCount":true,"driverCount":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":207}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":210,"b":215}]},{"name":"country","required":true,"transform":{"type":"scalar"},"locs":[{"a":218,"b":226}]},{"name":"stateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":229,"b":242}]},{"name":"city","required":true,"transform":{"type":"scalar"},"locs":[{"a":245,"b":250}]},{"name":"street","required":true,"transform":{"type":"scalar"},"locs":[{"a":253,"b":260}]},{"name":"buildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":263,"b":278}]},{"name":"postalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":281,"b":292}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":295,"b":302}]},{"name":"vehicleCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":305,"b":321}]},{"name":"driverCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":324,"b":339}]},{"name":"vehicleCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":342,"b":355}]},{"name":"driverCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":358,"b":370}]}],"statement":"INSERT INTO operational_workspace.depots\n  (id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count)\nVALUES (:id!, :name!, :country!, :stateOrRegion, :city!, :street!, :buildingNumber!, :postalCode!, :status!, :vehicleCapacity!, :driverCapacity!, :vehicleCount!, :driverCount!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.depots
 *   (id, name, country, state_or_region, city, street, building_number, postal_code, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count)
 * VALUES (:id!, :name!, :country!, :stateOrRegion, :city!, :street!, :buildingNumber!, :postalCode!, :status!, :vehicleCapacity!, :driverCapacity!, :vehicleCount!, :driverCount!)
 * ```
 */
export const insertDepot = new PreparedQuery<IInsertDepotParams,IInsertDepotResult>(insertDepotIR);


