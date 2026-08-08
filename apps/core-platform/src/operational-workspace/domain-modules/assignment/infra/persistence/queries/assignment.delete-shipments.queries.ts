/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.delete-shipments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteAssignmentShipments' parameters type */
export interface IDeleteAssignmentShipmentsParams {
  ids: readonly (string | null | void)[];
}

/** 'DeleteAssignmentShipments' return type */
export type IDeleteAssignmentShipmentsResult = void;

/** 'DeleteAssignmentShipments' query type */
export interface IDeleteAssignmentShipmentsQuery {
  params: IDeleteAssignmentShipmentsParams;
  result: IDeleteAssignmentShipmentsResult;
}

const deleteAssignmentShipmentsIR: any = {"usedParamSet":{"ids":true},"params":[{"name":"ids","required":false,"transform":{"type":"array_spread"},"locs":[{"a":67,"b":70}]}],"statement":"DELETE FROM operational_workspace.assignment_shipments\nWHERE id IN :ids"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.assignment_shipments
 * WHERE id IN :ids
 * ```
 */
export const deleteAssignmentShipments = new PreparedQuery<IDeleteAssignmentShipmentsParams,IDeleteAssignmentShipmentsResult>(deleteAssignmentShipmentsIR);


