/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.insert.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertVehicle' parameters type */
export interface IInsertVehicleParams {
  depotId?: string | null | void;
  id: string;
  name?: string | null | void;
  registrationNumber: string;
  status: string;
}

/** 'InsertVehicle' return type */
export type IInsertVehicleResult = void;

/** 'InsertVehicle' query type */
export interface IInsertVehicleQuery {
  params: IInsertVehicleParams;
  result: IInsertVehicleResult;
}

const insertVehicleIR: any = {"usedParamSet":{"id":true,"registrationNumber":true,"name":true,"depotId":true,"status":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":101,"b":104}]},{"name":"registrationNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":107,"b":126}]},{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":129,"b":133}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":136,"b":143}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":146,"b":153}]}],"statement":"INSERT INTO operational_workspace.vehicles (id, registration_number, name, depot_id, status)\nVALUES (:id!, :registrationNumber!, :name, :depotId, :status!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.vehicles (id, registration_number, name, depot_id, status)
 * VALUES (:id!, :registrationNumber!, :name, :depotId, :status!)
 * ```
 */
export const insertVehicle = new PreparedQuery<IInsertVehicleParams,IInsertVehicleResult>(insertVehicleIR);


