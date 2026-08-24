/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/driver/infra/persistence/repository/queries/driver.insert.sql" */
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
  tenantId: string;
}

/** 'InsertDriver' return type */
export type IInsertDriverResult = void;

/** 'InsertDriver' query type */
export interface IInsertDriverQuery {
  params: IInsertDriverParams;
  result: IInsertDriverResult;
}

const insertDriverIR: any = {"usedParamSet":{"tenantId":true,"id":true,"firstName":true,"lastName":true,"licenseNumber":true,"depotId":true,"phoneNumber":true,"status":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":154,"b":163}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":166,"b":169}]},{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":172,"b":182}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":185,"b":194}]},{"name":"licenseNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":197,"b":211}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":214,"b":221}]},{"name":"phoneNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":227,"b":238}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":241,"b":248}]}],"statement":"INSERT INTO operational_workspace.drivers\n  (tenant_id, id, first_name, last_name, license_number, depot_id, phone_number,\n   status, revision)\nVALUES\n  (:tenantId!, :id!, :firstName!, :lastName!, :licenseNumber!, :depotId,\n   :phoneNumber, :status!, 1)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.drivers
 *   (tenant_id, id, first_name, last_name, license_number, depot_id, phone_number,
 *    status, revision)
 * VALUES
 *   (:tenantId!, :id!, :firstName!, :lastName!, :licenseNumber!, :depotId,
 *    :phoneNumber, :status!, 1)
 * ```
 */
export const insertDriver = new PreparedQuery<IInsertDriverParams,IInsertDriverResult>(insertDriverIR);
