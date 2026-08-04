/** Types generated for queries found in "src/operational-workspace/domain-modules/driver/infra/persistence/queries/driver.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateDriver' parameters type */
export interface IUpdateDriverParams {
  depotId?: string | null | void;
  firstName: string;
  id: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber?: string | null | void;
  status: string;
}

/** 'UpdateDriver' return type */
export type IUpdateDriverResult = void;

/** 'UpdateDriver' query type */
export interface IUpdateDriverQuery {
  params: IUpdateDriverParams;
  result: IUpdateDriverResult;
}

const updateDriverIR: any = {"usedParamSet":{"firstName":true,"lastName":true,"licenseNumber":true,"depotId":true,"phoneNumber":true,"status":true,"id":true},"params":[{"name":"firstName","required":true,"transform":{"type":"scalar"},"locs":[{"a":54,"b":64}]},{"name":"lastName","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":92}]},{"name":"licenseNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":116,"b":130}]},{"name":"depotId","required":false,"transform":{"type":"scalar"},"locs":[{"a":148,"b":155}]},{"name":"phoneNumber","required":false,"transform":{"type":"scalar"},"locs":[{"a":177,"b":188}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":211}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":248,"b":251}]}],"statement":"UPDATE operational_workspace.drivers\nSET first_name = :firstName!,\n    last_name = :lastName!,\n    license_number = :licenseNumber!,\n    depot_id = :depotId,\n    phone_number = :phoneNumber,\n    status = :status!,\n    updated_at = now()\nWHERE id = :id!"};

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
 *     updated_at = now()
 * WHERE id = :id!
 * ```
 */
export const updateDriver = new PreparedQuery<IUpdateDriverParams,IUpdateDriverResult>(updateDriverIR);


