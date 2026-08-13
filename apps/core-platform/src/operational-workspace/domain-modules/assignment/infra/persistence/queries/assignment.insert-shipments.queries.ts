/** Types generated for queries found in "src/operational-workspace/domain-modules/assignment/infra/persistence/queries/assignment.insert-shipments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertAssignmentShipments' parameters type */
export interface IInsertAssignmentShipmentsParams {
  rows: readonly ({
    tenantId: string | null | void,
    id: string | null | void,
    assignmentId: string | null | void,
    shipmentId: string | null | void,
    weight: number | null | void,
    weightUnit: string | null | void,
    length: number | null | void,
    width: number | null | void,
    height: number | null | void,
    dimensionUnit: string | null | void
  })[];
}

/** 'InsertAssignmentShipments' return type */
export type IInsertAssignmentShipmentsResult = void;

/** 'InsertAssignmentShipments' query type */
export interface IInsertAssignmentShipmentsQuery {
  params: IInsertAssignmentShipmentsParams;
  result: IInsertAssignmentShipmentsResult;
}

const insertAssignmentShipmentsIR: any = {"usedParamSet":{"rows":true},"params":[{"name":"rows","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"tenantId","required":false},{"name":"id","required":false},{"name":"assignmentId","required":false},{"name":"shipmentId","required":false},{"name":"weight","required":false},{"name":"weightUnit","required":false},{"name":"length","required":false},{"name":"width","required":false},{"name":"height","required":false},{"name":"dimensionUnit","required":false}]},"locs":[{"a":168,"b":172}]}],"statement":"INSERT INTO operational_workspace.assignment_shipments\n  (tenant_id, id, assignment_id, shipment_id, weight, weight_unit, length, width, height, dimension_unit)\nVALUES :rows"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.assignment_shipments
 *   (tenant_id, id, assignment_id, shipment_id, weight, weight_unit, length, width, height, dimension_unit)
 * VALUES :rows
 * ```
 */
export const insertAssignmentShipments = new PreparedQuery<IInsertAssignmentShipmentsParams,IInsertAssignmentShipmentsResult>(insertAssignmentShipmentsIR);


