/** Types generated for queries found in "src/operational-workspace/domain-modules/shipment/infra/persistence/queries/shipment.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteShipment' parameters type */
export interface IDeleteShipmentParams {
  id: string;
  tenantId: string;
}

/** 'DeleteShipment' return type */
export type IDeleteShipmentResult = void;

/** 'DeleteShipment' query type */
export interface IDeleteShipmentQuery {
  params: IDeleteShipmentParams;
  result: IDeleteShipmentResult;
}

const deleteShipmentIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":62,"b":71}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":84,"b":87}]}],"statement":"DELETE FROM operational_workspace.shipments\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.shipments
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const deleteShipment = new PreparedQuery<IDeleteShipmentParams,IDeleteShipmentResult>(deleteShipmentIR);


