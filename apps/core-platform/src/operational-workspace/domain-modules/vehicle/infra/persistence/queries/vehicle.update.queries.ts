/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateVehicle' parameters type */
export interface IUpdateVehicleParams {
  depotId?: string | null | void;
  id: string;
  name?: string | null | void;
  registrationNumber: string;
  status: string;
  tenantId: string;
}

/** 'UpdateVehicle' return type */
export type IUpdateVehicleResult = void;

/** 'UpdateVehicle' query type */
export interface IUpdateVehicleQuery {
  params: IUpdateVehicleParams;
  result: IUpdateVehicleResult;
}

const updateVehicleIR: any = {"usedParamSet":{"registrationNumber":true,"name":true,"depotId":true,"status":true,"tenantId":true,"id":true},"params":[{"name":"registrationNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":83}]},{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":97,"b":101}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":119,"b":126}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":149}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":193,"b":202}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":215,"b":218}]}],"statement":"UPDATE operational_workspace.vehicles\nSET registration_number = :registrationNumber!,\n    name = :name,\n    depot_id = :depotId,\n    status = :status!,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.vehicles
 * SET registration_number = :registrationNumber!,
 *     name = :name,
 *     depot_id = :depotId,
 *     status = :status!,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const updateVehicle = new PreparedQuery<IUpdateVehicleParams,IUpdateVehicleResult>(updateVehicleIR);


