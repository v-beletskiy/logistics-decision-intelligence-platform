import { DEPOT_ERROR_CODES } from "./depot-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../../shared/domain/core/aggregate.js";
import {
  DomainConflictException,
  DomainException,
} from "../../../../../shared/domain/domain.exceptions.js";
import { requirePositiveFiniteNumber } from "../../../../../shared/domain/validation/primitives/number/require-positive-finite-number.js";
import { requireNonBlankString } from "../../../../../shared/domain/validation/primitives/string/require-non-blank-string.js";
import {
  Address,
  type AddressProps,
} from "../../../../../shared/domain/value-objects/location/address.js";
import {
  GeoCoordinate,
  type GeoCoordinateProps,
} from "../../../../../shared/domain/value-objects/location/geo-coordinate.js";

import {
  DepotDriverCapacityExceededException,
  DepotVehicleCapacityExceededException,
} from "./depot.exceptions.js";
import type { DepotEvent } from "./depot.events.js";
import { DepotId } from "./depot-id.js";

export enum DepotStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Closed = "CLOSED",
}

/** Business properties accepted when a depot is created or updated. */
export interface DepotDetails {
  readonly name: string;
  readonly address: AddressProps;
  readonly location: GeoCoordinateProps;
}

/** Complete persisted Depot state, excluding its identity. */
export interface DepotProps extends DepotDetails {
  readonly address: Address;
  readonly location: GeoCoordinate;
  readonly vehicleCapacity: number;
  readonly driverCapacity: number;
  readonly vehicleCount: number;
  readonly driverCount: number;
  readonly status: DepotStatus;
}

/** A physical operational location where Vehicles and Drivers are based. */
export class Depot extends Aggregate<DepotId, DepotEvent> {
  private _name: string;
  private _address: Address;
  private _location: GeoCoordinate;
  private _vehicleCapacity: number;
  private _driverCapacity: number;
  private _vehicleCount: number;
  private _driverCount: number;
  private _status: DepotStatus;

  private constructor(id: DepotId, props: DepotProps) {
    super(id);

    const validatedDetails = Depot.validateDetails(props);
    this._name = validatedDetails.name;
    this._address = validatedDetails.address;
    this._location = requireDepotLocation(props.location);

    this._vehicleCapacity = requireDepotCapacity(
      props.vehicleCapacity,
      "Depot vehicle capacity",
    );
    this._driverCapacity = requireDepotCapacity(
      props.driverCapacity,
      "Depot driver capacity",
    );
    this._vehicleCount = requireOccupancyCount(props.vehicleCount, "vehicle");
    this._driverCount = requireOccupancyCount(props.driverCount, "driver");
    this.assertOccupancyWithinCapacity();
    this._status = requireDepotStatus(props.status);
  }

  get name(): string {
    return this._name;
  }

  get address(): Address {
    return this._address;
  }

  get location(): GeoCoordinate {
    return this._location;
  }

  get vehicleCapacity(): number {
    return this._vehicleCapacity;
  }

  get driverCapacity(): number {
    return this._driverCapacity;
  }

  get vehicleCount(): number {
    return this._vehicleCount;
  }

  get driverCount(): number {
    return this._driverCount;
  }

  get status(): DepotStatus {
    return this._status;
  }

  get occupantCount(): number {
    return this._vehicleCount + this._driverCount;
  }

  get isFullOfVehicles(): boolean {
    return this._vehicleCount >= this._vehicleCapacity;
  }

  get isFullOfDrivers(): boolean {
    return this._driverCount >= this._driverCapacity;
  }

  static create(
    details: DepotDetails,
    vehicleCapacity: number,
    driverCapacity: number,
  ): Depot {
    const depot = new Depot(DepotId.generate(), {
      name: details.name,
      address: Address.create(details.address),
      location: GeoCoordinate.create(details.location),
      vehicleCapacity,
      driverCapacity,
      vehicleCount: 0,
      driverCount: 0,
      status: DepotStatus.Active,
    });
    depot.raiseDomainEvent("DepotCreatedDomainEvent");
    return depot;
  }

  static reconstitute(id: DepotId, props: DepotProps): Depot {
    return new Depot(id, props);
  }

  private static validateDetails(
    details: DepotDetails,
  ): Pick<DepotProps, "name" | "address"> {
    return {
      name: requireNonBlankString(details.name, "Depot name"),
      address: requireDepotAddress(Address.create(details.address)),
    };
  }

  updateDetails(details: DepotDetails): void {
    this.assertNotClosed();
    const validatedDetails = Depot.validateDetails(details);
    this._name = validatedDetails.name;
    this._address = validatedDetails.address;
    this._location = requireDepotLocation(
      GeoCoordinate.create(details.location),
    );
    this.raiseDomainEvent("DepotDetailsUpdatedDomainEvent");
  }

  updateVehicleCapacity(vehicleCapacity: number): void {
    this.assertNotClosed();
    const validatedCapacity = requireDepotCapacity(
      vehicleCapacity,
      "Depot vehicle capacity",
    );
    if (this._vehicleCount > validatedCapacity) {
      throw new DepotVehicleCapacityExceededException(
        this._vehicleCount,
        validatedCapacity,
      );
    }
    this._vehicleCapacity = validatedCapacity;
    this.raiseDomainEvent("DepotVehicleCapacityUpdatedDomainEvent");
  }

