/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteAssignment' parameters type */
export interface IDeleteAssignmentParams {
  id: string;
  tenantId: string;
}

/** 'DeleteAssignment' return type */
export type IDeleteAssignmentResult = void;

/** 'DeleteAssignment' query type */
export interface IDeleteAssignmentQuery {
  params: IDeleteAssignmentParams;
  result: IDeleteAssignmentResult;
}

const deleteAssignmentIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":64,"b":73}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":86,"b":89}]}],"statement":"DELETE FROM operational_workspace.assignments\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.assignments
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const deleteAssignment = new PreparedQuery<IDeleteAssignmentParams,IDeleteAssignmentResult>(deleteAssignmentIR);


