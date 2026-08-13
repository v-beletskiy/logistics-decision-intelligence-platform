import {
  Depot,
  DepotStatus,
  type DepotProps,
} from "../../domain/depot.aggregate";
import { DepotId } from "../../domain/depot-id";
import { AggregatePersistenceMapper } from "../../../../../shared/infra/persistence/orm/aggregate-mapper";
import {
  Address,
  type AddressProps,
} from "../../../../../shared/domain/shared-kernel/value-objects/location/address";
import type { IInsertDepotParams } from "./queries/depot.insert.queries";

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

/** Root row consumed by persistRoot, matching the depot insert/update statements. */
export type DepotRootRow = IInsertDepotParams;

/** Write rows derived from the aggregate's persistence plan. */
export interface DepotWriteModel {
  readonly isNew: boolean;
  readonly root: DepotRootRow;
}

/**
 * Explicit persistence-to-domain and domain-to-persistence mapping for Depot.
 *
 * Reads trust the persisted shape; business rules are validated by the domain
 * constructors. Writes derive their rows from the aggregate's persistence plan.
 */
export class DepotMapper extends AggregatePersistenceMapper {
  static toDomain(row: DepotPersistenceRow): Depot {
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
  }

  static toPersistence(tenantId: string, depot: Depot): DepotWriteModel {
    const plan = depot.getPersistencePlan();
    return {
      isNew: plan.isNew,
      root: {
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
      },
    };
  }
}
