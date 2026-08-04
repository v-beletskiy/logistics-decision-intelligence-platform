/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.delete-compartments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteVehicleCompartments' parameters type */
export interface IDeleteVehicleCompartmentsParams {
  ids: readonly (string | null | void)[];
}

/** 'DeleteVehicleCompartments' return type */
export type IDeleteVehicleCompartmentsResult = void;

/** 'DeleteVehicleCompartments' query type */
export interface IDeleteVehicleCompartmentsQuery {
  params: IDeleteVehicleCompartmentsParams;
  result: IDeleteVehicleCompartmentsResult;
}

const deleteVehicleCompartmentsIR: any = {"usedParamSet":{"ids":true},"params":[{"name":"ids","required":false,"transform":{"type":"array_spread"},"locs":[{"a":67,"b":70}]}],"statement":"DELETE FROM operational_workspace.vehicle_compartments\nWHERE id IN :ids"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.vehicle_compartments
 * WHERE id IN :ids
 * ```
 */
export const deleteVehicleCompartments = new PreparedQuery<IDeleteVehicleCompartmentsParams,IDeleteVehicleCompartmentsResult>(deleteVehicleCompartmentsIR);


