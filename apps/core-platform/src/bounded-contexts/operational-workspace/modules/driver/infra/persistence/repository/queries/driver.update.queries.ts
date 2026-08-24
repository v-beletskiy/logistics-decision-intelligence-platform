/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/driver/infra/persistence/repository/queries/driver.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type NumberOrString = number | string;

/** 'UpdateDriver' parameters type */
export interface IUpdateDriverParams {
  depotId?: string | null | void;
  expectedRevision: NumberOrString;
  firstName: string;
  id: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber?: string | null | void;
  status: string;
  tenantId: string;
}

/** 'UpdateDriver' return type */
export interface IUpdateDriverResult {
  revision: string;
}

/** 'UpdateDriver' query type */
export interface IUpdateDriverQuery {
  params: IUpdateDriverParams;
  result: IUpdateDriverResult;
}

const updateDriverIR: any = {"usedParamSet":{"firstName":true,"lastName":true,"licenseNumber":true,"depotId":true,"phoneNumber":true,"status":true,"tenantId":true,"id":true,"expectedRevision":true},"params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":54,"b":64}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":92}]},{"name":"licenseNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":130}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":148,"b":155}]},{"name":"phoneNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":177,"b":188}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":211}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":284,"b":293}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":306,"b":309}]},{"name":"expectedRevision","required":true,"transform":{"type":"scalar"},"locs":[{"a":328,"b":345}]}],"statement":"UPDATE operational_workspace.drivers\nSET first_name = :firstName!,\n    last_name = :lastName!,\n    license_number = :licenseNumber!,\n    depot_id = :depotId,\n    phone_number = :phoneNumber,\n    status = :status!,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.drivers
 * SET first_name = :firstName!,
 *     last_name = :lastName!,
 *     license_number = :licenseNumber!,
 *     depot_id = :depotId,
 *     phone_number = :phoneNumber,
 *     status = :status!,
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateDriver = new PreparedQuery<IUpdateDriverParams,IUpdateDriverResult>(updateDriverIR);
