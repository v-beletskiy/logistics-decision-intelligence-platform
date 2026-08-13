/** Types generated for queries found in "src/operational-workspace/domain-modules/vehicle/infra/persistence/queries/vehicle.insert-compartments.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'InsertVehicleCompartments' parameters type */
export interface IInsertVehicleCompartmentsParams {
  rows: readonly ({
    tenantId: string | null | void,
    id: string | null | void,
    vehicleId: string | null | void,
    type: string | null | void,
    name: string | null | void,
    maxWeight: number | null | void,
    maxWeightUnit: string | null | void,
    maxLength: number | null | void,
    maxWidth: number | null | void,
    maxHeight: number | null | void,
    dimensionUnit: string | null | void,
    maxVolume: number | null | void,
    maxVolumeUnit: string | null | void
  })[];
}

/** 'InsertVehicleCompartments' return type */
export type IInsertVehicleCompartmentsResult = void;

/** 'InsertVehicleCompartments' query type */
export interface IInsertVehicleCompartmentsQuery {
  params: IInsertVehicleCompartmentsParams;
  result: IInsertVehicleCompartmentsResult;
}

const insertVehicleCompartmentsIR: any = {"usedParamSet":{"rows":true},"params":[{"name":"rows","required":false,"transform":{"type":"pick_array_spread","keys":[{"name":"tenantId","required":false},{"name":"id","required":false},{"name":"vehicleId","required":false},{"name":"type","required":false},{"name":"name","required":false},{"name":"maxWeight","required":false},{"name":"maxWeightUnit","required":false},{"name":"maxLength","required":false},{"name":"maxWidth","required":false},{"name":"maxHeight","required":false},{"name":"dimensionUnit","required":false},{"name":"maxVolume","required":false},{"name":"maxVolumeUnit","required":false}]},"locs":[{"a":216,"b":220}]}],"statement":"INSERT INTO operational_workspace.vehicle_compartments\n  (tenant_id, id, vehicle_id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height,\n   dimension_unit, max_volume, max_volume_unit)\nVALUES :rows"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO operational_workspace.vehicle_compartments
 *   (tenant_id, id, vehicle_id, type, name, max_weight, max_weight_unit, max_length, max_width, max_height,
 *    dimension_unit, max_volume, max_volume_unit)
 * VALUES :rows
 * ```
 */
export const insertVehicleCompartments = new PreparedQuery<IInsertVehicleCompartmentsParams,IInsertVehicleCompartmentsResult>(insertVehicleCompartmentsIR);


