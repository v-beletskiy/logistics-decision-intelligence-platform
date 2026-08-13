/** Types generated for queries found in "src/operational-workspace/domain-modules/shipment/infra/persistence/repository/queries/shipment.find-by-id.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindShipmentById' parameters type */
export interface IFindShipmentByIdParams {
  id: string;
  tenantId: string;
}

/** 'FindShipmentById' return type */
export interface IFindShipmentByIdResult {
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
  revision: string;
  status: string;
  weight_unit: string;
  weight_value: number;
  width: number;
}

/** 'FindShipmentById' query type */
export interface IFindShipmentByIdQuery {
  params: IFindShipmentByIdParams;
  result: IFindShipmentByIdResult;
}

const findShipmentByIdIR: any = {"usedParamSet":{"tenantId":true,"id":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":526,"b":535}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":548,"b":551}]}],"statement":"SELECT id, status, pickup_completed, delivery_completed, revision,\n       pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,\n       pickup_start_at, pickup_end_at,\n       delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,\n       delivery_start_at, delivery_end_at,\n       weight_value, weight_unit, length, width, height, dimension_unit\nFROM operational_workspace.shipments\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, status, pickup_completed, delivery_completed, revision,
 *        pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,
 *        pickup_start_at, pickup_end_at,
 *        delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,
 *        delivery_start_at, delivery_end_at,
 *        weight_value, weight_unit, length, width, height, dimension_unit
 * FROM operational_workspace.shipments
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const findShipmentById = new PreparedQuery<IFindShipmentByIdParams,IFindShipmentByIdResult>(findShipmentByIdIR);


