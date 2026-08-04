/** Types generated for queries found in "src/operational-workspace/domain-modules/driver/infra/persistence/queries/driver.insert.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertDriver' parameters type */
export interface IInsertDriverParams {
  depotId?: string | null | void;
  firstName: string;
  id: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber?: string | null | void;
  status: string;
}

/** 'InsertDriver' return type */
export type IInsertDriverResult = void;

/** 'InsertDriver' query type */
export interface IInsertDriverQuery {
  params: IInsertDriverParams;
  result: IInsertDriverResult;
}

const insertDriverIR: any = {"usedParamSet":{"id":true,"firstName":true,"lastName":true,"licenseNumber":true,"depotId":true,"phoneNumber":true,"status":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":128,"b":131}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":144}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":147,"b":156}]},{"name":"licenseNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":159,"b":173}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":176,"b":183}]},{"name":"phoneNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":186,"b":197}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":200,"b":207}]}],"statement":"INSERT INTO operational_workspace.drivers\n  (id, first_name, last_name, license_number, depot_id, phone_number, status)\nVALUES (:id!, :firstName!, :lastName!, :licenseNumber!, :depotId, :phoneNumber, :status!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.drivers
 *   (id, first_name, last_name, license_number, depot_id, phone_number, status)
 * VALUES (:id!, :firstName!, :lastName!, :licenseNumber!, :depotId, :phoneNumber, :status!)
 * ```
 */
export const insertDriver = new PreparedQuery<IInsertDriverParams,IInsertDriverResult>(insertDriverIR);


