import { VEHICLE_ERROR_CODES } from "./vehicle-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import {
  DomainConflictException,
  DomainException,
} from "../../../../../shared/domain/domain.exceptions.js";
import { optionalTrimmedString } from "../../../../../shared/domain/validation/primitives/string/optional-trimmed-string.js";
import { requireNonBlankString } from "../../../../../shared/domain/validation/primitives/string/require-non-blank-string.js";
import { Aggregate } from "../../../../../shared/domain/core/aggregate.js";

import { Compartment } from "./compartment.entity.js";
import type { CompartmentProps } from "./compartment.entity.js";
import { CompartmentId } from "./compartment-id.js";
import type { VehicleEvent } from "./vehicle.events.js";
import { VehicleId } from "./vehicle-id.js";
import { DepotId } from "../../depot/domain/depot-id.js";

export { Capacity } from "./capacity.value-object.js";
export type { CapacityProps } from "./capacity.value-object.js";
export { Compartment, CompartmentType } from "./compartment.entity.js";
export type { CompartmentProps } from "./compartment.entity.js";

export enum VehicleStatus {
  Available = "AVAILABLE",
  Unavailable = "UNAVAILABLE",
  Maintenance = "MAINTENANCE",
  Decommissioned = "DECOMMISSIONED",
}

/** Business properties accepted when a vehicle is registered or updated. */
export interface VehicleDetails {
  readonly registrationNumber: string;
  readonly name?: string;
  readonly depotId?: DepotId;
}

/** Business properties required to register a Vehicle and its initial compartments. */
export interface RegisterVehicleParams extends VehicleDetails {
  readonly compartments: readonly CompartmentProps[];
}

/** Complete persisted Vehicle state, excluding its identity. */
export interface VehicleProps {
  readonly registrationNumber: string;
  readonly name?: string;
  readonly depotId?: DepotId;
  readonly compartments: readonly Compartment[];
  readonly status: VehicleStatus;
}

export const MAX_VEHICLE_COMPARTMENTS = 5;

/** A transportation asset used to execute assignments. */
export class Vehicle extends Aggregate<VehicleId, VehicleEvent> {
  private _registrationNumber: string;
  private _name?: string;
  private _depotId?: DepotId;
  private readonly _compartments: Compartment[];
  private _status: VehicleStatus;

  private constructor(id: VehicleId, props: VehicleProps) {
    super(id);

    const validatedDetails = Vehicle.validateDetails(props);
    this._registrationNumber = validatedDetails.registrationNumber;
    this._name = validatedDetails.name;
    this._depotId = validatedDetails.depotId;

    const compartments = copyAndValidateCompartments(props.compartments);
    this._compartments = compartments;
    const status = requireVehicleStatus(props.status);
    this._status = status;
  }

  get registrationNumber(): string {
    return this._registrationNumber;
  }

  get name(): string | undefined {
    return this._name;
  }

  get depotId(): DepotId | undefined {
    return this._depotId;
  }

  get compartments(): readonly Compartment[] {
    return [...this._compartments];
  }

  get status(): VehicleStatus {
    return this._status;
  }

  static register(details: RegisterVehicleParams): Vehicle {
    const vehicle = new Vehicle(VehicleId.generate(), {
      ...details,
      compartments: createCompartments(details.compartments),
      status: VehicleStatus.Available,
    });
    vehicle.recordDomainEvent({
      aggregateId: vehicle.id.value,
      occurredAt: new Date(),
      type: "VehicleRegisteredDomainEvent",
    });
    return vehicle;
  }

  static reconstitute(id: VehicleId, props: VehicleProps): Vehicle {
    return new Vehicle(id, props);
  }

  private static validateDetails(details: VehicleDetails): VehicleDetails {
    return {
      registrationNumber: requireNonBlankString(
        details.registrationNumber,
        "Vehicle registration number",
      ),
      name: optionalTrimmedString(details.name, "Vehicle name"),
      depotId: optionalDepotId(details.depotId),
    };
  }

