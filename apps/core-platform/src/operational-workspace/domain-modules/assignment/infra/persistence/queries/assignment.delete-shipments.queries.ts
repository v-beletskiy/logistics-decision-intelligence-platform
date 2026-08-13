/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.delete-shipments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteAssignmentShipments' parameters type */
export interface IDeleteAssignmentShipmentsParams {
  ids: readonly (string | null | void)[];
  ownerId: string;
  tenantId: string;
}

/** 'DeleteAssignmentShipments' return type */
export type IDeleteAssignmentShipmentsResult = void;

/** 'DeleteAssignmentShipments' query type */
export interface IDeleteAssignmentShipmentsQuery {
  params: IDeleteAssignmentShipmentsParams;
  result: IDeleteAssignmentShipmentsResult;
}

const deleteAssignmentShipmentsIR: any = {"usedParamSet":{"tenantId":true,"ownerId":true,"ids":true},"params":[{"name":"ids","required":false,"transform":{"type":"array_spread"},"locs":[{"a":128,"b":131}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":82}]},{"name":"ownerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":106,"b":114}]}],"statement":"DELETE FROM operational_workspace.assignment_shipments\nWHERE tenant_id = :tenantId!\n  AND assignment_id = :ownerId!\n  AND id IN :ids"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.assignment_shipments
 * WHERE tenant_id = :tenantId!
 *   AND assignment_id = :ownerId!
 *   AND id IN :ids
 * ```
 */
export const deleteAssignmentShipments = new PreparedQuery<IDeleteAssignmentShipmentsParams,IDeleteAssignmentShipmentsResult>(deleteAssignmentShipmentsIR);


