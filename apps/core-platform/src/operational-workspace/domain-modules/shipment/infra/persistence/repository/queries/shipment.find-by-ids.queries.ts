/** Types generated for queries found in "src/operational-workspace/domain-modules/shipment/infra/persistence/repository/queries/shipment.find-by-ids.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindShipmentsByIds' parameters type */
export interface IFindShipmentsByIdsParams {
  ids: readonly (string | null | void)[];
  tenantId: string;
}

/** 'FindShipmentsByIds' return type */
export interface IFindShipmentsByIdsResult {
  delivery_building_number: string;
  delivery_city: string;
  delivery_completed: boolean;
  delivery_country: string;
  delivery_end_at: Date;
  delivery_latitude: number;
  delivery_longitude: number;
  delivery_postal_code: string;
  delivery_start_at: Date;
  delivery_state_or_region: string | null;
  delivery_street: string;
  dimension_unit: string;
  height: number;
  id: string;
  length: number;
  pickup_building_number: string;
  pickup_city: string;
  pickup_completed: boolean;
  pickup_country: string;
  pickup_end_at: Date;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_postal_code: string;
  pickup_start_at: Date;
  pickup_state_or_region: string | null;
  pickup_street: string;
  status: string;
  weight_unit: string;
  weight_value: number;
  width: number;
}

/** 'FindShipmentsByIds' query type */
export interface IFindShipmentsByIdsQuery {
  params: IFindShipmentsByIdsParams;
  result: IFindShipmentsByIdsResult;
}

const findShipmentsByIdsIR: any = {"usedParamSet":{"tenantId":true,"ids":true},"params":[{"name":"ids","required":false,"transform":{"type":"array_spread"},"locs":[{"a":613,"b":616}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":590,"b":599}]}],"statement":"SELECT id, status, pickup_completed, delivery_completed,\n       pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,\n       pickup_latitude, pickup_longitude, pickup_start_at, pickup_end_at,\n       delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,\n       delivery_latitude, delivery_longitude, delivery_start_at, delivery_end_at,\n       weight_value, weight_unit, length, width, height, dimension_unit\nFROM operational_workspace.shipments\nWHERE tenant_id = :tenantId!\n  AND id IN :ids"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, status, pickup_completed, delivery_completed,
 *        pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,
 *        pickup_latitude, pickup_longitude, pickup_start_at, pickup_end_at,
 *        delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,
 *        delivery_latitude, delivery_longitude, delivery_start_at, delivery_end_at,
 *        weight_value, weight_unit, length, width, height, dimension_unit
 * FROM operational_workspace.shipments
 * WHERE tenant_id = :tenantId!
 *   AND id IN :ids
 * ```
 */
export const findShipmentsByIds = new PreparedQuery<IFindShipmentsByIdsParams,IFindShipmentsByIdsResult>(findShipmentsByIdsIR);


