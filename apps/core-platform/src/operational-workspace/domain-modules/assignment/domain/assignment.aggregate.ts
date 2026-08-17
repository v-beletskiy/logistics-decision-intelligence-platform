import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";

import { AssignmentId } from "./assignment-id";
import { AssignmentShipment } from "./assignment-shipment.entity";
import type { AssignmentEvent } from "./events/assignment.domain-events";
import { DriverId } from "../../driver/domain/driver-id";
import { RouteId } from "../../route/domain/route-id";
import { VehicleId } from "../../vehicle/domain/vehicle-id";

export enum AssignmentStatus {
  Created = "CREATED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

/** Resource allocation intended when an assignment is created. */
export interface AssignmentAllocation {
  readonly routeId: RouteId;
  readonly vehicleId: VehicleId;
  readonly driverId: DriverId;
  readonly shipments: readonly AssignmentShipment[];
}

/** Complete persisted Assignment state, excluding its identity. */
export interface AssignmentProps extends AssignmentAllocation {
  readonly status: AssignmentStatus;
  readonly assignedAt: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly cancelledAt?: Date;
}

export const MAX_ASSIGNMENT_SHIPMENTS = 20;

/** A work order binding a set of shipments to a route, vehicle and driver. */
export class Assignment extends Aggregate<AssignmentId, AssignmentEvent> {
  private _routeId: RouteId;
  private _vehicleId: VehicleId;
  private _driverId: DriverId;
  private readonly _shipments: AssignmentShipment[];
  private _status: AssignmentStatus;
  private _assignedAt: Date;
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _cancelledAt?: Date;

  private constructor(
    id: AssignmentId,
    props: AssignmentProps,
  ) {
    super(id);

    this._routeId = requireAssignmentReference(props.routeId, RouteId, "route");
    this._vehicleId = requireAssignmentReference(
      props.vehicleId,
      VehicleId,
      "vehicle",
    );
    this._driverId = requireAssignmentReference(
      props.driverId,
      DriverId,
      "driver",
    );
    this._status = requireAssignmentStatus(props.status);
    this._assignedAt = props.assignedAt;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._cancelledAt = props.cancelledAt;

    this._shipments = copyAndValidateShipments(props.shipments);
  }

  get routeId(): RouteId {
    return this._routeId;
  }

  get vehicleId(): VehicleId {
    return this._vehicleId;
  }

  get driverId(): DriverId {
    return this._driverId;
  }

  get shipments(): readonly AssignmentShipment[] {
    return [...this._shipments];
  }

  get status(): AssignmentStatus {
    return this._status;
  }

  /** Whether the assignment is still executable, i.e. not yet finished. */
  get isActive(): boolean {
    return (
      this._status === AssignmentStatus.Created ||
      this._status === AssignmentStatus.InProgress
    );
  }

  get assignedAt(): Date {
    return this._assignedAt;
  }

  get startedAt(): Date | undefined {
    return this._startedAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get cancelledAt(): Date | undefined {
    return this._cancelledAt;
  }

  static create(allocation: AssignmentAllocation): Assignment {
    const assignment = new Assignment(
      AssignmentId.generate(),
      {
        ...allocation,
        status: AssignmentStatus.Created,
        assignedAt: new Date(),
      },
    );
    assignment.raiseDomainEvent("AssignmentCreatedDomainEvent");
    return assignment;
  }

  static reconstitute(id: AssignmentId, props: AssignmentProps): Assignment {
    return new Assignment(id, props);
  }

  assignVehicle(vehicleId: VehicleId): void {
    this.assertNotStarted();
    const nextVehicleId = requireAssignmentReference(
      vehicleId,
      VehicleId,
      "vehicle",
    );
    if (this._vehicleId.equals(nextVehicleId)) return;
    this._vehicleId = nextVehicleId;
    this.raiseDomainEvent("VehicleReassignedDomainEvent");
  }

  assignDriver(driverId: DriverId): void {
    this.assertNotStarted();
    const nextDriverId = requireAssignmentReference(
      driverId,
      DriverId,
      "driver",
    );
    if (this._driverId.equals(nextDriverId)) return;
    this._driverId = nextDriverId;
    this.raiseDomainEvent("DriverReassignedDomainEvent");
  }

  start(): void {
    this.assertMutable();
    if (this._status !== AssignmentStatus.Created) {
      throw new DomainException("Only a created assignment can be started.");
    }
    this._status = AssignmentStatus.InProgress;
    this._startedAt = new Date();
    this.raiseDomainEvent("AssignmentStartedDomainEvent");
  }

  complete(): void {
    if (this._status !== AssignmentStatus.InProgress) {
      throw new DomainException(
        "Only an in-progress assignment can be completed.",
      );
    }
    this._status = AssignmentStatus.Completed;
    this._completedAt = new Date();
    this.raiseDomainEvent("AssignmentCompletedDomainEvent");
  }

  cancel(): void {
    if (this._status === AssignmentStatus.Completed) {
      throw new DomainException("A completed assignment cannot be cancelled.");
    }
    if (this._status === AssignmentStatus.Cancelled) {
      throw new DomainException("The assignment is already cancelled.");
    }
    this._status = AssignmentStatus.Cancelled;
    this._cancelledAt = new Date();
    this.raiseDomainEvent("AssignmentCancelledDomainEvent");
  }

  private assertMutable(): void {
    if (this._status === AssignmentStatus.Cancelled) {
      throw new DomainException("A cancelled assignment cannot be modified.");
    }
    if (this._status === AssignmentStatus.Completed) {
      throw new DomainException("A completed assignment cannot be modified.");
    }
  }

  private assertNotStarted(): void {
    this.assertMutable();
    if (this._status === AssignmentStatus.InProgress) {
      throw new DomainException("A started assignment cannot be reassigned.");
    }
  }

  private raiseDomainEvent(type: AssignmentEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
    } satisfies AssignmentEvent);
  }
}

function copyAndValidateShipments(
  shipments: readonly AssignmentShipment[],
): AssignmentShipment[] {
  if (!Array.isArray(shipments)) {
    throw new DomainException(
      "Assignment shipments must be specified as a list.",
    );
  }
  if (shipments.some((shipment) => !(shipment instanceof AssignmentShipment))) {
    throw new DomainException(
      "Assignment shipments must be valid assignment-shipment entities.",
    );
  }
  if (shipments.length === 0) {
    throw new DomainException(
      "An assignment must contain at least one shipment.",
    );
  }
  if (shipments.length > MAX_ASSIGNMENT_SHIPMENTS) {
    throw new DomainException(
      `An assignment cannot contain more than ${MAX_ASSIGNMENT_SHIPMENTS} shipments.`,
    );
  }
  assertUniqueShipmentReferences(shipments);
  return [...shipments];
}

function assertUniqueShipmentReferences(
  shipments: readonly AssignmentShipment[],
): void {
  const shipmentIds = shipments.map((shipment) => shipment.shipmentId.value);
  if (new Set(shipmentIds).size !== shipmentIds.length) {
    throw new DomainException(
      "An assignment cannot bind the same shipment more than once.",
    );
  }
}

function requireAssignmentReference<T>(
  value: unknown,
  reference: { readonly prototype: T },
  label: string,
): T {
  if (!(value instanceof (reference as { new (): T }))) {
    throw new DomainException(`An assignment must reference a ${label}.`);
  }
  return value;
}

function requireAssignmentStatus(value: unknown): AssignmentStatus {
  if (!isEnumValue(AssignmentStatus, value)) {
    throw new DomainException("An assignment status is invalid.");
  }
  return value;
}
