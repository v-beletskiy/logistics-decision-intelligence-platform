/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/shipment/infra/persistence/repository/queries/shipment.update.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type DateOrString = Date | string;

export type NumberOrString = number | string;

/** 'UpdateShipment' parameters type */
export interface IUpdateShipmentParams {
  deliveryBuildingNumber: string;
  deliveryCity: string;
  deliveryCompleted: boolean;
  deliveryCountry: string;
  deliveryEndAt: DateOrString;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryPostalCode: string;
  deliveryStartAt: DateOrString;
  deliveryStateOrRegion?: string | null | void;
  deliveryStreet: string;
  dimensionUnit: string;
  expectedRevision: NumberOrString;
  height: number;
  id: string;
  length: number;
  pickupBuildingNumber: string;
  pickupCity: string;
  pickupCompleted: boolean;
  pickupCountry: string;
  pickupEndAt: DateOrString;
  pickupLatitude: number;
  pickupLongitude: number;
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
export interface IUpdateShipmentResult {
  revision: string;
}

/** 'UpdateShipment' query type */
export interface IUpdateShipmentQuery {
  params: IUpdateShipmentParams;
  result: IUpdateShipmentResult;
}

const updateShipmentIR: any = {
  usedParamSet: {
    status: true,
    pickupCompleted: true,
    deliveryCompleted: true,
    pickupCountry: true,
    pickupStateOrRegion: true,
    pickupCity: true,
    pickupStreet: true,
    pickupBuildingNumber: true,
    pickupPostalCode: true,
    pickupLatitude: true,
    pickupLongitude: true,
    pickupStartAt: true,
    pickupEndAt: true,
    deliveryCountry: true,
    deliveryStateOrRegion: true,
    deliveryCity: true,
    deliveryStreet: true,
    deliveryBuildingNumber: true,
    deliveryPostalCode: true,
    deliveryLatitude: true,
    deliveryLongitude: true,
    deliveryStartAt: true,
    deliveryEndAt: true,
    weightValue: true,
    weightUnit: true,
    length: true,
    width: true,
    height: true,
    dimensionUnit: true,
    tenantId: true,
    id: true,
    expectedRevision: true,
  },
  params: [
    {
      name: "status",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 52, b: 59 }],
    },
    {
      name: "pickupCompleted",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 85, b: 101 }],
    },
    {
      name: "deliveryCompleted",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 129, b: 147 }],
    },
    {
      name: "pickupCountry",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 171, b: 185 }],
    },
    {
      name: "pickupStateOrRegion",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 217, b: 236 }],
    },
    {
      name: "pickupCity",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 257, b: 268 }],
    },
    {
      name: "pickupStreet",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 291, b: 304 }],
    },
    {
      name: "pickupBuildingNumber",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 336, b: 357 }],
    },
    {
      name: "pickupPostalCode",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 385, b: 402 }],
    },
    {
      name: "pickupLatitude",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 427, b: 442 }],
    },
    {
      name: "pickupLongitude",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 468, b: 484 }],
    },
    {
      name: "pickupStartAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 509, b: 523 }],
    },
    {
      name: "pickupEndAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 546, b: 558 }],
    },
    {
      name: "deliveryCountry",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 584, b: 600 }],
    },
    {
      name: "deliveryStateOrRegion",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 634, b: 655 }],
    },
    {
      name: "deliveryCity",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 678, b: 691 }],
    },
    {
      name: "deliveryStreet",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 716, b: 731 }],
    },
    {
      name: "deliveryBuildingNumber",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 765, b: 788 }],
    },
    {
      name: "deliveryPostalCode",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 818, b: 837 }],
    },
    {
      name: "deliveryLatitude",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 864, b: 881 }],
    },
    {
      name: "deliveryLongitude",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 909, b: 927 }],
    },
    {
      name: "deliveryStartAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 954, b: 970 }],
    },
    {
      name: "deliveryEndAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 995, b: 1009 }],
    },
    {
      name: "weightValue",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1031, b: 1043 }],
    },
    {
      name: "weightUnit",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1064, b: 1075 }],
    },
    {
      name: "length",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1091, b: 1098 }],
    },
    {
      name: "width",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1113, b: 1119 }],
    },
    {
      name: "height",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1135, b: 1142 }],
    },
    {
      name: "dimensionUnit",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1166, b: 1180 }],
    },
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1253, b: 1262 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1275, b: 1278 }],
    },
    {
      name: "expectedRevision",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1297, b: 1314 }],
    },
  ],
  statement:
    "UPDATE operational_workspace.shipments\nSET status = :status!,\n    pickup_completed = :pickupCompleted!,\n    delivery_completed = :deliveryCompleted!,\n    pickup_country = :pickupCountry!,\n    pickup_state_or_region = :pickupStateOrRegion,\n    pickup_city = :pickupCity!,\n    pickup_street = :pickupStreet!,\n    pickup_building_number = :pickupBuildingNumber!,\n    pickup_postal_code = :pickupPostalCode!,\n    pickup_latitude = :pickupLatitude!,\n    pickup_longitude = :pickupLongitude!,\n    pickup_start_at = :pickupStartAt!,\n    pickup_end_at = :pickupEndAt!,\n    delivery_country = :deliveryCountry!,\n    delivery_state_or_region = :deliveryStateOrRegion,\n    delivery_city = :deliveryCity!,\n    delivery_street = :deliveryStreet!,\n    delivery_building_number = :deliveryBuildingNumber!,\n    delivery_postal_code = :deliveryPostalCode!,\n    delivery_latitude = :deliveryLatitude!,\n    delivery_longitude = :deliveryLongitude!,\n    delivery_start_at = :deliveryStartAt!,\n    delivery_end_at = :deliveryEndAt!,\n    weight_value = :weightValue!,\n    weight_unit = :weightUnit!,\n    length = :length!,\n    width = :width!,\n    height = :height!,\n    dimension_unit = :dimensionUnit!,\n    revision = revision + 1,\n    updated_at = now()\nWHERE tenant_id = :tenantId!\n  AND id = :id!\n  AND revision = :expectedRevision!\nRETURNING revision",
};

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
 *     pickup_latitude = :pickupLatitude!,
 *     pickup_longitude = :pickupLongitude!,
 *     pickup_start_at = :pickupStartAt!,
 *     pickup_end_at = :pickupEndAt!,
 *     delivery_country = :deliveryCountry!,
 *     delivery_state_or_region = :deliveryStateOrRegion,
 *     delivery_city = :deliveryCity!,
 *     delivery_street = :deliveryStreet!,
 *     delivery_building_number = :deliveryBuildingNumber!,
 *     delivery_postal_code = :deliveryPostalCode!,
 *     delivery_latitude = :deliveryLatitude!,
 *     delivery_longitude = :deliveryLongitude!,
 *     delivery_start_at = :deliveryStartAt!,
 *     delivery_end_at = :deliveryEndAt!,
 *     weight_value = :weightValue!,
 *     weight_unit = :weightUnit!,
 *     length = :length!,
 *     width = :width!,
 *     height = :height!,
 *     dimension_unit = :dimensionUnit!,
 *     revision = revision + 1,
 *     updated_at = now()
 * WHERE tenant_id = :tenantId!
 *   AND id = :id!
 *   AND revision = :expectedRevision!
 * RETURNING revision
 * ```
 */
export const updateShipment = new PreparedQuery<
  IUpdateShipmentParams,
  IUpdateShipmentResult
>(updateShipmentIR);
