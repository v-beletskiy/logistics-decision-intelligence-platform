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
  tenantId: string;
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

const insertShipmentIR: any = {"usedParamSet":{"tenantId":true,"id":true,"status":true,"pickupCompleted":true,"deliveryCompleted":true,"pickupCountry":true,"pickupStateOrRegion":true,"pickupCity":true,"pickupStreet":true,"pickupBuildingNumber":true,"pickupPostalCode":true,"pickupStartAt":true,"pickupEndAt":true,"deliveryCountry":true,"deliveryStateOrRegion":true,"deliveryCity":true,"deliveryStreet":true,"deliveryBuildingNumber":true,"deliveryPostalCode":true,"deliveryStartAt":true,"deliveryEndAt":true,"weightValue":true,"weightUnit":true,"length":true,"width":true,"height":true,"dimensionUnit":true},"params":[{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":503,"b":512}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":515,"b":518}]},{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":521,"b":528}]},{"name":"pickupCompleted","required":true,"transform":{"type":"scalar"},"locs":[{"a":531,"b":547}]},{"name":"deliveryCompleted","required":true,"transform":{"type":"scalar"},"locs":[{"a":550,"b":568}]},{"name":"pickupCountry","required":true,"transform":{"type":"scalar"},"locs":[{"a":574,"b":588}]},{"name":"pickupStateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":591,"b":610}]},{"name":"pickupCity","required":true,"transform":{"type":"scalar"},"locs":[{"a":613,"b":624}]},{"name":"pickupStreet","required":true,"transform":{"type":"scalar"},"locs":[{"a":627,"b":640}]},{"name":"pickupBuildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":643,"b":664}]},{"name":"pickupPostalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":667,"b":684}]},{"name":"pickupStartAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":690,"b":704}]},{"name":"pickupEndAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":707,"b":719}]},{"name":"deliveryCountry","required":true,"transform":{"type":"scalar"},"locs":[{"a":725,"b":741}]},{"name":"deliveryStateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":744,"b":765}]},{"name":"deliveryCity","required":true,"transform":{"type":"scalar"},"locs":[{"a":768,"b":781}]},{"name":"deliveryStreet","required":true,"transform":{"type":"scalar"},"locs":[{"a":784,"b":799}]},{"name":"deliveryBuildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":802,"b":825}]},{"name":"deliveryPostalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":828,"b":847}]},{"name":"deliveryStartAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":853,"b":869}]},{"name":"deliveryEndAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":872,"b":886}]},{"name":"weightValue","required":true,"transform":{"type":"scalar"},"locs":[{"a":892,"b":904}]},{"name":"weightUnit","required":true,"transform":{"type":"scalar"},"locs":[{"a":907,"b":918}]},{"name":"length","required":true,"transform":{"type":"scalar"},"locs":[{"a":921,"b":928}]},{"name":"width","required":true,"transform":{"type":"scalar"},"locs":[{"a":931,"b":937}]},{"name":"height","required":true,"transform":{"type":"scalar"},"locs":[{"a":940,"b":947}]},{"name":"dimensionUnit","required":true,"transform":{"type":"scalar"},"locs":[{"a":950,"b":964}]}],"statement":"INSERT INTO operational_workspace.shipments\n  (tenant_id, id, status, pickup_completed, delivery_completed,\n   pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,\n   pickup_start_at, pickup_end_at,\n   delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,\n   delivery_start_at, delivery_end_at,\n   weight_value, weight_unit, length, width, height, dimension_unit)\nVALUES\n  (:tenantId!, :id!, :status!, :pickupCompleted!, :deliveryCompleted!,\n   :pickupCountry!, :pickupStateOrRegion, :pickupCity!, :pickupStreet!, :pickupBuildingNumber!, :pickupPostalCode!,\n   :pickupStartAt!, :pickupEndAt!,\n   :deliveryCountry!, :deliveryStateOrRegion, :deliveryCity!, :deliveryStreet!, :deliveryBuildingNumber!, :deliveryPostalCode!,\n   :deliveryStartAt!, :deliveryEndAt!,\n   :weightValue!, :weightUnit!, :length!, :width!, :height!, :dimensionUnit!)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.shipments
 *   (tenant_id, id, status, pickup_completed, delivery_completed,
 *    pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,
 *    pickup_start_at, pickup_end_at,
 *    delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,
 *    delivery_start_at, delivery_end_at,
 *    weight_value, weight_unit, length, width, height, dimension_unit)
 * VALUES
 *   (:tenantId!, :id!, :status!, :pickupCompleted!, :deliveryCompleted!,
 *    :pickupCountry!, :pickupStateOrRegion, :pickupCity!, :pickupStreet!, :pickupBuildingNumber!, :pickupPostalCode!,
 *    :pickupStartAt!, :pickupEndAt!,
 *    :deliveryCountry!, :deliveryStateOrRegion, :deliveryCity!, :deliveryStreet!, :deliveryBuildingNumber!, :deliveryPostalCode!,
 *    :deliveryStartAt!, :deliveryEndAt!,
 *    :weightValue!, :weightUnit!, :length!, :width!, :height!, :dimensionUnit!)
 * ```
 */
export const insertShipment = new PreparedQuery<IInsertShipmentParams,IInsertShipmentResult>(insertShipmentIR);


