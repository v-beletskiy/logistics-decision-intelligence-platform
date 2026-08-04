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
import type { CompartmentEntity } from "./entities/compartment.entity";
import type { VehicleEntity } from "./entities/vehicle.entity";
import type { IInsertVehicleCompartmentsParams } from "./queries/vehicle.insert-compartments.queries";
import type { IInsertVehicleParams } from "./queries/vehicle.insert.queries";
import type { IUpdateVehicleCompartmentsParams } from "./queries/vehicle.update-compartments.queries";

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
  static toDomain(entity: VehicleEntity): Vehicle {
    const compartments = this.requireJsonArray<CompartmentEntity>(
      entity.compartments,
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
      registrationNumber: entity.registration_number,
      name: entity.name ?? undefined,
      depotId: entity.depot_id ?? undefined,
      status: entity.status as VehicleStatus,
      compartments,
    };
    return Vehicle.reconstitute(VehicleId.from(entity.id), props);
  }

  static toPersistence(vehicle: Vehicle): VehicleWriteModel {
    const plan = vehicle.getPersistencePlan();
    return {
      isNew: plan.isNew,
      root: {
        id: vehicle.id.value,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        depotId: vehicle.depotId,
        status: vehicle.status,
      },
      inserts: plan.compartments.inserts.map((compartment) =>
        toCompartmentInsertRow(vehicle, compartment),
      ),
      updates: plan.compartments.updates.map((compartment) =>
        toCompartmentUpdateRow(vehicle, compartment),
      ),
      removedIds: [...plan.compartments.removedIds],
    };
  }
}

function toCompartmentInsertRow(
  vehicle: Vehicle,
  compartment: Compartment,
): CompartmentInsertRow {
  const { capacity } = compartment;
  return {
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
  vehicle: Vehicle,
  compartment: Compartment,
): CompartmentUpdateRow {
  const row = toCompartmentInsertRow(vehicle, compartment);
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    maxWeight: String(row.maxWeight),
    maxWeightUnit: row.maxWeightUnit,
    maxLength: String(row.maxLength),
    maxWidth: String(row.maxWidth),
    maxHeight: String(row.maxHeight),
    dimensionUnit: row.dimensionUnit,
    maxVolume: String(row.maxVolume),
    maxVolumeUnit: row.maxVolumeUnit,
  };
}
