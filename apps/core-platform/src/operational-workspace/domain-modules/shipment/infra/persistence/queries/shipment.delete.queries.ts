/** Types generated for queries found in "src/operational-workspace/domain-modules/shipment/infra/persistence/queries/shipment.delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteShipment' parameters type */
export interface IDeleteShipmentParams {
  id: string;
}

/** 'DeleteShipment' return type */
export type IDeleteShipmentResult = void;

/** 'DeleteShipment' query type */
export interface IDeleteShipmentQuery {
  params: IDeleteShipmentParams;
  result: IDeleteShipmentResult;
}

const deleteShipmentIR: any = {"usedParamSet":{"id":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":55,"b":58}]}],"statement":"DELETE FROM operational_workspace.shipments\nWHERE id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM operational_workspace.shipments
 * WHERE id = :id!
 * ```
 */
export const deleteShipment = new PreparedQuery<IDeleteShipmentParams,IDeleteShipmentResult>(deleteShipmentIR);


