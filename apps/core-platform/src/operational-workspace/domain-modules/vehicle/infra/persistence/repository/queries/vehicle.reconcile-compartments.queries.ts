/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/repository/queries/vehicle.reconcile-compartments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'ReconcileVehicleCompartments' parameters type */
export interface IReconcileVehicleCompartmentsParams {
  dimensionUnits: stringArray;
  ids: stringArray;
  maxHeights: numberArray;
  maxLengths: numberArray;
  maxVolumes: numberArray;
  maxVolumeUnits: stringArray;
  maxWeights: numberArray;
  maxWeightUnits: stringArray;
  maxWidths: numberArray;
  names: stringArray;
  tenantId: string;
  types: stringArray;
  vehicleId: string;
}

/** 'ReconcileVehicleCompartments' return type */
export interface IReconcileVehicleCompartmentsResult {
  deletedCount: number;
  upsertedCount: number;
}

/** 'ReconcileVehicleCompartments' query type */
export interface IReconcileVehicleCompartmentsQuery {
  params: IReconcileVehicleCompartmentsParams;
  result: IReconcileVehicleCompartmentsResult;
}

const reconcileVehicleCompartmentsIR: any = {"usedParamSet":{"ids":true,"types":true,"names":true,"maxWeights":true,"maxWeightUnits":true,"maxLengths":true,"maxWidths":true,"maxHeights":true,"dimensionUnits":true,"maxVolumes":true,"maxVolumeUnits":true,"tenantId":true,"vehicleId":true},"params":[{"name":"ids","required":true,"transform":{"type":"scalar"},"locs":[{"a":49,"b":53},{"a":2184,"b":2188}]},{"name":"types","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":74}]},{"name":"names","required":true,"transform":{"type":"scalar"},"locs":[{"a":89,"b":95}]},{"name":"maxWeights","required":true,"transform":{"type":"scalar"},"locs":[{"a":110,"b":121}]},{"name":"maxWeightUnits","required":true,"transform":{"type":"scalar"},"locs":[{"a":148,"b":163}]},{"name":"maxLengths","required":true,"transform":{"type":"scalar"},"locs":[{"a":178,"b":189}]},{"name":"maxWidths","required":true,"transform":{"type":"scalar"},"locs":[{"a":216,"b":226}]},{"name":"maxHeights","required":true,"transform":{"type":"scalar"},"locs":[{"a":253,"b":264}]},{"name":"dimensionUnits","required":true,"transform":{"type":"scalar"},"locs":[{"a":291,"b":306}]},{"name":"maxVolumes","required":true,"transform":{"type":"scalar"},"locs":[{"a":321,"b":332}]},{"name":"maxVolumeUnits","required":true,"transform":{"type":"scalar"},"locs":[{"a":359,"b":374}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":782,"b":791},{"a":2106,"b":2115}]},{"name":"vehicleId","required":true,"transform":{"type":"scalar"},"locs":[{"a":794,"b":804},{"a":2146,"b":2156}]}],"statement":"WITH incoming AS (\n  SELECT *\n  FROM unnest(\n    :ids!::uuid[],\n    :types!::text[],\n    :names!::text[],\n    :maxWeights!::double precision[],\n    :maxWeightUnits!::text[],\n    :maxLengths!::double precision[],\n    :maxWidths!::double precision[],\n    :maxHeights!::double precision[],\n    :dimensionUnits!::text[],\n    :maxVolumes!::double precision[],\n    :maxVolumeUnits!::text[]\n  ) AS values(id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit)\n),\nupserted AS (\n  INSERT INTO operational_workspace.vehicle_compartments AS current (\n    tenant_id, vehicle_id, id, type, name, max_weight, max_weight_unit,\n    max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit\n  )\n  SELECT\n    :tenantId!, :vehicleId!, incoming.id, incoming.type,\n    NULLIF(incoming.name, ''),\n    incoming.max_weight, incoming.max_weight_unit, incoming.max_length,\n    incoming.max_width, incoming.max_height, incoming.dimension_unit,\n    incoming.max_volume, incoming.max_volume_unit\n  FROM incoming\n  ON CONFLICT (tenant_id, vehicle_id, id) DO UPDATE SET\n    type = EXCLUDED.type,\n    name = EXCLUDED.name,\n    max_weight = EXCLUDED.max_weight,\n    max_weight_unit = EXCLUDED.max_weight_unit,\n    max_length = EXCLUDED.max_length,\n    max_width = EXCLUDED.max_width,\n    max_height = EXCLUDED.max_height,\n    dimension_unit = EXCLUDED.dimension_unit,\n    max_volume = EXCLUDED.max_volume,\n    max_volume_unit = EXCLUDED.max_volume_unit\n  WHERE (\n    current.type, current.name, current.max_weight, current.max_weight_unit,\n    current.max_length, current.max_width, current.max_height,\n    current.dimension_unit, current.max_volume, current.max_volume_unit\n  ) IS DISTINCT FROM (\n    EXCLUDED.type, EXCLUDED.name, EXCLUDED.max_weight, EXCLUDED.max_weight_unit,\n    EXCLUDED.max_length, EXCLUDED.max_width, EXCLUDED.max_height,\n    EXCLUDED.dimension_unit, EXCLUDED.max_volume, EXCLUDED.max_volume_unit\n  )\n  RETURNING id\n),\ndeleted AS (\n  DELETE FROM operational_workspace.vehicle_compartments current\n  WHERE current.tenant_id = :tenantId!\n    AND current.vehicle_id = :vehicleId!\n    AND current.id <> ALL(:ids!::uuid[])\n  RETURNING id\n)\nSELECT\n  (SELECT count(*)::integer FROM upserted) AS \"upsertedCount!\",\n  (SELECT count(*)::integer FROM deleted) AS \"deletedCount!\""};

/**
 * Query generated from SQL:
 * ```
 * WITH incoming AS (
 *   SELECT *
 *   FROM unnest(
 *     :ids!::uuid[],
 *     :types!::text[],
 *     :names!::text[],
 *     :maxWeights!::double precision[],
 *     :maxWeightUnits!::text[],
 *     :maxLengths!::double precision[],
 *     :maxWidths!::double precision[],
 *     :maxHeights!::double precision[],
 *     :dimensionUnits!::text[],
 *     :maxVolumes!::double precision[],
 *     :maxVolumeUnits!::text[]
 *   ) AS values(id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit)
 * ),
 * upserted AS (
 *   INSERT INTO operational_workspace.vehicle_compartments AS current (
 *     tenant_id, vehicle_id, id, type, name, max_weight, max_weight_unit,
 *     max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit
 *   )
 *   SELECT
 *     :tenantId!, :vehicleId!, incoming.id, incoming.type,
 *     NULLIF(incoming.name, ''),
 *     incoming.max_weight, incoming.max_weight_unit, incoming.max_length,
 *     incoming.max_width, incoming.max_height, incoming.dimension_unit,
 *     incoming.max_volume, incoming.max_volume_unit
 *   FROM incoming
 *   ON CONFLICT (tenant_id, vehicle_id, id) DO UPDATE SET
 *     type = EXCLUDED.type,
 *     name = EXCLUDED.name,
 *     max_weight = EXCLUDED.max_weight,
 *     max_weight_unit = EXCLUDED.max_weight_unit,
 *     max_length = EXCLUDED.max_length,
 *     max_width = EXCLUDED.max_width,
 *     max_height = EXCLUDED.max_height,
 *     dimension_unit = EXCLUDED.dimension_unit,
 *     max_volume = EXCLUDED.max_volume,
 *     max_volume_unit = EXCLUDED.max_volume_unit
 *   WHERE (
 *     current.type, current.name, current.max_weight, current.max_weight_unit,
 *     current.max_length, current.max_width, current.max_height,
 *     current.dimension_unit, current.max_volume, current.max_volume_unit
 *   ) IS DISTINCT FROM (
 *     EXCLUDED.type, EXCLUDED.name, EXCLUDED.max_weight, EXCLUDED.max_weight_unit,
 *     EXCLUDED.max_length, EXCLUDED.max_width, EXCLUDED.max_height,
 *     EXCLUDED.dimension_unit, EXCLUDED.max_volume, EXCLUDED.max_volume_unit
 *   )
 *   RETURNING id
 * ),
 * deleted AS (
 *   DELETE FROM operational_workspace.vehicle_compartments current
 *   WHERE current.tenant_id = :tenantId!
 *     AND current.vehicle_id = :vehicleId!
 *     AND current.id <> ALL(:ids!::uuid[])
 *   RETURNING id
 * )
 * SELECT
 *   (SELECT count(*)::integer FROM upserted) AS "upsertedCount!",
 *   (SELECT count(*)::integer FROM deleted) AS "deletedCount!"
 * ```
 */
export const reconcileVehicleCompartments = new PreparedQuery<IReconcileVehicleCompartmentsParams,IReconcileVehicleCompartmentsResult>(reconcileVehicleCompartmentsIR);


