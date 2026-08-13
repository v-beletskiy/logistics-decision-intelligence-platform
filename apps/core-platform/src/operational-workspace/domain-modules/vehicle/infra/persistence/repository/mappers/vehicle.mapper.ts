import { hydratePersistenceData } from "../../../../../../../shared/infra/persistence/persistence-hydration";
import {
  Compartment,
  CompartmentType,
  type CompartmentProps,
  Vehicle,
  VehicleStatus,
  type VehicleProps,
} from "../../../../domain/vehicle.aggregate";
import { CompartmentId } from "../../../../domain/compartment-id";
import { VehicleId } from "../../../../domain/vehicle-id";
import { DepotId } from "../../../../../depot/domain/depot-id";
import {
  DimensionUnit,
  VolumeUnit,
  WeightUnit,
} from "../../../../../../../shared/domain/shared-kernel/value-objects/measurement";
import type { IInsertVehicleParams } from "../queries/vehicle.insert.queries";
import type { IReconcileVehicleCompartmentsParams } from "../queries/vehicle.reconcile-compartments.queries";

interface CompartmentPersistenceData {
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

/** Maps the complete, bounded Vehicle aggregate to and from persistence. */
export class VehicleMapper {
  static toDomain(row: VehiclePersistenceRow): Vehicle {
    return hydratePersistenceData("vehicle", () => {
      const compartments = (
        row.compartments as readonly CompartmentPersistenceData[]
      ).map((compartment) =>
        Compartment.reconstitute(CompartmentId.from(compartment.id), {
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
        } satisfies CompartmentProps),
      );
      const props: VehicleProps = {
        registrationNumber: row.registration_number,
        name: row.name ?? undefined,
        depotId: row.depot_id === null ? undefined : DepotId.from(row.depot_id),
        status: row.status as VehicleStatus,
        compartments,
      };
      return Vehicle.reconstitute(VehicleId.from(row.id), props);
    });
  }

  static toPersistence(tenantId: string, vehicle: Vehicle): {
    readonly root: IInsertVehicleParams;
    readonly compartments: IReconcileVehicleCompartmentsParams;
  } {
    const compartments = vehicle.compartments;
    return {
      root: {
        tenantId,
        id: vehicle.id.value,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        depotId: vehicle.depotId?.value,
        status: vehicle.status,
      },
      compartments: {
        tenantId,
        vehicleId: vehicle.id.value,
        ids: compartments.map((compartment) => compartment.id.value),
        types: compartments.map((compartment) => compartment.type),
        names: compartments.map((compartment) => compartment.name ?? ""),
        maxWeights: compartments.map(
          (compartment) => compartment.capacity.maxWeight.value,
        ),
        maxWeightUnits: compartments.map(
          (compartment) => compartment.capacity.maxWeight.unit,
        ),
        maxLengths: compartments.map(
          (compartment) => compartment.capacity.maxItemDimensions.length,
        ),
        maxWidths: compartments.map(
          (compartment) => compartment.capacity.maxItemDimensions.width,
        ),
        maxHeights: compartments.map(
          (compartment) => compartment.capacity.maxItemDimensions.height,
        ),
        dimensionUnits: compartments.map(
          (compartment) => compartment.capacity.maxItemDimensions.unit,
        ),
        maxVolumes: compartments.map(
          (compartment) => compartment.capacity.maxVolume.value,
        ),
        maxVolumeUnits: compartments.map(
          (compartment) => compartment.capacity.maxVolume.unit,
        ),
      },
    };
  }
}
