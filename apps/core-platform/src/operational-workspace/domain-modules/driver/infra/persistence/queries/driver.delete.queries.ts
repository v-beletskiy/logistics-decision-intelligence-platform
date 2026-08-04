/** Types generated for queries found in "src/operational-workspace/domain-modules/driver/infra/persistence/queries/driver.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteDriver' parameters type */
export interface IDeleteDriverParams {
  id: string;
}

/** 'DeleteDriver' return type */
export type IDeleteDriverResult = void;

/** 'DeleteDriver' query type */
export interface IDeleteDriverQuery {
  params: IDeleteDriverParams;
  result: IDeleteDriverResult;
}

const deleteDriverIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":53,"b":56}]}],"statement":"DELETE FROM operational_workspace.drivers\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.drivers
 * WHERE id = :id!
 * ```
 */
export const deleteDriver = new PreparedQuery<IDeleteDriverParams,IDeleteDriverResult>(deleteDriverIR);


