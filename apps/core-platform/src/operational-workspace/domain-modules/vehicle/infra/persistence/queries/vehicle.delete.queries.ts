/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteVehicle' parameters type */
export interface IDeleteVehicleParams {
  id: string;
  tenantId: string;
}

/** 'DeleteVehicle' return type */
export type IDeleteVehicleResult = void;

/** 'DeleteVehicle' query type */
export interface IDeleteVehicleQuery {
  params: IDeleteVehicleParams;
  result: IDeleteVehicleResult;
}

const deleteVehicleIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":61,"b":70}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":86}]}],"statement":"DELETE FROM operational_workspace.vehicles\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.vehicles
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const deleteVehicle = new PreparedQuery<IDeleteVehicleParams,IDeleteVehicleResult>(deleteVehicleIR);


