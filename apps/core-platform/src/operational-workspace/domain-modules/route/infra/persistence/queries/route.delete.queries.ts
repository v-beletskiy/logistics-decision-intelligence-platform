/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/queries/route.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteRoute' parameters type */
export interface IDeleteRouteParams {
  id: string;
}

/** 'DeleteRoute' return type */
export type IDeleteRouteResult = void;

/** 'DeleteRoute' query type */
export interface IDeleteRouteQuery {
  params: IDeleteRouteParams;
  result: IDeleteRouteResult;
}

const deleteRouteIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":52,"b":55}]}],"statement":"DELETE FROM operational_workspace.routes\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.routes
 * WHERE id = :id!
 * ```
 */
export const deleteRoute = new PreparedQuery<IDeleteRouteParams,IDeleteRouteResult>(deleteRouteIR);


