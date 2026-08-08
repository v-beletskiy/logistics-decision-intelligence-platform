/** Types generated for queries found in "src/operational-workspace/domain-modules/shipment/infra/persistence/queries/shipment.find-by-ids.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindShipmentsByIds' parameters type */
export interface IFindShipmentsByIdsParams {
  ids: readonly (string | null | void)[];
}

/** 'FindShipmentsByIds' return type */
export interface IFindShipmentsByIdsResult {
  delivery_building_number: string;
  delivery_city: string;
  delivery_completed: boolean;
  delivery_country: string;
  delivery_end_at: Date;
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

const findShipmentsByIdsIR: any = {"usedParamSet":{"ids":true},"params":[{"name":"ids","required":false,"transform":{"type":"array_spread"},"locs":[{"a":510,"b":513}]}],"statement":"SELECT id, status, pickup_completed, delivery_completed,\n       pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,\n       pickup_start_at, pickup_end_at,\n       delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,\n       delivery_start_at, delivery_end_at,\n       weight_value, weight_unit, length, width, height, dimension_unit\nFROM operational_workspace.shipments\nWHERE id IN :ids"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, status, pickup_completed, delivery_completed,
 *        pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,
 *        pickup_start_at, pickup_end_at,
 *        delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,
 *        delivery_start_at, delivery_end_at,
 *        weight_value, weight_unit, length, width, height, dimension_unit
 * FROM operational_workspace.shipments
 * WHERE id IN :ids
 * ```
 */
export const findShipmentsByIds = new PreparedQuery<IFindShipmentsByIdsParams,IFindShipmentsByIdsResult>(findShipmentsByIdsIR);


