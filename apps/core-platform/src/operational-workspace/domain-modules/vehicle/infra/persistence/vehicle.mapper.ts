import { AggregatePersistenceMapper } from "../../../../../shared/infra/persistence/orm/aggregate-mapper";
import {
  Compartment,
  CompartmentType,
  type CompartmentProps,
  type VehicleProps,
  Vehicle,
  VehicleStatus,
} from "../../domain/vehicle.aggregate";
import { CompartmentId } from "../../domain/compartment-id";
import { VehicleId } from "../../domain/vehicle-id";
import {
  DimensionUnit,
  VolumeUnit,
  WeightUnit,
} from "../../../../../shared/domain/shared-kernel/value-objects/measurement";
import type { IInsertVehicleCompartmentsParams } from "./queries/vehicle.insert-compartments.queries";
import type { IInsertVehicleParams } from "./queries/vehicle.insert.queries";
import type { IUpdateVehicleCompartmentsParams } from "./queries/vehicle.update-compartments.queries";

export interface CompartmentPersistenceData {
  readonly id: string;
  readonly type: string;
  readonly name: string | null;
  readonly max_weight: number;
  readonly max_weight_unit: string;
  readonly max_length: number;
  readonly max_width: number;
  readonly max_height: number;
  readonly dimension_unit: string;
  readonly max_volume: number;
  readonly max_volume_unit: string;
}

export interface VehiclePersistenceRow {
  readonly id: string;
  readonly registration_number: string;
  readonly name: string | null;
  readonly depot_id: string | null;
  readonly status: string;
  readonly compartments: unknown;
}

/** Root row consumed by persistRoot, matching the vehicle insert/update statements. */
export type VehicleRootRow = IInsertVehicleParams;

/** Row consumed by the bulk compartment insert statement. */
export type CompartmentInsertRow =
  IInsertVehicleCompartmentsParams["rows"][number];

/** Row consumed by the bulk compartment update statement. */
export type CompartmentUpdateRow =
  IUpdateVehicleCompartmentsParams["rows"][number];

/** Write rows derived from the aggregate's persistence plan. */
export interface VehicleWriteModel {
  readonly isNew: boolean;
  readonly root: VehicleRootRow;
  readonly inserts: readonly CompartmentInsertRow[];
  readonly updates: readonly CompartmentUpdateRow[];
  readonly removedIds: readonly string[];
}

/**
 * Explicit persistence-to-domain and domain-to-persistence mapping for Vehicle.
 *
 * Reads trust the persisted shape; business rules are validated by the domain
 * constructors. Writes derive their rows from the aggregate's persistence plan.
 */
export class VehicleMapper extends AggregatePersistenceMapper {
  static toDomain(row: VehiclePersistenceRow): Vehicle {
    const compartments = this.requireJsonArray<CompartmentPersistenceData>(
      row.compartments,
      "vehicle compartments",
    ).map((compartment): Compartment => {
      const props: CompartmentProps = {
        type: compartment.type as CompartmentType,
        name: compartment.name ?? undefined,
        capacity: {
          maxWeight: {
            value: compartment.max_weight,
            unit: compartment.max_weight_unit as WeightUnit,
          },
          maxItemDimensions: {
            length: compartment.max_length,
            width: compartment.max_width,
            height: compartment.max_height,
            unit: compartment.dimension_unit as DimensionUnit,
          },
          maxVolume: {
            value: compartment.max_volume,
            unit: compartment.max_volume_unit as VolumeUnit,
          },
        },
      };
      return Compartment.reconstitute(
        CompartmentId.from(compartment.id),
        props,
      );
    });

    const props: VehicleProps = {
      registrationNumber: row.registration_number,
      name: row.name ?? undefined,
      depotId: row.depot_id ?? undefined,
      status: row.status as VehicleStatus,
      compartments,
    };
    return Vehicle.reconstitute(VehicleId.from(row.id), props);
  }

  static toPersistence(tenantId: string, vehicle: Vehicle): VehicleWriteModel {
    const plan = vehicle.getPersistencePlan();
    return {
      isNew: plan.isNew,
      root: {
        tenantId,
        id: vehicle.id.value,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        depotId: vehicle.depotId,
        status: vehicle.status,
      },
      inserts: plan.compartments.inserts.map((compartment) =>
        toCompartmentInsertRow(tenantId, vehicle, compartment),
      ),
      updates: plan.compartments.updates.map((compartment) =>
        toCompartmentUpdateRow(compartment),
      ),
      removedIds: [...plan.compartments.removedIds],
    };
  }
}

function toCompartmentInsertRow(
  tenantId: string,
  vehicle: Vehicle,
  compartment: Compartment,
): CompartmentInsertRow {
  const { capacity } = compartment;
  return {
    tenantId,
    id: compartment.id.value,
    vehicleId: vehicle.id.value,
    type: compartment.type,
    name: compartment.name,
    maxWeight: capacity.maxWeight.value,
    maxWeightUnit: capacity.maxWeight.unit,
    maxLength: capacity.maxItemDimensions.length,
    maxWidth: capacity.maxItemDimensions.width,
    maxHeight: capacity.maxItemDimensions.height,
    dimensionUnit: capacity.maxItemDimensions.unit,
    maxVolume: capacity.maxVolume.value,
    maxVolumeUnit: capacity.maxVolume.unit,
  };
}

/**
 * Update rows carry scalar numerics as text: the bulk update joins a derived
 * VALUES table, so PostgreSQL infers the payload columns as text and the
 * statement casts them at usage.
 */
function toCompartmentUpdateRow(
  compartment: Compartment,
): CompartmentUpdateRow {
  const { capacity } = compartment;
  return {
    id: compartment.id.value,
    type: compartment.type,
    name: compartment.name,
    maxWeight: String(capacity.maxWeight.value),
    maxWeightUnit: capacity.maxWeight.unit,
    maxLength: String(capacity.maxItemDimensions.length),
    maxWidth: String(capacity.maxItemDimensions.width),
    maxHeight: String(capacity.maxItemDimensions.height),
    dimensionUnit: capacity.maxItemDimensions.unit,
    maxVolume: String(capacity.maxVolume.value),
    maxVolumeUnit: capacity.maxVolume.unit,
  };
}
