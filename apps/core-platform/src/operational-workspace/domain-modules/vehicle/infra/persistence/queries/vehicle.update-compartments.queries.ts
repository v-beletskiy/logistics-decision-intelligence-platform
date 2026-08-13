/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.update-compartments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpdateVehicleCompartments' parameters type */
export interface IUpdateVehicleCompartmentsParams {
  ownerId: string;
  rows: readonly ({
    id: string | null | void,
    type: string | null | void,
    name: string | null | void,
    maxWeight: string | null | void,
    maxWeightUnit: string | null | void,
    maxLength: string | null | void,
    maxWidth: string | null | void,
    maxHeight: string | null | void,
    dimensionUnit: string | null | void,
    maxVolume: string | null | void,
    maxVolumeUnit: string | null | void
  })[];
  tenantId: string;
}

/** 'UpdateVehicleCompartments' return type */
export type IUpdateVehicleCompartmentsResult = void;

/** 'UpdateVehicleCompartments' query type */
export interface IUpdateVehicleCompartmentsQuery {
  params: IUpdateVehicleCompartmentsParams;
  result: IUpdateVehicleCompartmentsResult;
}

const updateVehicleCompartmentsIR: any = {"usedParamSet":{"rows":true,"tenantId":true,"ownerId":true},"params":[{"name":"rows","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"id","required":false},{"name":"type","required":false},{"name":"name","required":false},{"name":"maxWeight","required":false},{"name":"maxWeightUnit","required":false},{"name":"maxLength","required":false},{"name":"maxWidth","required":false},{"name":"maxHeight","required":false},{"name":"dimensionUnit","required":false},{"name":"maxVolume","required":false},{"name":"maxVolumeUnit","required":false}]},"locs":[{"a":165,"b":169}]},{"name":"tenantId","required":true,"transform":{"type":"scalar"},"locs":[{"a":710,"b":719}]},{"name":"ownerId","required":true,"transform":{"type":"scalar"},"locs":[{"a":742,"b":750}]}],"statement":"WITH updated_compartments(id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit) AS (\n  VALUES :rows\n)\nUPDATE operational_workspace.vehicle_compartments AS c\nSET type = u.type::text,\n    name = u.name::text,\n    max_weight = u.max_weight::double precision,\n    max_weight_unit = u.max_weight_unit::text,\n    max_length = u.max_length::double precision,\n    max_width = u.max_width::double precision,\n    max_height = u.max_height::double precision,\n    dimension_unit = u.dimension_unit::text,\n    max_volume = u.max_volume::double precision,\n    max_volume_unit = u.max_volume_unit::text\nFROM updated_compartments AS u\nWHERE c.tenant_id = :tenantId!\n  AND c.vehicle_id = :ownerId!\n  AND c.id = u.id::uuid"};

/**
 * Query generated from SQL:
 * ```
 * WITH updated_compartments(id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height, dimension_unit, max_volume, max_volume_unit) AS (
 *   VALUES :rows
 * )
 * UPDATE operational_workspace.vehicle_compartments AS c
 * SET type = u.type::text,
 *     name = u.name::text,
 *     max_weight = u.max_weight::double precision,
 *     max_weight_unit = u.max_weight_unit::text,
 *     max_length = u.max_length::double precision,
 *     max_width = u.max_width::double precision,
 *     max_height = u.max_height::double precision,
 *     dimension_unit = u.dimension_unit::text,
 *     max_volume = u.max_volume::double precision,
 *     max_volume_unit = u.max_volume_unit::text
 * FROM updated_compartments AS u
 * WHERE c.tenant_id = :tenantId!
 *   AND c.vehicle_id = :ownerId!
 *   AND c.id = u.id::uuid
 * ```
 */
export const updateVehicleCompartments = new PreparedQuery<IUpdateVehicleCompartmentsParams,IUpdateVehicleCompartmentsResult>(updateVehicleCompartmentsIR);


