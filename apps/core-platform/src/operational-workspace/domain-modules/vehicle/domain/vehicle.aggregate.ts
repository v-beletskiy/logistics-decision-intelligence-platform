import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { DomainException } from "../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import { optionalTrimmedString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/optional-trimmed-string";
import { requireNonBlankString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/require-non-blank-string";
import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import type { ChildChangeSet } from "../../../../shared/domain/shared-kernel/core/child-changes";
import { ChildCollection } from "../../../../shared/domain/shared-kernel/core/child-collection";

import { Compartment } from "./compartment.entity";
import type { CompartmentProps } from "./compartment.entity";
import { CompartmentId } from "./compartment-id";
import type { VehicleEvent } from "./events/vehicle.domain-events";
import { VehicleId } from "./vehicle-id";
import type { PersistencePlan } from "../../../../shared/domain/shared-kernel/core/persistence-plan";

export { Capacity } from "./capacity.value-object";
export type { CapacityProps } from "./capacity.value-object";
export { Compartment, CompartmentType } from "./compartment.entity";
export type { CompartmentProps } from "./compartment.entity";

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
  readonly depotId?: string;
}

/** Business properties required to register a Vehicle and its initial compartments. */
export interface RegisterVehicleDetails extends VehicleDetails {
  readonly compartments: readonly CompartmentProps[];
}

/** Complete persisted Vehicle state, excluding its identity. */
export interface VehicleProps {
  readonly registrationNumber: string;
  readonly name?: string;
  readonly depotId?: string;
  readonly compartments: readonly Compartment[];
  readonly status: VehicleStatus;
}

/** Persistence decisions derived from the aggregate state since it was loaded. */
export interface VehiclePersistencePlan extends PersistencePlan {
  readonly isNew: boolean;
  readonly compartments: ChildChangeSet<Compartment>;
}

/** A transportation asset used to execute assignments. */
export class Vehicle extends Aggregate<VehicleId, VehicleEvent> {
  private _registrationNumber: string;
  private _name?: string;
  private _depotId?: string;
  private _compartments: ChildCollection<Compartment>;
  private _status: VehicleStatus;

  private constructor(id: VehicleId, props: VehicleProps, isNew: boolean) {
    super(id, isNew);

    const validatedDetails = Vehicle.validateDetails(props);
    this._registrationNumber = validatedDetails.registrationNumber;
    this._name = validatedDetails.name;
    this._depotId = validatedDetails.depotId;

    const compartments = copyAndValidateCompartments(props.compartments);
    const status = requireVehicleStatus(props.status);

    this._compartments = new ChildCollection(
      (compartment) => compartment.id.value,
      compartments,
      isNew,
    );
    this._status = status;
  }

  get registrationNumber(): string {
    return this._registrationNumber;
  }

  get name(): string | undefined {
    return this._name;
  }

  get depotId(): string | undefined {
    return this._depotId;
  }

  get compartments(): readonly Compartment[] {
    return this._compartments.all();
  }

  get status(): VehicleStatus {
    return this._status;
  }

  /** Persistence decisions derived since load, for the repository to persist. */
  getPersistencePlan(): VehiclePersistencePlan {
    return {
      ...super.getPersistencePlan(),
      compartments: this._compartments.changes(),
    };
  }

  static register(details: RegisterVehicleDetails): Vehicle {
    const vehicle = new Vehicle(
      VehicleId.generate(),
      {
        ...details,
        compartments: createCompartments(details.compartments),
        status: VehicleStatus.Available,
      },
      true,
    );
    vehicle.raiseDomainEvent("VehicleRegisteredDomainEvent");
    return vehicle;
  }

  static reconstitute(id: VehicleId, props: VehicleProps): Vehicle {
    return new Vehicle(id, props, false);
  }

  private static validateDetails(details: VehicleDetails): VehicleDetails {
    return {
      registrationNumber: requireNonBlankString(
        details.registrationNumber,
        "Vehicle registration number",
      ),
      name: optionalTrimmedString(details.name, "Vehicle name"),
      depotId: optionalTrimmedString(
        details.depotId,
        "Vehicle depot identifier",
      ),
    };
  }

  updateDetails(details: VehicleDetails): void {
    this.assertNotDecommissioned();
    const validatedDetails = Vehicle.validateDetails(details);
    this._registrationNumber = validatedDetails.registrationNumber;
    this._name = validatedDetails.name;
    this._depotId = validatedDetails.depotId;
    this.raiseDomainEvent("VehicleDetailsUpdatedDomainEvent");
  }

