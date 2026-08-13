import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import { DomainException } from "../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import { requirePositiveFiniteNumber } from "../../../../shared/domain/shared-kernel/validation/primitives/number/require-positive-finite-number";
import { requireNonBlankString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/require-non-blank-string";
import {
  Address,
  type AddressProps,
} from "../../../../shared/domain/shared-kernel/value-objects/location/address";

import type { DepotEvent } from "./events/depot.domain-events";
import { DepotId } from "./depot-id";

export enum DepotStatus {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Closed = "CLOSED",
}

/** Business properties accepted when a depot is created or updated. */
export interface DepotDetails {
  readonly name: string;
  readonly address: AddressProps;
}

/** Complete persisted Depot state, excluding its identity. */
export interface DepotProps extends DepotDetails {
  readonly address: Address;
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
    const depot = new Depot(
      DepotId.generate(),
      {
        name: details.name,
        address: Address.create(details.address),
        vehicleCapacity,
        driverCapacity,
        vehicleCount: 0,
        driverCount: 0,
        status: DepotStatus.Active,
      },
    );
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
    this.raiseDomainEvent("DepotDetailsUpdatedDomainEvent");
  }

  updateVehicleCapacity(vehicleCapacity: number): void {
    this.assertNotClosed();
    this._vehicleCapacity = requireDepotCapacity(
      vehicleCapacity,
      "Depot vehicle capacity",
    );
    this.assertOccupancyWithinCapacity();
    this.raiseDomainEvent("DepotVehicleCapacityUpdatedDomainEvent");
  }

  updateDriverCapacity(driverCapacity: number): void {
    this.assertNotClosed();
    this._driverCapacity = requireDepotCapacity(
      driverCapacity,
      "Depot driver capacity",
    );
    this.assertOccupancyWithinCapacity();
    this.raiseDomainEvent("DepotDriverCapacityUpdatedDomainEvent");
  }

  activate(): void {
    this.assertNotClosed();
    if (this._status === DepotStatus.Active) {
      throw new DomainException("A depot is already active.");
    }
    this._status = DepotStatus.Active;
    this.raiseDomainEvent("DepotActivatedDomainEvent");
  }

  inactivate(): void {
    this.assertNotClosed();
    if (this._status === DepotStatus.Inactive) {
      throw new DomainException("A depot is already inactive.");
    }
    this._status = DepotStatus.Inactive;
    this.raiseDomainEvent("DepotInactivatedDomainEvent");
  }

  close(): void {
    if (this._status === DepotStatus.Closed) {
      throw new DomainException("A depot is already closed.");
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
      throw new DomainException("A depot has no vehicles to release.");
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
      throw new DomainException("A depot has no drivers to release.");
    }
    this._driverCount -= 1;
  }

  private assertAcceptsNewResources(): void {
    if (this._status !== DepotStatus.Active) {
      throw new DomainException(
        "Only an active depot can receive new vehicles or drivers.",
      );
    }
  }

  private assertHasVehicleCapacity(): void {
    if (this.isFullOfVehicles) {
      throw new DomainException(
        "A depot cannot receive new vehicles when it is full.",
      );
    }
  }

  private assertHasDriverCapacity(): void {
    if (this.isFullOfDrivers) {
      throw new DomainException(
        "A depot cannot receive new drivers when it is full.",
      );
    }
  }

  private assertOccupancyWithinCapacity(): void {
    if (this._vehicleCount > this._vehicleCapacity) {
      throw new DomainException(
        "Depot vehicle occupancy cannot exceed its vehicle capacity.",
      );
    }
    if (this._driverCount > this._driverCapacity) {
      throw new DomainException(
        "Depot driver occupancy cannot exceed its driver capacity.",
      );
    }
  }

  private assertNotClosed(): void {
    if (this._status === DepotStatus.Closed) {
      throw new DomainException("A closed depot cannot be changed.");
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
    throw new DomainException("A depot must have exactly one address.");
  }
  return value;
}

function requireDepotCapacity(value: unknown, label: string): number {
  const capacity = requirePositiveFiniteNumber(value, label);
  if (!Number.isInteger(capacity)) {
    throw new DomainException(`${label} must be a whole number.`);
  }
  return capacity;
}

function requireOccupancyCount(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new DomainException(
      `Depot ${label} count must be a non-negative whole number.`,
    );
  }
  return value;
}

function requireDepotStatus(value: unknown): DepotStatus {
  if (!isEnumValue(DepotStatus, value)) {
    throw new DomainException("A depot status is invalid.");
  }
  return value;
}