  updateDetails(details: VehicleDetails): void {
    this.assertNotDecommissioned();
    const validatedDetails = Vehicle.validateDetails(details);
    this._registrationNumber = validatedDetails.registrationNumber;
    this._name = validatedDetails.name;
    this._depotId = validatedDetails.depotId;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleDetailsUpdatedDomainEvent",
    });
  }

  addCompartment(details: CompartmentProps): CompartmentId {
    this.assertNotDecommissioned();
    assertVehicleCompartmentLimit(this._compartments.length + 1);
    const compartment = Compartment.create(details);
    this._compartments.push(compartment);
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleCompartmentAddedDomainEvent",
      compartmentId: compartment.id.value,
    });
    return compartment.id;
  }

  updateCompartment(id: CompartmentId, details: CompartmentProps): void {
    this.assertNotDecommissioned();
    const index = this.compartmentIndex(id);
    this._compartments[index] = Compartment.reconstitute(id, details);
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleCompartmentUpdatedDomainEvent",
      compartmentId: id.value,
    });
  }

  removeCompartment(id: CompartmentId): void {
    this.assertNotDecommissioned();
    if (this._compartments.length === 1) {
      throw new DomainException(
        "A vehicle must have at least one compartment.",
        VEHICLE_ERROR_CODES.vehicleMustHaveAtLeastOneCompartment,
      );
    }
    this._compartments.splice(this.compartmentIndex(id), 1);
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleCompartmentRemovedDomainEvent",
      compartmentId: id.value,
    });
  }

  markAvailable(): void {
    this.assertNotDecommissioned();
    if (this._status === VehicleStatus.Maintenance) {
      throw new DomainException(
        "A vehicle must be returned from maintenance before it can be available.",
        VEHICLE_ERROR_CODES.vehicleMustBeReturnedFromMaintenanceBeforeItCanBeAvailable,
      );
    }
    this._status = VehicleStatus.Available;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleMarkedAvailableDomainEvent",
    });
  }

  markUnavailable(): void {
    this.assertNotDecommissioned();
    if (this._status === VehicleStatus.Maintenance) {
      throw new DomainConflictException(
        "A vehicle in maintenance cannot be marked unavailable.",
        VEHICLE_ERROR_CODES.vehicleInMaintenanceCannotBeMarkedUnavailable,
      );
    }
    this._status = VehicleStatus.Unavailable;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleMarkedUnavailableDomainEvent",
    });
  }

  sendToMaintenance(): void {
    this.assertNotDecommissioned();
    if (this._status === VehicleStatus.Maintenance) {
      throw new DomainConflictException(
        "A vehicle is already in maintenance.",
        VEHICLE_ERROR_CODES.vehicleIsAlreadyInMaintenance,
      );
    }
    this._status = VehicleStatus.Maintenance;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleSentToMaintenanceDomainEvent",
    });
  }

  returnFromMaintenance(): void {
    if (this._status !== VehicleStatus.Maintenance) {
      throw new DomainConflictException(
        "Only a vehicle in maintenance can be returned from maintenance.",
        VEHICLE_ERROR_CODES.onlyAVehicleInMaintenanceCanBeReturnedFromMaintenance,
      );
    }
    this._status = VehicleStatus.Available;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleReturnedFromMaintenanceDomainEvent",
    });
  }

  decommission(): void {
    if (this._status === VehicleStatus.Decommissioned) {
      throw new DomainConflictException(
        "A vehicle is already decommissioned.",
        VEHICLE_ERROR_CODES.vehicleIsAlreadyDecommissioned,
      );
    }
    this._status = VehicleStatus.Decommissioned;
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type: "VehicleDecommissionedDomainEvent",
    });
  }

  private assertNotDecommissioned(): void {
    if (this._status === VehicleStatus.Decommissioned) {
      throw new DomainConflictException(
        "A decommissioned vehicle cannot be changed.",
        VEHICLE_ERROR_CODES.decommissionedVehicleCannotBeChanged,
      );
    }
  }

  private compartmentIndex(id: CompartmentId): number {
    const index = this._compartments.findIndex((compartment) =>
      compartment.id.equals(id),
    );
    if (index < 0) {
      throw new DomainConflictException(
        "The compartment does not belong to this vehicle.",
        VEHICLE_ERROR_CODES.compartmentDoesNotBelongToThisVehicle,
      );
    }
    return index;
  }
}

function optionalDepotId(value: DepotId | undefined): DepotId | undefined {
  return value;
}

function createCompartments(
  compartmentDetails: readonly CompartmentProps[],
): Compartment[] {
  if (!Array.isArray(compartmentDetails)) {
    throw new DomainException(
      "Vehicle compartments must be specified as a list.",
      VEHICLE_ERROR_CODES.vehicleCompartmentsMustBeSpecifiedAsAList,
    );
  }

  const compartments = compartmentDetails.map(Compartment.create);
  assertVehicleHasCompartments(compartments);
  assertVehicleCompartmentLimit(compartments.length);
  return compartments;
}

function copyAndValidateCompartments(
  compartments: readonly Compartment[],
): Compartment[] {
  if (!Array.isArray(compartments)) {
    throw new DomainException(
      "Vehicle compartments must be specified as a list.",
      VEHICLE_ERROR_CODES.vehicleCompartmentsMustBeSpecifiedAsAList,
    );
  }

  if (
    compartments.some((compartment) => !(compartment instanceof Compartment))
  ) {
    throw new DomainException(
      "Vehicle compartments must be valid compartment entities.",
      VEHICLE_ERROR_CODES.vehicleCompartmentsMustBeValidCompartmentEntities,
    );
  }

  assertVehicleHasCompartments(compartments);
  assertVehicleCompartmentLimit(compartments.length);
  assertUniqueCompartmentIds(compartments);
  return [...compartments];
}

function assertVehicleHasCompartments(
  compartments: readonly Compartment[],
): void {
  if (compartments.length === 0) {
    throw new DomainException(
      "A vehicle must have at least one compartment.",
      VEHICLE_ERROR_CODES.vehicleMustHaveAtLeastOneCompartment,
    );
  }
}

function assertVehicleCompartmentLimit(count: number): void {
  if (count > MAX_VEHICLE_COMPARTMENTS) {
    throw new DomainException(
      `A vehicle cannot contain more than ${MAX_VEHICLE_COMPARTMENTS} compartments.`,
      VEHICLE_ERROR_CODES.compartmentLimitExceeded,
    );
  }
}

function assertUniqueCompartmentIds(
  compartments: readonly Compartment[],
): void {
  if (
    new Set(compartments.map((compartment) => compartment.id.value)).size !==
    compartments.length
  ) {
    throw new DomainException(
      "Vehicle compartment identifiers must be unique.",
      VEHICLE_ERROR_CODES.vehicleCompartmentIdentifiersMustBeUnique,
    );
  }
}

function requireVehicleStatus(value: unknown): VehicleStatus {
  if (!isEnumValue(VehicleStatus, value)) {
    throw new DomainException(
      "A vehicle status is invalid.",
      VEHICLE_ERROR_CODES.vehicleStatusIsInvalid,
    );
  }
  return value;
}
