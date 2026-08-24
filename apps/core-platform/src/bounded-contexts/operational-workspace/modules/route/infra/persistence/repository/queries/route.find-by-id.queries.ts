/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/route/infra/persistence/repository/queries/route.find-by-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindRouteById' parameters type */
export interface IFindRouteByIdParams {
  id: string;
  tenantId: string;
}

/** 'FindRouteById' return type */
export interface IFindRouteByIdResult {
  active_stop_sequence: number | null;
  id: string;
  next_stop_sequence: number;
  planned_stop_count: number;
  revision: string;
  status: string;
}

/** 'FindRouteById' query type */
export interface IFindRouteByIdQuery {
  params: IFindRouteByIdParams;
  result: IFindRouteByIdResult;
}

const findRouteByIdIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":170,"b":179}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":194,"b":197}]}],"statement":"SELECT\n  r.id,\n  r.status,\n  r.planned_stop_count,\n  r.next_stop_sequence,\n  r.active_stop_sequence,\n  r.revision\nFROM operational_workspace.routes r\nWHERE r.tenant_id = :tenantId!\n  AND r.id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   r.id,
 *   r.status,
 *   r.planned_stop_count,
 *   r.next_stop_sequence,
 *   r.active_stop_sequence,
 *   r.revision
 * FROM operational_workspace.routes r
 * WHERE r.tenant_id = :tenantId!
 *   AND r.id = :id!
 * ```
 */
export const findRouteById = new PreparedQuery<IFindRouteByIdParams,IFindRouteByIdResult>(findRouteByIdIR);
