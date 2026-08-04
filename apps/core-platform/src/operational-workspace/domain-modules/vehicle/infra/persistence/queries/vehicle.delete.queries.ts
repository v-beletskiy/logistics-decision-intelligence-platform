/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteVehicle' parameters type */
export interface IDeleteVehicleParams {
  id: string;
}

/** 'DeleteVehicle' return type */
export type IDeleteVehicleResult = void;

/** 'DeleteVehicle' query type */
export interface IDeleteVehicleQuery {
  params: IDeleteVehicleParams;
  result: IDeleteVehicleResult;
}

const deleteVehicleIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":54,"b":57}]}],"statement":"DELETE FROM operational_workspace.vehicles\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.vehicles
 * WHERE id = :id!
 * ```
 */
export const deleteVehicle = new PreparedQuery<IDeleteVehicleParams,IDeleteVehicleResult>(deleteVehicleIR);


