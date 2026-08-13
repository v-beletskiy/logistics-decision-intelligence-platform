/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.delete-compartments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteVehicleCompartments' parameters type */
export interface IDeleteVehicleCompartmentsParams {
  ids: readonly (string | null | void)[];
  ownerId: string;
  tenantId: string;
}

/** 'DeleteVehicleCompartments' return type */
export type IDeleteVehicleCompartmentsResult = void;

/** 'DeleteVehicleCompartments' query type */
export interface IDeleteVehicleCompartmentsQuery {
  params: IDeleteVehicleCompartmentsParams;
  result: IDeleteVehicleCompartmentsResult;
}

const deleteVehicleCompartmentsIR: any = {"usedParamSet":{"tenantId":true,"ownerId":true,"ids":true},"params":[{"name":"ids","required":false,"transform":{"type":"array_spread"},"locs":[{"a":125,"b":128}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":82}]},{"name":"ownerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":103,"b":111}]}],"statement":"DELETE FROM operational_workspace.vehicle_compartments\nWHERE tenant_id = :tenantId!\n  AND vehicle_id = :ownerId!\n  AND id IN :ids"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.vehicle_compartments
 * WHERE tenant_id = :tenantId!
 *   AND vehicle_id = :ownerId!
 *   AND id IN :ids
 * ```
 */
export const deleteVehicleCompartments = new PreparedQuery<IDeleteVehicleCompartmentsParams,IDeleteVehicleCompartmentsResult>(deleteVehicleCompartmentsIR);


