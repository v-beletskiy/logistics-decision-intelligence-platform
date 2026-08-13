import { hydratePersistenceData } from "../../../../../../../shared/infra/persistence/persistence-hydration";
import {
  Depot,
  DepotStatus,
  type DepotProps,
} from "../../../../domain/depot.aggregate";
import { DepotId } from "../../../../domain/depot-id";
import {
  Address,
  type AddressProps,
} from "../../../../../../../shared/domain/shared-kernel/value-objects/location/address";
import type { IInsertDepotParams } from "../queries/depot.insert.queries";

export interface DepotPersistenceRow {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly state_or_region: string | null;
  readonly city: string;
  readonly street: string;
  readonly building_number: string;
  readonly postal_code: string;
  readonly status: string;
  readonly vehicle_capacity: number;
  readonly driver_capacity: number;
  readonly vehicle_count: number;
  readonly driver_count: number;
}

/** Maps a Depot aggregate to and from its persistence representation. */
export class DepotMapper {
  static toDomain(row: DepotPersistenceRow): Depot {
    return hydratePersistenceData("depot", () => {
      const props: DepotProps = {
        name: row.name,
        address: Address.create({
          country: row.country,
          stateOrRegion: row.state_or_region ?? undefined,
          city: row.city,
          street: row.street,
          buildingNumber: row.building_number,
          postalCode: row.postal_code,
        } satisfies AddressProps),
        vehicleCapacity: row.vehicle_capacity,
        driverCapacity: row.driver_capacity,
        vehicleCount: row.vehicle_count,
        driverCount: row.driver_count,
        status: row.status as DepotStatus,
      };
      return Depot.reconstitute(DepotId.from(row.id), props);
    });
  }

  static toPersistence(tenantId: string, depot: Depot): IInsertDepotParams {
    return {
      tenantId,
      id: depot.id.value,
      name: depot.name,
      country: depot.address.country,
      stateOrRegion: depot.address.stateOrRegion,
      city: depot.address.city,
      street: depot.address.street,
      buildingNumber: depot.address.buildingNumber,
      postalCode: depot.address.postalCode,
      status: depot.status,
      vehicleCapacity: depot.vehicleCapacity,
      driverCapacity: depot.driverCapacity,
      vehicleCount: depot.vehicleCount,
      driverCount: depot.driverCount,
    };
  }
}
