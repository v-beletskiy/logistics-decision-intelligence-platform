/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/assignment/infra/persistence/repository/queries/assignment.reconcile-shipments.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type numberArray = number[];

export type stringArray = string[];

/** 'ReconcileAssignmentShipments' parameters type */
export interface IReconcileAssignmentShipmentsParams {
  assignmentId: string;
  dimensionUnits: stringArray;
  heights: numberArray;
  ids: stringArray;
  lengths: numberArray;
  shipmentIds: stringArray;
  tenantId: string;
  weights: numberArray;
  weightUnits: stringArray;
  widths: numberArray;
}

/** 'ReconcileAssignmentShipments' return type */
export interface IReconcileAssignmentShipmentsResult {
  deletedCount: number;
  upsertedCount: number;
}

/** 'ReconcileAssignmentShipments' query type */
export interface IReconcileAssignmentShipmentsQuery {
  params: IReconcileAssignmentShipmentsParams;
  result: IReconcileAssignmentShipmentsResult;
}

const reconcileAssignmentShipmentsIR: any = {
  usedParamSet: {
    ids: true,
    shipmentIds: true,
    weights: true,
    weightUnits: true,
    lengths: true,
    widths: true,
    heights: true,
    dimensionUnits: true,
    tenantId: true,
    assignmentId: true,
  },
  params: [
    {
      name: "ids",
      required: true,
      transform: { type: "scalar" },
      locs: [
        { a: 49, b: 53 },
        { a: 1617, b: 1621 },
      ],
    },
    {
      name: "shipmentIds",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 68, b: 80 }],
    },
    {
      name: "weights",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 95, b: 103 }],
    },
    {
      name: "weightUnits",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 130, b: 142 }],
    },
    {
      name: "lengths",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 157, b: 165 }],
    },
    {
      name: "widths",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 192, b: 199 }],
    },
    {
      name: "heights",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 226, b: 234 }],
    },
    {
      name: "dimensionUnits",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 261, b: 276 }],
    },
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [
        { a: 591, b: 600 },
        { a: 1533, b: 1542 },
      ],
    },
    {
      name: "assignmentId",
      required: true,
      transform: { type: "scalar" },
      locs: [
        { a: 603, b: 616 },
        { a: 1576, b: 1589 },
      ],
    },
  ],
  statement:
    'WITH incoming AS (\n  SELECT *\n  FROM unnest(\n    :ids!::uuid[],\n    :shipmentIds!::uuid[],\n    :weights!::double precision[],\n    :weightUnits!::text[],\n    :lengths!::double precision[],\n    :widths!::double precision[],\n    :heights!::double precision[],\n    :dimensionUnits!::text[]\n  ) AS values(id, shipment_id, weight, weight_unit, length, width, height, dimension_unit)\n),\nupserted AS (\n  INSERT INTO operational_workspace.assignment_shipments AS current (\n    tenant_id, assignment_id, id, shipment_id, weight, weight_unit,\n    length, width, height, dimension_unit\n  )\n  SELECT\n    :tenantId!, :assignmentId!, incoming.id, incoming.shipment_id,\n    incoming.weight, incoming.weight_unit, incoming.length, incoming.width,\n    incoming.height, incoming.dimension_unit\n  FROM incoming\n  ON CONFLICT (tenant_id, assignment_id, id) DO UPDATE SET\n    shipment_id = EXCLUDED.shipment_id,\n    weight = EXCLUDED.weight,\n    weight_unit = EXCLUDED.weight_unit,\n    length = EXCLUDED.length,\n    width = EXCLUDED.width,\n    height = EXCLUDED.height,\n    dimension_unit = EXCLUDED.dimension_unit\n  WHERE (\n    current.shipment_id, current.weight, current.weight_unit, current.length,\n    current.width, current.height, current.dimension_unit\n  ) IS DISTINCT FROM (\n    EXCLUDED.shipment_id, EXCLUDED.weight, EXCLUDED.weight_unit, EXCLUDED.length,\n    EXCLUDED.width, EXCLUDED.height, EXCLUDED.dimension_unit\n  )\n  RETURNING id\n),\ndeleted AS (\n  DELETE FROM operational_workspace.assignment_shipments current\n  WHERE current.tenant_id = :tenantId!\n    AND current.assignment_id = :assignmentId!\n    AND current.id <> ALL(:ids!::uuid[])\n  RETURNING id\n)\nSELECT\n  (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",\n  (SELECT count(*)::integer FROM deleted) AS "deletedCount!"',
};

/**
 * Query generated from SQL:
 * ```
 * WITH incoming AS (
 *   SELECT *
 *   FROM unnest(
 *     :ids!::uuid[],
 *     :shipmentIds!::uuid[],
 *     :weights!::double precision[],
 *     :weightUnits!::text[],
 *     :lengths!::double precision[],
 *     :widths!::double precision[],
 *     :heights!::double precision[],
 *     :dimensionUnits!::text[]
 *   ) AS values(id, shipment_id, weight, weight_unit, length, width, height, dimension_unit)
 * ),
 * upserted AS (
 *   INSERT INTO operational_workspace.assignment_shipments AS current (
 *     tenant_id, assignment_id, id, shipment_id, weight, weight_unit,
 *     length, width, height, dimension_unit
 *   )
 *   SELECT
 *     :tenantId!, :assignmentId!, incoming.id, incoming.shipment_id,
 *     incoming.weight, incoming.weight_unit, incoming.length, incoming.width,
 *     incoming.height, incoming.dimension_unit
 *   FROM incoming
 *   ON CONFLICT (tenant_id, assignment_id, id) DO UPDATE SET
 *     shipment_id = EXCLUDED.shipment_id,
 *     weight = EXCLUDED.weight,
 *     weight_unit = EXCLUDED.weight_unit,
 *     length = EXCLUDED.length,
 *     width = EXCLUDED.width,
 *     height = EXCLUDED.height,
 *     dimension_unit = EXCLUDED.dimension_unit
 *   WHERE (
 *     current.shipment_id, current.weight, current.weight_unit, current.length,
 *     current.width, current.height, current.dimension_unit
 *   ) IS DISTINCT FROM (
 *     EXCLUDED.shipment_id, EXCLUDED.weight, EXCLUDED.weight_unit, EXCLUDED.length,
 *     EXCLUDED.width, EXCLUDED.height, EXCLUDED.dimension_unit
 *   )
 *   RETURNING id
 * ),
 * deleted AS (
 *   DELETE FROM operational_workspace.assignment_shipments current
 *   WHERE current.tenant_id = :tenantId!
 *     AND current.assignment_id = :assignmentId!
 *     AND current.id <> ALL(:ids!::uuid[])
 *   RETURNING id
 * )
 * SELECT
 *   (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
 *   (SELECT count(*)::integer FROM deleted) AS "deletedCount!"
 * ```
 */
export const reconcileAssignmentShipments = new PreparedQuery<
  IReconcileAssignmentShipmentsParams,
  IReconcileAssignmentShipmentsResult
>(reconcileAssignmentShipmentsIR);