  addCompartment(details: CompartmentProps): CompartmentId {
    this.assertNotDecommissioned();
    const compartment = Compartment.create(details);
    this._compartments.add(compartment);
    this.raiseDomainEvent("VehicleCompartmentAddedDomainEvent", {
      compartmentId: compartment.id.value,
    });
    return compartment.id;
  }

  updateCompartment(id: CompartmentId, details: CompartmentProps): void {
    this.assertNotDecommissioned();
    this._compartments.replace(id.value, Compartment.reconstitute(id, details));
    this.raiseDomainEvent("VehicleCompartmentUpdatedDomainEvent", {
      compartmentId: id.value,
    });
  }

  removeCompartment(id: CompartmentId): void {
    this.assertNotDecommissioned();
    if (this._compartments.length === 1) {
      throw new DomainException(
        "A vehicle must have at least one compartment.",
      );
    }
    this._compartments.remove(id.value);
    this.raiseDomainEvent("VehicleCompartmentRemovedDomainEvent", {
      compartmentId: id.value,
    });
  }

  markAvailable(): void {
    this.assertNotDecommissioned();
    if (this._status === VehicleStatus.Maintenance) {
      throw new DomainException(
        "A vehicle must be returned from maintenance before it can be available.",
      );
    }
    this._status = VehicleStatus.Available;
    this.raiseDomainEvent("VehicleMarkedAvailableDomainEvent");
  }

  markUnavailable(): void {
    this.assertNotDecommissioned();
    if (this._status === VehicleStatus.Maintenance) {
      throw new DomainException(
        "A vehicle in maintenance cannot be marked unavailable.",
      );
    }
    this._status = VehicleStatus.Unavailable;
    this.raiseDomainEvent("VehicleMarkedUnavailableDomainEvent");
  }

  sendToMaintenance(): void {
    this.assertNotDecommissioned();
    if (this._status === VehicleStatus.Maintenance) {
      throw new DomainException("A vehicle is already in maintenance.");
    }
    this._status = VehicleStatus.Maintenance;
    this.raiseDomainEvent("VehicleSentToMaintenanceDomainEvent");
  }

  returnFromMaintenance(): void {
    if (this._status !== VehicleStatus.Maintenance) {
      throw new DomainException(
        "Only a vehicle in maintenance can be returned from maintenance.",
      );
    }
    this._status = VehicleStatus.Available;
    this.raiseDomainEvent("VehicleReturnedFromMaintenanceDomainEvent");
  }

  decommission(): void {
    if (this._status === VehicleStatus.Decommissioned) {
      throw new DomainException("A vehicle is already decommissioned.");
    }
    this._status = VehicleStatus.Decommissioned;
    this.raiseDomainEvent("VehicleDecommissionedDomainEvent");
  }

  private assertNotDecommissioned(): void {
    if (this._status === VehicleStatus.Decommissioned) {
      throw new DomainException("A decommissioned vehicle cannot be changed.");
    }
  }

  private raiseDomainEvent(
    type: VehicleEvent["type"],
    details: Partial<VehicleEvent> = {},
  ): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
      ...details,
    } as VehicleEvent);
  }
}

function createCompartments(
  compartmentDetails: readonly CompartmentProps[],
): Compartment[] {
  if (!Array.isArray(compartmentDetails)) {
    throw new DomainException(
      "Vehicle compartments must be specified as a list.",
    );
  }

  const compartments = compartmentDetails.map(Compartment.create);
  assertVehicleHasCompartments(compartments);
  return compartments;
}

function copyAndValidateCompartments(
  compartments: readonly Compartment[],
): Compartment[] {
  if (!Array.isArray(compartments)) {
    throw new DomainException(
      "Vehicle compartments must be specified as a list.",
    );
  }

  if (
    compartments.some((compartment) => !(compartment instanceof Compartment))
  ) {
    throw new DomainException(
      "Vehicle compartments must be valid compartment entities.",
    );
  }

  assertVehicleHasCompartments(compartments);
  assertUniqueCompartmentIds(compartments);
  return [...compartments];
}

function assertVehicleHasCompartments(
  compartments: readonly Compartment[],
): void {
  if (compartments.length === 0) {
    throw new DomainException("A vehicle must have at least one compartment.");
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
    );
  }
}

function requireVehicleStatus(value: unknown): VehicleStatus {
  if (!isEnumValue(VehicleStatus, value)) {
    throw new DomainException("A vehicle status is invalid.");
  }
  return value;
}
