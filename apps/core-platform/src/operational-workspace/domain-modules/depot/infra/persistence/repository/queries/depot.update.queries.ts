/** Types generated for queries found in "src/operational-workspace/domain-modules/depot/infra/persistence/repository/queries/depot.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'UpdateDepot' parameters type */
export interface IUpdateDepotParams {
  buildingNumber: string;
  city: string;
  country: string;
  driverCapacity: number;
  driverCount: number;
  expectedRevision: NumberOrString;
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

/** 'UpdateDepot' return type */
export interface IUpdateDepotResult {
  revision: string;
}

/** 'UpdateDepot' query type */
export interface IUpdateDepotQuery {
  params: IUpdateDepotParams;
  result: IUpdateDepotResult;
}

const updateDepotIR: any = {"usedParamSet":{"name":true,"country":true,"stateOrRegion":true,"city":true,"street":true,"buildingNumber":true,"postalCode":true,"latitude":true,"longitude":true,"status":true,"vehicleCapacity":true,"driverCapacity":true,"vehicleCount":true,"driverCount":true,"tenantId":true,"id":true,"expectedRevision":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":47,"b":52}]},{"name":"country","required":true,"transform":{"type":"scalar"},"locs":[{"a":69,"b":77}]},{"name":"stateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":102,"b":115}]},{"name":"city","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":134}]},{"name":"street","required":true,"transform":{"type":"scalar"},"locs":[{"a":150,"b":157}]},{"name":"buildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":182,"b":197}]},{"name":"postalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":218,"b":229}]},{"name":"latitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":247,"b":256}]},{"name":"longitude","required":true,"transform":{"type":"scalar"},"locs":[{"a":275,"b":285}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":301,"b":308}]},{"name":"vehicleCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":334,"b":350}]},{"name":"driverCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":375,"b":390}]},{"name":"vehicleCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":413,"b":426}]},{"name":"driverCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":448,"b":460}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":533,"b":542}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":555,"b":558}]},{"name":"expectedRevision","required":true,"transform":{"type":"scalar"},"locs":[{"a":577,"b":594}]}],"statement":"UPDATE operational_workspace.depots\nSET name = :name!,\n    country = :country!,\n    state_or_region = :stateOrRegion,\n    city = :city!,\n    street = :street!,\n    building_number = :buildingNumber!,\n    postal_code = :postalCode!,\n    latitude = :latitude!,\n    longitude = :longitude!,\n    status = :status!,\n    vehicle_capacity = :vehicleCapacity!,\n    driver_capacity = :driverCapacity!,\n    vehicle_count = :vehicleCount!,\n    driver_count = :driverCount!,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.depots
 * SET name = :name!,
 *     country = :country!,
 *     state_or_region = :stateOrRegion,
 *     city = :city!,
 *     street = :street!,
 *     building_number = :buildingNumber!,
 *     postal_code = :postalCode!,
 *     latitude = :latitude!,
 *     longitude = :longitude!,
 *     status = :status!,
 *     vehicle_capacity = :vehicleCapacity!,
 *     driver_capacity = :driverCapacity!,
 *     vehicle_count = :vehicleCount!,
 *     driver_count = :driverCount!,
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateDepot = new PreparedQuery<IUpdateDepotParams,IUpdateDepotResult>(updateDepotIR);


