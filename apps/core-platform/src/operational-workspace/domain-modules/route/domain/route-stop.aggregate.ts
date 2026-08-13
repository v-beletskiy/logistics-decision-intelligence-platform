import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import { DomainException } from "../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import { requirePositiveInteger } from "../../../../shared/domain/shared-kernel/validation/primitives/number/require-positive-integer";

import { ShipmentId } from "../../shipment/domain/shipment-id";
import type { RouteStopEvent } from "./events/route-stop.domain-events";
import { RouteId } from "./route-id";
import { RouteStopId } from "./route-stop-id";

export enum RouteStopStatus {
  Planned = "PLANNED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

export enum RouteStopOperationType {
  Pickup = "PICKUP",
  Delivery = "DELIVERY",
}

export interface RouteStopDetails {
  readonly shipmentId: ShipmentId;
  readonly operationType: RouteStopOperationType;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}

export interface CreateRouteStopDetails extends RouteStopDetails {
  readonly routeId: RouteId;
  readonly sequence: number;
}

export interface RouteStopProps extends CreateRouteStopDetails {
  readonly status: RouteStopStatus;
  readonly actualArrivalAt?: Date;
  readonly actualDepartureAt?: Date;
}

/** The independently executable pickup or delivery stop of a Route. */
export class RouteStop extends Aggregate<RouteStopId, RouteStopEvent> {
  readonly routeId: RouteId;
  readonly shipmentId: ShipmentId;
  readonly sequence: number;
  readonly operationType: RouteStopOperationType;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
  private _actualArrivalAt?: Date;
  private _actualDepartureAt?: Date;
  private _status: RouteStopStatus;

  private constructor(id: RouteStopId, props: RouteStopProps) {
    super(id);
    this.routeId = requireRouteId(props.routeId);
    this.shipmentId = requireShipmentId(props.shipmentId);
    this.sequence = requirePositiveInteger(
      props.sequence,
      "Route stop sequence",
    );
    if (!isEnumValue(RouteStopOperationType, props.operationType)) {
      throw new DomainException(
        "A valid route stop operation type must be specified.",
      );
    }
    if (!isEnumValue(RouteStopStatus, props.status)) {
      throw new DomainException("A route stop status is invalid.");
    }
    this.operationType = props.operationType;
    this._status = props.status;
    this.plannedArrivalAt = requireDate(
      props.plannedArrivalAt,
      "Route stop planned arrival",
    );
    this.plannedDepartureAt = requireDate(
      props.plannedDepartureAt,
      "Route stop planned departure",
    );
    this._actualArrivalAt = optionalDate(
      props.actualArrivalAt,
      "Route stop actual arrival",
    );
    this._actualDepartureAt = optionalDate(
      props.actualDepartureAt,
      "Route stop actual departure",
    );
    this.assertTimelineIsValid();
  }

  get status(): RouteStopStatus {
    return this._status;
  }

  get actualArrivalAt(): Date | undefined {
    return this._actualArrivalAt;
  }

  get actualDepartureAt(): Date | undefined {
    return this._actualDepartureAt;
  }

  static create(details: CreateRouteStopDetails): RouteStop {
    return new RouteStop(RouteStopId.generate(), {
      ...details,
      status: RouteStopStatus.Planned,
    });
  }

  static reconstitute(id: RouteStopId, props: RouteStopProps): RouteStop {
    return new RouteStop(id, props);
  }

  recordArrival(at: Date): void {
    if (this._status !== RouteStopStatus.Planned) {
      throw new DomainException(
        "Arrival can only be recorded for a planned route stop.",
      );
    }
    this._actualArrivalAt = requireDate(at, "Route stop actual arrival");
    this._status = RouteStopStatus.InProgress;
    this.raiseDomainEvent("RouteStopArrivedDomainEvent");
  }

  recordDeparture(at: Date): void {
    if (this._status !== RouteStopStatus.InProgress) {
      throw new DomainException(
        "Departure can only be recorded for an in-progress route stop.",
      );
    }
    const departure = requireDate(at, "Route stop actual departure");
    if (!this._actualArrivalAt || departure < this._actualArrivalAt) {
      throw new DomainException("Route stop departure cannot precede arrival.");
    }
    this._actualDepartureAt = departure;
    this._status = RouteStopStatus.Completed;
    this.raiseDomainEvent("RouteStopDepartedDomainEvent");
  }

  cancel(): void {
    if (this._status === RouteStopStatus.Completed) {
      throw new DomainException("A completed route stop cannot be cancelled.");
    }
    if (this._status === RouteStopStatus.Cancelled) {
      throw new DomainException(
        "A cancelled route stop cannot be cancelled again.",
      );
    }
    this._status = RouteStopStatus.Cancelled;
    this.raiseDomainEvent("RouteStopCancelledDomainEvent");
  }

  private assertTimelineIsValid(): void {
    if (this.plannedDepartureAt < this.plannedArrivalAt) {
      throw new DomainException(
        "Route stop planned departure cannot precede arrival.",
      );
    }
    if (
      this._actualDepartureAt !== undefined &&
      (this._actualArrivalAt === undefined ||
        this._actualDepartureAt < this._actualArrivalAt)
    ) {
      throw new DomainException(
        "Route stop actual departure cannot precede arrival.",
      );
    }
    if (
      this._status === RouteStopStatus.Planned &&
      (this._actualArrivalAt !== undefined ||
        this._actualDepartureAt !== undefined)
    ) {
      throw new DomainException(
        "A planned route stop cannot have execution times.",
      );
    }
    if (
      this._status === RouteStopStatus.InProgress &&
      this._actualArrivalAt === undefined
    ) {
      throw new DomainException(
        "An in-progress route stop requires an arrival time.",
      );
    }
    if (
      this._status === RouteStopStatus.Completed &&
      (this._actualArrivalAt === undefined ||
        this._actualDepartureAt === undefined)
    ) {
      throw new DomainException(
        "A completed route stop requires arrival and departure times.",
      );
    }
  }

  private raiseDomainEvent(type: RouteStopEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
      routeId: this.routeId.value,
    } satisfies RouteStopEvent);
  }
}

function requireRouteId(value: unknown): RouteId {
  if (!(value instanceof RouteId)) {
    throw new DomainException("A route stop must reference a route.");
  }
  return value;
}

function requireShipmentId(value: unknown): ShipmentId {
  if (!(value instanceof ShipmentId)) {
    throw new DomainException("A route stop must reference a shipment.");
  }
  return value;
}

function requireDate(value: unknown, label: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new DomainException(`${label} must be a valid date.`);
  }
  return value;
}

function optionalDate(value: unknown, label: string): Date | undefined {
  if (value === undefined) return undefined;
  return requireDate(value, label);
}
