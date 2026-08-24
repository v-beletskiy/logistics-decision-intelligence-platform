/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/vehicle/infra/persistence/repository/queries/vehicle.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'UpdateVehicle' parameters type */
export interface IUpdateVehicleParams {
  depotId?: string | null | void;
  expectedRevision: NumberOrString;
  id: string;
  name?: string | null | void;
  registrationNumber: string;
  status: string;
  tenantId: string;
}

/** 'UpdateVehicle' return type */
export interface IUpdateVehicleResult {
  revision: string;
}

/** 'UpdateVehicle' query type */
export interface IUpdateVehicleQuery {
  params: IUpdateVehicleParams;
  result: IUpdateVehicleResult;
}

const updateVehicleIR: any = {"usedParamSet":{"registrationNumber":true,"name":true,"depotId":true,"status":true,"tenantId":true,"id":true,"expectedRevision":true},"params":[{"name":"registrationNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":83}]},{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":97,"b":101}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":119,"b":126}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":149}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":222,"b":231}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":244,"b":247}]},{"name":"expectedRevision","required":true,"transform":{"type":"scalar"},"locs":[{"a":266,"b":283}]}],"statement":"UPDATE operational_workspace.vehicles\nSET registration_number = :registrationNumber!,\n    name = :name,\n    depot_id = :depotId,\n    status = :status!,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.vehicles
 * SET registration_number = :registrationNumber!,
 *     name = :name,
 *     depot_id = :depotId,
 *     status = :status!,
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateVehicle = new PreparedQuery<IUpdateVehicleParams,IUpdateVehicleResult>(updateVehicleIR);
