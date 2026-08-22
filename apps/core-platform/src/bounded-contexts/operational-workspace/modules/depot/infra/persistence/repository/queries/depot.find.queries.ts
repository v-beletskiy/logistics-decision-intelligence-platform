/** Types generated for queries found in "src/bounded-contexts/operational-workspace/modules/depot/infra/persistence/repository/queries/depot.find.sql" */
import { PreparedQuery } from "@pgtyped/runtime";

/** 'FindDepots' parameters type */
export interface IFindDepotsParams {
  tenantId: string;
}

/** 'FindDepots' return type */
export interface IFindDepotsResult {
  building_number: string;
  city: string;
  country: string;
  driver_capacity: number;
  driver_count: number;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  postal_code: string;
  state_or_region: string | null;
  status: string;
  street: string;
  vehicle_capacity: number;
  vehicle_count: number;
}

/** 'FindDepots' query type */
export interface IFindDepotsQuery {
  params: IFindDepotsParams;
  result: IFindDepotsResult;
}

const findDepotsIR: any = {
  usedParamSet: { tenantId: true },
  params: [
    {
      name: "tenantId",
      required: true,
      transform: { type: "scalar" },
      locs: [{ a: 231, b: 240 }],
    },
  ],
  statement:
    "SELECT id, name, country, state_or_region, city, street, building_number, postal_code, latitude, longitude, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count\nFROM operational_workspace.depots\nWHERE tenant_id = :tenantId!\nORDER BY name",
};

/**
 * Query generated from SQL:
 * ```
 * SELECT id, name, country, state_or_region, city, street, building_number, postal_code, latitude, longitude, status, vehicle_capacity, driver_capacity, vehicle_count, driver_count
 * FROM operational_workspace.depots
 * WHERE tenant_id = :tenantId!
 * ORDER BY name
 * ```
 */
export const findDepots = new PreparedQuery<
  IFindDepotsParams,
  IFindDepotsResult
>(findDepotsIR);
