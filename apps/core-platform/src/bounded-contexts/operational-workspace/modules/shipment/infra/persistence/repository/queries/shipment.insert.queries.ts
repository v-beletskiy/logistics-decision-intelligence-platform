/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/shipment/infra/persistence/repository/queries/shipment.insert.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

export type DateOrString = Date | string;

/** 'InsertShipment' parameters type */
export interface IInsertShipmentParams {
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

/** 'InsertShipment' return type */
export type IInsertShipmentResult = void;

/** 'InsertShipment' query type */
export interface IInsertShipmentQuery {
  params: IInsertShipmentParams;
  result: IInsertShipmentResult;
}

const insertShipmentIR: any = {
  usedParamSet: {
    tenantId: true,
    id: true,
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
  },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 577, b: 586 }],
    },
    {
      name: "id",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 589, b: 592 }],
    },
    {
      name: "status",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 595, b: 602 }],
    },
    {
      name: "pickupCompleted",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 605, b: 621 }],
    },
    {
      name: "deliveryCompleted",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 624, b: 642 }],
    },
    {
      name: "pickupCountry",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 648, b: 662 }],
    },
    {
      name: "pickupStateOrRegion",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 665, b: 684 }],
    },
    {
      name: "pickupCity",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 687, b: 698 }],
    },
    {
      name: "pickupStreet",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 701, b: 714 }],
    },
    {
      name: "pickupBuildingNumber",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 717, b: 738 }],
    },
    {
      name: "pickupPostalCode",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 741, b: 758 }],
    },
    {
      name: "pickupLatitude",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 764, b: 779 }],
    },
    {
      name: "pickupLongitude",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 782, b: 798 }],
    },
    {
      name: "pickupStartAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 801, b: 815 }],
    },
    {
      name: "pickupEndAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 818, b: 830 }],
    },
    {
      name: "deliveryCountry",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 836, b: 852 }],
    },
    {
      name: "deliveryStateOrRegion",
      required: false,
      transform: { type: "scalar" },
      locs: [{ a: 855, b: 876 }],
    },
    {
      name: "deliveryCity",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 879, b: 892 }],
    },
    {
      name: "deliveryStreet",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 895, b: 910 }],
    },
    {
      name: "deliveryBuildingNumber",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 913, b: 936 }],
    },
    {
      name: "deliveryPostalCode",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 939, b: 958 }],
    },
    {
      name: "deliveryLatitude",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 964, b: 981 }],
    },
    {
      name: "deliveryLongitude",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 984, b: 1002 }],
    },
    {
      name: "deliveryStartAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1005, b: 1021 }],
    },
    {
      name: "deliveryEndAt",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1024, b: 1038 }],
    },
    {
      name: "weightValue",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1044, b: 1056 }],
    },
    {
      name: "weightUnit",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1059, b: 1070 }],
    },
    {
      name: "length",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1073, b: 1080 }],
    },
    {
      name: "width",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1083, b: 1089 }],
    },
    {
      name: "height",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1092, b: 1099 }],
    },
    {
      name: "dimensionUnit",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 1102, b: 1116 }],
    },
  ],
  statement:
    "INSERT INTO operational_workspace.shipments\n  (tenant_id, id, status, pickup_completed, delivery_completed,\n   pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,\n   pickup_latitude, pickup_longitude, pickup_start_at, pickup_end_at,\n   delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,\n   delivery_latitude, delivery_longitude, delivery_start_at, delivery_end_at,\n   weight_value, weight_unit, length, width, height, dimension_unit)\nVALUES\n  (:tenantId!, :id!, :status!, :pickupCompleted!, :deliveryCompleted!,\n   :pickupCountry!, :pickupStateOrRegion, :pickupCity!, :pickupStreet!, :pickupBuildingNumber!, :pickupPostalCode!,\n   :pickupLatitude!, :pickupLongitude!, :pickupStartAt!, :pickupEndAt!,\n   :deliveryCountry!, :deliveryStateOrRegion, :deliveryCity!, :deliveryStreet!, :deliveryBuildingNumber!, :deliveryPostalCode!,\n   :deliveryLatitude!, :deliveryLongitude!, :deliveryStartAt!, :deliveryEndAt!,\n   :weightValue!, :weightUnit!, :length!, :width!, :height!, :dimensionUnit!)",
};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.shipments
 *   (tenant_id, id, status, pickup_completed, delivery_completed,
 *    pickup_country, pickup_state_or_region, pickup_city, pickup_street, pickup_building_number, pickup_postal_code,
 *    pickup_latitude, pickup_longitude, pickup_start_at, pickup_end_at,
 *    delivery_country, delivery_state_or_region, delivery_city, delivery_street, delivery_building_number, delivery_postal_code,
 *    delivery_latitude, delivery_longitude, delivery_start_at, delivery_end_at,
 *    weight_value, weight_unit, length, width, height, dimension_unit)
 * VALUES
 *   (:tenantId!, :id!, :status!, :pickupCompleted!, :deliveryCompleted!,
 *    :pickupCountry!, :pickupStateOrRegion, :pickupCity!, :pickupStreet!, :pickupBuildingNumber!, :pickupPostalCode!,
 *    :pickupLatitude!, :pickupLongitude!, :pickupStartAt!, :pickupEndAt!,
 *    :deliveryCountry!, :deliveryStateOrRegion, :deliveryCity!, :deliveryStreet!, :deliveryBuildingNumber!, :deliveryPostalCode!,
 *    :deliveryLatitude!, :deliveryLongitude!, :deliveryStartAt!, :deliveryEndAt!,
 *    :weightValue!, :weightUnit!, :length!, :width!, :height!, :dimensionUnit!)
 * ```
 */
export const insertShipment = new PreparedQuery<
  IInsertShipmentParams,
  IInsertShipmentResult
>(insertShipmentIR);
