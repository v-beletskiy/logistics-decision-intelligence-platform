/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.find-by-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'FindVehicleById' parameters type */
export interface IFindVehicleByIdParams {
  id: string;
  tenantId: string;
}

/** 'FindVehicleById' return type */
export interface IFindVehicleByIdResult {
  compartments: Json | null;
  depot_id: string | null;
  id: string;
  name: string | null;
  registration_number: string;
  status: string;
}

/** 'FindVehicleById' query type */
export interface IFindVehicleByIdQuery {
  params: IFindVehicleByIdParams;
  result: IFindVehicleByIdResult;
}

const findVehicleByIdIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":782,"b":791}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":806,"b":809}]}],"statement":"SELECT\n  v.id,\n  v.registration_number,\n  v.name,\n  v.depot_id,\n  v.status,\n  COALESCE(\n    jsonb_agg(\n      jsonb_build_object(\n        'id', c.id,\n        'type', c.type,\n        'name', c.name,\n        'max_weight', c.max_weight,\n        'max_weight_unit', c.max_weight_unit,\n        'max_length', c.max_length,\n        'max_width', c.max_width,\n        'max_height', c.max_height,\n        'dimension_unit', c.dimension_unit,\n        'max_volume', c.max_volume,\n        'max_volume_unit', c.max_volume_unit\n      )\n      ORDER BY c.id\n    ) FILTER (WHERE c.id IS NOT NULL),\n    '[]'::jsonb\n  ) AS compartments\nFROM operational_workspace.vehicles v\nLEFT JOIN operational_workspace.vehicle_compartments c\n  ON c.tenant_id = v.tenant_id\n AND c.vehicle_id = v.id\nWHERE v.tenant_id = :tenantId!\n  AND v.id = :id!\nGROUP BY v.id"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   v.id,
 *   v.registration_number,
 *   v.name,
 *   v.depot_id,
 *   v.status,
 *   COALESCE(
 *     jsonb_agg(
 *       jsonb_build_object(
 *         'id', c.id,
 *         'type', c.type,
 *         'name', c.name,
 *         'max_weight', c.max_weight,
 *         'max_weight_unit', c.max_weight_unit,
 *         'max_length', c.max_length,
 *         'max_width', c.max_width,
 *         'max_height', c.max_height,
 *         'dimension_unit', c.dimension_unit,
 *         'max_volume', c.max_volume,
 *         'max_volume_unit', c.max_volume_unit
 *       )
 *       ORDER BY c.id
 *     ) FILTER (WHERE c.id IS NOT NULL),
 *     '[]'::jsonb
 *   ) AS compartments
 * FROM operational_workspace.vehicles v
 * LEFT JOIN operational_workspace.vehicle_compartments c
 *   ON c.tenant_id = v.tenant_id
 *  AND c.vehicle_id = v.id
 * WHERE v.tenant_id = :tenantId!
 *   AND v.id = :id!
 * GROUP BY v.id
 * ```
 */
export const findVehicleById = new PreparedQuery<IFindVehicleByIdParams,IFindVehicleByIdResult>(findVehicleByIdIR);


