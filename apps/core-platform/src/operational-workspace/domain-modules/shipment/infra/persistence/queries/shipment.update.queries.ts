/** Types generated for queries found in "src/operational-workspace/domain-modules/shipment/infra/persistence/queries/shipment.update.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

export type DateOrString = Date | string;

/** 'UpdateShipment' parameters type */
export interface IUpdateShipmentParams {
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

/** 'UpdateShipment' return type */
export type IUpdateShipmentResult = void;

/** 'UpdateShipment' query type */
export interface IUpdateShipmentQuery {
  params: IUpdateShipmentParams;
  result: IUpdateShipmentResult;
}

const updateShipmentIR: any = {"usedParamSet":{"status":true,"pickupCompleted":true,"deliveryCompleted":true,"pickupCountry":true,"pickupStateOrRegion":true,"pickupCity":true,"pickupStreet":true,"pickupBuildingNumber":true,"pickupPostalCode":true,"pickupStartAt":true,"pickupEndAt":true,"deliveryCountry":true,"deliveryStateOrRegion":true,"deliveryCity":true,"deliveryStreet":true,"deliveryBuildingNumber":true,"deliveryPostalCode":true,"deliveryStartAt":true,"deliveryEndAt":true,"weightValue":true,"weightUnit":true,"length":true,"width":true,"height":true,"dimensionUnit":true,"tenantId":true,"id":true},"params":[{"name":"status","required":true,"transform":{"type":"scalar"},"locs":[{"a":52,"b":59}]},{"name":"pickupCompleted","required":true,"transform":{"type":"scalar"},"locs":[{"a":85,"b":101}]},{"name":"deliveryCompleted","required":true,"transform":{"type":"scalar"},"locs":[{"a":129,"b":147}]},{"name":"pickupCountry","required":true,"transform":{"type":"scalar"},"locs":[{"a":171,"b":185}]},{"name":"pickupStateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":217,"b":236}]},{"name":"pickupCity","required":true,"transform":{"type":"scalar"},"locs":[{"a":257,"b":268}]},{"name":"pickupStreet","required":true,"transform":{"type":"scalar"},"locs":[{"a":291,"b":304}]},{"name":"pickupBuildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":336,"b":357}]},{"name":"pickupPostalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":385,"b":402}]},{"name":"pickupStartAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":427,"b":441}]},{"name":"pickupEndAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":464,"b":476}]},{"name":"deliveryCountry","required":true,"transform":{"type":"scalar"},"locs":[{"a":502,"b":518}]},{"name":"deliveryStateOrRegion","required":false,"transform":{"type":"scalar"},"locs":[{"a":552,"b":573}]},{"name":"deliveryCity","required":true,"transform":{"type":"scalar"},"locs":[{"a":596,"b":609}]},{"name":"deliveryStreet","required":true,"transform":{"type":"scalar"},"locs":[{"a":634,"b":649}]},{"name":"deliveryBuildingNumber","required":true,"transform":{"type":"scalar"},"locs":[{"a":683,"b":706}]},{"name":"deliveryPostalCode","required":true,"transform":{"type":"scalar"},"locs":[{"a":736,"b":755}]},{"name":"deliveryStartAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":782,"b":798}]},{"name":"deliveryEndAt","required":true,"transform":{"type":"scalar"},"locs":[{"a":823,"b":837}]},{"name":"weightValue","required":true,"transform":{"type":"scalar"},"locs":[{"a":859,"b":871}]},{"name":"weightUnit","required":true,"transform":{"type":"scalar"},"locs":[{"a":892,"b":903}]},{"name":"length","required":true,"transform":{"type":"scalar"},"locs":[{"a":919,"b":926}]},{"name":"width","required":true,"transform":{"type":"scalar"},"locs":[{"a":941,"b":947}]},{"name":"height","required":true,"transform":{"type":"scalar"},"locs":[{"a":963,"b":970}]},{"name":"dimensionUnit","required":true,"transform":{"type":"scalar"},"locs":[{"a":994,"b":1008}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":1052,"b":1061}]},{"name":"id","required":true,"transform":{"type":"scalar"},"locs":[{"a":1074,"b":1077}]}],"statement":"UPDATE operational_workspace.shipments\nSET status = :status!,\n    pickup_completed = :pickupCompleted!,\n    delivery_completed = :deliveryCompleted!,\n    pickup_country = :pickupCountry!,\n    pickup_state_or_region = :pickupStateOrRegion,\n    pickup_city = :pickupCity!,\n    pickup_street = :pickupStreet!,\n    pickup_building_number = :pickupBuildingNumber!,\n    pickup_postal_code = :pickupPostalCode!,\n    pickup_start_at = :pickupStartAt!,\n    pickup_end_at = :pickupEndAt!,\n    delivery_country = :deliveryCountry!,\n    delivery_state_or_region = :deliveryStateOrRegion,\n    delivery_city = :deliveryCity!,\n    delivery_street = :deliveryStreet!,\n    delivery_building_number = :deliveryBuildingNumber!,\n    delivery_postal_code = :deliveryPostalCode!,\n    delivery_start_at = :deliveryStartAt!,\n    delivery_end_at = :deliveryEndAt!,\n    weight_value = :weightValue!,\n    weight_unit = :weightUnit!,\n    length = :length!,\n    width = :width!,\n    height = :height!,\n    dimension_unit = :dimensionUnit!,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE operational_workspace.shipments
 * SET status = :status!,
 *     pickup_completed = :pickupCompleted!,
 *     delivery_completed = :deliveryCompleted!,
 *     pickup_country = :pickupCountry!,
 *     pickup_state_or_region = :pickupStateOrRegion,
 *     pickup_city = :pickupCity!,
 *     pickup_street = :pickupStreet!,
 *     pickup_building_number = :pickupBuildingNumber!,
 *     pickup_postal_code = :pickupPostalCode!,
 *     pickup_start_at = :pickupStartAt!,
 *     pickup_end_at = :pickupEndAt!,
 *     delivery_country = :deliveryCountry!,
 *     delivery_state_or_region = :deliveryStateOrRegion,
 *     delivery_city = :deliveryCity!,
 *     delivery_street = :deliveryStreet!,
 *     delivery_building_number = :deliveryBuildingNumber!,
 *     delivery_postal_code = :deliveryPostalCode!,
 *     delivery_start_at = :deliveryStartAt!,
 *     delivery_end_at = :deliveryEndAt!,
 *     weight_value = :weightValue!,
 *     weight_unit = :weightUnit!,
 *     length = :length!,
 *     width = :width!,
 *     height = :height!,
 *     dimension_unit = :dimensionUnit!,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 * ```
 */
export const updateShipment = new PreparedQuery<IUpdateShipmentParams,IUpdateShipmentResult>(updateShipmentIR);