  updateDriverCapacity(driverCapacity: number): void {
    this.assertNotClosed();
    const validatedCapacity = requireDepotCapacity(
      driverCapacity,
      "Depot driver capacity",
    );
    if (this._driverCount > validatedCapacity) {
      throw new DepotDriverCapacityExceededException(
        this._driverCount,
        validatedCapacity,
      );
    }
    this._driverCapacity = validatedCapacity;
    this.raiseDomainEvent("DepotDriverCapacityUpdatedDomainEvent");
  }

  activate(): void {
    this.assertNotClosed();
    if (this._status === DepotStatus.Active) {
      throw new DomainConflictException(
        "A depot is already active.",
        DEPOT_ERROR_CODES.depotIsAlreadyActive,
      );
    }
    this._status = DepotStatus.Active;
    this.raiseDomainEvent("DepotActivatedDomainEvent");
  }

  inactivate(): void {
    this.assertNotClosed();
    if (this._status === DepotStatus.Inactive) {
      throw new DomainConflictException(
        "A depot is already inactive.",
        DEPOT_ERROR_CODES.depotIsAlreadyInactive,
      );
    }
    this._status = DepotStatus.Inactive;
    this.raiseDomainEvent("DepotInactivatedDomainEvent");
  }

  close(): void {
    if (this._status === DepotStatus.Closed) {
      throw new DomainConflictException(
        "A depot is already closed.",
        DEPOT_ERROR_CODES.depotIsAlreadyClosed,
      );
    }
    this._status = DepotStatus.Closed;
    this.raiseDomainEvent("DepotClosedDomainEvent");
  }

  receiveVehicle(): void {
    this.assertAcceptsNewResources();
    this.assertHasVehicleCapacity();
    this._vehicleCount += 1;
  }

  releaseVehicle(): void {
    this.assertNotClosed();
    if (this._vehicleCount === 0) {
      throw new DomainConflictException(
        "A depot has no vehicles to release.",
        DEPOT_ERROR_CODES.depotHasNoVehiclesToRelease,
      );
    }
    this._vehicleCount -= 1;
  }

  receiveDriver(): void {
    this.assertAcceptsNewResources();
    this.assertHasDriverCapacity();
    this._driverCount += 1;
  }

  releaseDriver(): void {
    this.assertNotClosed();
    if (this._driverCount === 0) {
      throw new DomainConflictException(
        "A depot has no drivers to release.",
        DEPOT_ERROR_CODES.depotHasNoDriversToRelease,
      );
    }
    this._driverCount -= 1;
  }

  private assertAcceptsNewResources(): void {
    if (this._status !== DepotStatus.Active) {
      throw new DomainConflictException(
        "Only an active depot can receive new vehicles or drivers.",
        DEPOT_ERROR_CODES.onlyAnActiveDepotCanReceiveNewVehiclesOrDrivers,
      );
    }
  }

  private assertHasVehicleCapacity(): void {
    if (this.isFullOfVehicles) {
      throw new DomainConflictException(
        "A depot cannot receive new vehicles when it is full.",
        DEPOT_ERROR_CODES.depotCannotReceiveNewVehiclesWhenItIsFull,
      );
    }
  }

  private assertHasDriverCapacity(): void {
    if (this.isFullOfDrivers) {
      throw new DomainConflictException(
        "A depot cannot receive new drivers when it is full.",
        DEPOT_ERROR_CODES.depotCannotReceiveNewDriversWhenItIsFull,
      );
    }
  }

  private assertOccupancyWithinCapacity(): void {
    if (this._vehicleCount > this._vehicleCapacity) {
      throw new DepotVehicleCapacityExceededException(
        this._vehicleCount,
        this._vehicleCapacity,
      );
    }
    if (this._driverCount > this._driverCapacity) {
      throw new DepotDriverCapacityExceededException(
        this._driverCount,
        this._driverCapacity,
      );
    }
  }

  private assertNotClosed(): void {
    if (this._status === DepotStatus.Closed) {
      throw new DomainConflictException(
        "A closed depot cannot be changed.",
        DEPOT_ERROR_CODES.closedDepotCannotBeChanged,
      );
    }
  }

  private raiseDomainEvent(type: DepotEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
    } satisfies DepotEvent);
  }
}

function requireDepotAddress(value: unknown): Address {
  if (!(value instanceof Address)) {
    throw new DomainException(
      "A depot must have exactly one address.",
      DEPOT_ERROR_CODES.depotMustHaveExactlyOneAddress,
    );
  }
  return value;
}

function requireDepotLocation(value: unknown): GeoCoordinate {
  if (!(value instanceof GeoCoordinate)) {
    throw new DomainException(
      "A depot must have exactly one location.",
      DEPOT_ERROR_CODES.depotMustHaveExactlyOneLocation,
    );
  }
  return value;
}

function requireDepotCapacity(value: unknown, label: string): number {
  const capacity = requirePositiveFiniteNumber(value, label);
  if (!Number.isInteger(capacity)) {
    throw new DomainException(
      `${label} must be a whole number.`,
      DEPOT_ERROR_CODES.capacityMustBeAWholeNumber,
    );
  }
  return capacity;
}

function requireOccupancyCount(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new DomainException(
      `Depot ${label} count must be a non-negative whole number.`,
      DEPOT_ERROR_CODES.occupancyCountIsInvalid,
    );
  }
  return value;
}

function requireDepotStatus(value: unknown): DepotStatus {
  if (!isEnumValue(DepotStatus, value)) {
    throw new DomainException(
      "A depot status is invalid.",
      DEPOT_ERROR_CODES.depotStatusIsInvalid,
    );
  }
  return value;
}
