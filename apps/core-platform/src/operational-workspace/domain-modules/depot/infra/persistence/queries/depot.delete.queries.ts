/** Types generated for queries found in "src/operational-workspace/domain-modules/depot/infra/persistence/queries/depot.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteDepot' parameters type */
export interface IDeleteDepotParams {
  id: string;
}

/** 'DeleteDepot' return type */
export type IDeleteDepotResult = void;

/** 'DeleteDepot' query type */
export interface IDeleteDepotQuery {
  params: IDeleteDepotParams;
  result: IDeleteDepotResult;
}

const deleteDepotIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":52,"b":55}]}],"statement":"DELETE FROM operational_workspace.depots\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.depots
 * WHERE id = :id!
 * ```
 */
export const deleteDepot = new PreparedQuery<IDeleteDepotParams,IDeleteDepotResult>(deleteDepotIR);


