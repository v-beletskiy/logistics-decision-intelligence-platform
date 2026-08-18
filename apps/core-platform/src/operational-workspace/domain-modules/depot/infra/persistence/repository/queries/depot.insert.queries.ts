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
  latitude: number;
  longitude: number;
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

const insertDepotIR: any = {"usedParamSet":{"tenantId":true,"id":true,"name":true,"country":true,"stateOrRegion":true,"city":true,"street":true,"buildingNumber":true,"postalCode":true,"latitude":true,"longitude":true,"status":true,"vehicleCapacity":true,"driverCapacity":true,"vehicleCount":true,"driverCount":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":236,"b":245}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":248,"b":251}]},{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":254,"b":259}]},{"name":"country","required":true,"transform":{"type":"scalar"},"locs":[{"a":262,"b":270}]},{"name":"stateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":273,"b":286}]},{"name":"city","required":true,"transform":{"type":"scalar"},"locs":[{"a":289,"b":294}]},{"name":"street","required":true,"transform":{"type":"scalar"},"locs":[{"a":297,"b":304}]},{"name":"buildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":307,"b":322}]},{"name":"postalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":325,"b":336}]},{"name":"latitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":339,"b":348}]},{"name":"longitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":351,"b":361}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":364,"b":371}]},{"name":"vehicleCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":374,"b":390}]},{"name":"driverCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":393,"b":408}]},{"name":"vehicleCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":411,"b":424}]},{"name":"driverCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":427,"b":439}]}],"statement":"INSERT INTO operational_workspace.depots\n  (tenant_id, id, name, country, state_or_region, city, street, building_number, postal_code, latitude, longitude, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count)\nVALUES (:tenantId!, :id!, :name!, :country!, :stateOrRegion, :city!, :street!, :buildingNumber!, :postalCode!, :latitude!, :longitude!, :status!, :vehicleCapacity!, :driverCapacity!, :vehicleCount!, :driverCount!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.depots
 *   (tenant_id, id, name, country, state_or_region, city, street, building_number, postal_code, latitude, longitude, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count)
 * VALUES (:tenantId!, :id!, :name!, :country!, :stateOrRegion, :city!, :street!, :buildingNumber!, :postalCode!, :latitude!, :longitude!, :status!, :vehicleCapacity!, :driverCapacity!, :vehicleCount!, :driverCount!)
 * ```
 */
export const insertDepot = new PreparedQuery<IInsertDepotParams,IInsertDepotResult>(insertDepotIR);


