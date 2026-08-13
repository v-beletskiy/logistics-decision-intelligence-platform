/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.insert.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertVehicle' parameters type */
export interface IInsertVehicleParams {
  depotId?: string | null | void;
  id: string;
  name?: string | null | void;
  registrationNumber: string;
  status: string;
  tenantId: string;
}

/** 'InsertVehicle' return type */
export type IInsertVehicleResult = void;

/** 'InsertVehicle' query type */
export interface IInsertVehicleQuery {
  params: IInsertVehicleParams;
  result: IInsertVehicleResult;
}

const insertVehicleIR: any = {"usedParamSet":{"tenantId":true,"id":true,"registrationNumber":true,"name":true,"depotId":true,"status":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":112,"b":121}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":124,"b":127}]},{"name":"registrationNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":130,"b":149}]},{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":152,"b":156}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":159,"b":166}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":169,"b":176}]}],"statement":"INSERT INTO operational_workspace.vehicles (tenant_id, id, registration_number, name, depot_id, status)\nVALUES (:tenantId!, :id!, :registrationNumber!, :name, :depotId, :status!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.vehicles (tenant_id, id, registration_number, name, depot_id, status)
 * VALUES (:tenantId!, :id!, :registrationNumber!, :name, :depotId, :status!)
 * ```
 */
export const insertVehicle = new PreparedQuery<IInsertVehicleParams,IInsertVehicleResult>(insertVehicleIR);


