/** Types generated for queries found in "src/operational-workspace/domain-modules/route/infra/persistence/queries/route.insert.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertRoute' parameters type */
export interface IInsertRouteParams {
  id: string;
  status: string;
}

/** 'InsertRoute' return type */
export type IInsertRouteResult = void;

/** 'InsertRoute' query type */
export interface IInsertRouteQuery {
  params: IInsertRouteParams;
  result: IInsertRouteResult;
}

const insertRouteIR: any = {"usedParamSet":{"id":true,"status":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":62,"b":65}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":75}]}],"statement":"INSERT INTO operational_workspace.routes (id, status)\nVALUES (:id!, :status!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.routes (id, status)
 * VALUES (:id!, :status!)
 * ```
 */
export const insertRoute = new PreparedQuery<IInsertRouteParams,IInsertRouteResult>(insertRouteIR);


