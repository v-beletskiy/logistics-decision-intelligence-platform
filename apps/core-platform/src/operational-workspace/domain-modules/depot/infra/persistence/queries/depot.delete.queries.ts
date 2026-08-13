/** Types generated for queries found in "src/operational-workspace/domain-modules/depot/infra/persistence/queries/depot.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteDepot' parameters type */
export interface IDeleteDepotParams {
  id: string;
  tenantId: string;
}

/** 'DeleteDepot' return type */
export type IDeleteDepotResult = void;

/** 'DeleteDepot' query type */
export interface IDeleteDepotQuery {
  params: IDeleteDepotParams;
  result: IDeleteDepotResult;
}

const deleteDepotIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":59,"b":68}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":81,"b":84}]}],"statement":"DELETE FROM operational_workspace.depots\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.depots
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const deleteDepot = new PreparedQuery<IDeleteDepotParams,IDeleteDepotResult>(deleteDepotIR);


