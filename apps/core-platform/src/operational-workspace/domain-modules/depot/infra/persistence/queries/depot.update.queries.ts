/** Types generated for queries found in "src/operational-workspace/domain-modules/depot/infra/persistence/queries/depot.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateDepot' parameters type */
export interface IUpdateDepotParams {
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

/** 'UpdateDepot' return type */
export type IUpdateDepotResult = void;

/** 'UpdateDepot' query type */
export interface IUpdateDepotQuery {
  params: IUpdateDepotParams;
  result: IUpdateDepotResult;
}

const updateDepotIR: any = {"usedParamSet":{"name":true,"country":true,"stateOrRegion":true,"city":true,"street":true,"buildingNumber":true,"postalCode":true,"status":true,"vehicleCapacity":true,"driverCapacity":true,"vehicleCount":true,"driverCount":true,"tenantId":true,"id":true},"params":[{"name":"name","required":true,"transform":{"type":"scalar"},"locs":[{"a":47,"b":52}]},{"name":"country","required":true,"transform":{"type":"scalar"},"locs":[{"a":69,"b":77}]},{"name":"stateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":102,"b":115}]},{"name":"city","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":134}]},{"name":"street","required":true,"transform":{"type":"scalar"},"locs":[{"a":150,"b":157}]},{"name":"buildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":182,"b":197}]},{"name":"postalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":218,"b":229}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":245,"b":252}]},{"name":"vehicleCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":278,"b":294}]},{"name":"driverCapacity","required":true,"transform":{"type":"scalar"},"locs":[{"a":319,"b":334}]},{"name":"vehicleCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":357,"b":370}]},{"name":"driverCount","required":true,"transform":{"type":"scalar"},"locs":[{"a":392,"b":404}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":448,"b":457}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":470,"b":473}]}],"statement":"UPDATE operational_workspace.depots\nSET name = :name!,\n    country = :country!,\n    state_or_region = :stateOrRegion,\n    city = :city!,\n    street = :street!,\n    building_number = :buildingNumber!,\n    postal_code = :postalCode!,\n    status = :status!,\n    vehicle_capacity = :vehicleCapacity!,\n    driver_capacity = :driverCapacity!,\n    vehicle_count = :vehicleCount!,\n    driver_count = :driverCount!,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

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
 *     status = :status!,
 *     vehicle_capacity = :vehicleCapacity!,
 *     driver_capacity = :driverCapacity!,
 *     vehicle_count = :vehicleCount!,
 *     driver_count = :driverCount!,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const updateDepot = new PreparedQuery<IUpdateDepotParams,IUpdateDepotResult>(updateDepotIR);


