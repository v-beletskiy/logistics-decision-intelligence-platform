/** Types generated for queries found in "src/operational-workspace/domain-modules/shipment/infra/persistence/queries/shipment.insert.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'InsertShipment' parameters type */
export interface IInsertShipmentParams {
  deliveryBuildingNumber: string;
  deliveryCity: string;
  deliveryCompleted: boolean;
  deliveryCountry: string;
  deliveryEndAt: DateOrString;
  deliveryPostalCode: string;
  deliveryStartAt: DateOrString;
  deliveryStateOrRegion?: string | null | void;
  deliveryStreet: string;
  dimensionUnit: string;
  height: number;
  id: string;
  length: number;
  pickupBuildingNumber: string;
  pickupCity: string;
  pickupCompleted: boolean;
  pickupCountry: string;
  pickupEndAt: DateOrString;
  pickupPostalCode: string;
  pickupStartAt: DateOrString;
  pickupStateOrRegion?: string | null | void;
  pickupStreet: string;
  status: string;
  weightUnit: string;
  weightValue: number;
  width: number;
}

/** 'InsertShipment' return type */
export type IInsertShipmentResult = void;

/** 'InsertShipment' query type */
export interface IInsertShipmentQuery {
  params: IInsertShipmentParams;
  result: IInsertShipmentResult;
}

const insertShipmentIR: any = {"usedParamSet":{"id":true,"status":true,"pickupCompleted":true,"deliveryCompleted":true,"pickupCountry":true,"pickupStateOrRegion":true,"pickupCity":true,"pickupStreet":true,"pickupBuildingNumber":true,"pickupPostalCode":true,"pickupStartAt":true,"pickupEndAt":true,"deliveryCountry":true,"deliveryStateOrRegion":true,"deliveryCity":true,"deliveryStreet":true,"deliveryBuildingNumber":true,"deliveryPostalCode":true,"deliveryStartAt":true,"deliveryEndAt":true,"weightValue":true,"weightUnit":true,"length":true,"width":true,"height":true,"dimensionUnit":true},"params":[{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":492,"b":495}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":498,"b":505}]},{"name":"pickupCompleted","required":true,"transform":{"type":"scalar"},"locs":[{"a":508,"b":524}]},{"name":"deliveryCompleted","required":true,"transform":{"type":"scalar"},"locs":[{"a":527,"b":545}]},{"name":"pickupCountry","required":true,"transform":{"type":"scalar"},"locs":[{"a":551,"b":565}]},{"name":"pickupStateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":568,"b":587}]},{"name":"pickupCity","required":true,"transform":{"type":"scalar"},"locs":[{"a":590,"b":601}]},{"name":"pickupStreet","required":true,"transform":{"type":"scalar"},"locs":[{"a":604,"b":617}]},{"name":"pickupBuildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":620,"b":641}]},{"name":"pickupPostalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":644,"b":661}]},{"name":"pickupStartAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":667,"b":681}]},{"name":"pickupEndAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":684,"b":696}]},{"name":"deliveryCountry","required":true,"transform":{"type":"scalar"},"locs":[{"a":702,"b":718}]},{"name":"deliveryStateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":721,"b":742}]},{"name":"deliveryCity","required":true,"transform":{"type":"scalar"},"locs":[{"a":745,"b":758}]},{"name":"deliveryStreet","required":true,"transform":{"type":"scalar"},"locs":[{"a":761,"b":776}]},{"name":"deliveryBuildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":779,"b":802}]},{"name":"deliveryPostalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":805,"b":824}]},{"name":"deliveryStartAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":830,"b":846}]},{"name":"deliveryEndAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":849,"b":863}]},{"name":"weightValue","required":true,"transform":{"type":"scalar"},"locs":[{"a":869,"b":881}]},{"name":"weightUnit","required":true,"transform":{"type":"scalar"},"locs":[{"a":884,"b":895}]},{"name":"length","required":true,"transform":{"type":"scalar"},"locs":[{"a":898,"b":905}]},{"name":"width","required":true,"transform":{"type":"scalar"},"locs":[{"a":908,"b":914}]},{"name":"height","required":true,"transform":{"type":"scalar"},"locs":[{"a":917,"b":924}]},{"name":"dimensionUnit","required":true,"transform":{"type":"scalar"},"locs":[{"a":927,"b":941}]}],"statement":"INSERT INTO operational_workspace.shipments\n  (id, status, pickup_completed, delivery_completed,\n   pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,\n   pickup_start_at, pickup_end_at,\n   delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,\n   delivery_start_at, delivery_end_at,\n   weight_value, weight_unit, length, width, height, dimension_unit)\nVALUES\n  (:id!, :status!, :pickupCompleted!, :deliveryCompleted!,\n   :pickupCountry!, :pickupStateOrRegion, :pickupCity!, :pickupStreet!, :pickupBuildingNumber!, :pickupPostalCode!,\n   :pickupStartAt!, :pickupEndAt!,\n   :deliveryCountry!, :deliveryStateOrRegion, :deliveryCity!, :deliveryStreet!, :deliveryBuildingNumber!, :deliveryPostalCode!,\n   :deliveryStartAt!, :deliveryEndAt!,\n   :weightValue!, :weightUnit!, :length!, :width!, :height!, :dimensionUnit!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.shipments
 *   (id, status, pickup_completed, delivery_completed,
 *    pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,
 *    pickup_start_at, pickup_end_at,
 *    delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,
 *    delivery_start_at, delivery_end_at,
 *    weight_value, weight_unit, length, width, height, dimension_unit)
 * VALUES
 *   (:id!, :status!, :pickupCompleted!, :deliveryCompleted!,
 *    :pickupCountry!, :pickupStateOrRegion, :pickupCity!, :pickupStreet!, :pickupBuildingNumber!, :pickupPostalCode!,
 *    :pickupStartAt!, :pickupEndAt!,
 *    :deliveryCountry!, :deliveryStateOrRegion, :deliveryCity!, :deliveryStreet!, :deliveryBuildingNumber!, :deliveryPostalCode!,
 *    :deliveryStartAt!, :deliveryEndAt!,
 *    :weightValue!, :weightUnit!, :length!, :width!, :height!, :dimensionUnit!)
 * ```
 */
export const insertShipment = new PreparedQuery<IInsertShipmentParams,IInsertShipmentResult>(insertShipmentIR);


