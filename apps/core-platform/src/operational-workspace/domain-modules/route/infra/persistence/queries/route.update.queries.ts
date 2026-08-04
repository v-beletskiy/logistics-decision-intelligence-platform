/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/queries/route.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateRoute' parameters type */
export interface IUpdateRouteParams {
  id: string;
  status: string;
}

/** 'UpdateRoute' return type */
export type IUpdateRouteResult = void;

/** 'UpdateRoute' query type */
export interface IUpdateRouteQuery {
  params: IUpdateRouteParams;
  result: IUpdateRouteResult;
}

const updateRouteIR: any = {"usedParamSet":{"status":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":49,"b":56}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":93,"b":96}]}],"statement":"UPDATE operational_workspace.routes\nSET status = :status!,\n    updated_at = now()\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.routes
 * SET status = :status!,
 *     updated_at = now()
 * WHERE id = :id!
 * ```
 */
export const updateRoute = new PreparedQuery<IUpdateRouteParams,IUpdateRouteResult>(updateRouteIR);


