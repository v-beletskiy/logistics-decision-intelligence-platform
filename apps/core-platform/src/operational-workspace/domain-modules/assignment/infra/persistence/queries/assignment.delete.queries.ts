/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteAssignment' parameters type */
export interface IDeleteAssignmentParams {
  id: string;
}

/** 'DeleteAssignment' return type */
export type IDeleteAssignmentResult = void;

/** 'DeleteAssignment' query type */
export interface IDeleteAssignmentQuery {
  params: IDeleteAssignmentParams;
  result: IDeleteAssignmentResult;
}

const deleteAssignmentIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":57,"b":60}]}],"statement":"DELETE FROM operational_workspace.assignments\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.assignments
 * WHERE id = :id!
 * ```
 */
export const deleteAssignment = new PreparedQuery<IDeleteAssignmentParams,IDeleteAssignmentResult>(deleteAssignmentIR);


