import { ROUTE_ERROR_CODES } from "./route-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../../shared/domain/core/aggregate.js";
import {
  DomainConflictException,
  DomainException,
} from "../../../../../shared/domain/domain.exceptions.js";
import { optionalValidDate } from "../../../../../shared/domain/validation/primitives/date/optional-valid-date.js";
import { requireValidDate } from "../../../../../shared/domain/validation/primitives/date/require-valid-date.js";
import { requirePositiveSafeInteger } from "../../../../../shared/domain/validation/primitives/number/require-positive-safe-integer.js";

import { ShipmentId } from "../../shipment/domain/shipment-id.js";
import type { RouteStopEvent } from "./route-stop.events.js";
import { RouteId } from "./route-id.js";
import { RouteStopId } from "./route-stop-id.js";

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

export interface RouteStopPlan {
  readonly shipmentId: ShipmentId;
  readonly operationType: RouteStopOperationType;
  readonly plannedArrivalAt: Date;
  readonly plannedDepartureAt: Date;
}

export interface CreateRouteStopParams extends RouteStopPlan {
  readonly routeId: RouteId;
  readonly sequence: number;
}

export interface RouteStopProps extends CreateRouteStopParams {
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
  private readonly _plannedArrivalAt: Date;
  private readonly _plannedDepartureAt: Date;
  private _actualArrivalAt?: Date;
  private _actualDepartureAt?: Date;
  private _status: RouteStopStatus;

  private constructor(id: RouteStopId, props: RouteStopProps) {
    super(id);
    this.routeId = props.routeId;
    this.shipmentId = props.shipmentId;
    this.sequence = requirePositiveSafeInteger(
      props.sequence,
      "Route stop sequence",
    );
    if (!isEnumValue(RouteStopOperationType, props.operationType)) {
      throw new DomainException(
        "A valid route stop operation type must be specified.",
        ROUTE_ERROR_CODES.validRouteStopOperationTypeMustBeSpecified,
      );
    }
    if (!isEnumValue(RouteStopStatus, props.status)) {
      throw new DomainException(
        "A route stop status is invalid.",
        ROUTE_ERROR_CODES.routeStopStatusIsInvalid,
      );
    }
    this.operationType = props.operationType;
    this._status = props.status;
    this._plannedArrivalAt = requireValidDate(
      props.plannedArrivalAt,
      "Route stop planned arrival",
    );
    this._plannedDepartureAt = requireValidDate(
      props.plannedDepartureAt,
      "Route stop planned departure",
    );
    this._actualArrivalAt = optionalValidDate(
      props.actualArrivalAt,
      "Route stop actual arrival",
    );
    this._actualDepartureAt = optionalValidDate(
      props.actualDepartureAt,
      "Route stop actual departure",
    );
    this.assertTimelineIsValid();
  }

  get status(): RouteStopStatus {
    return this._status;
  }

  get plannedArrivalAt(): Date {
    return new Date(this._plannedArrivalAt);
  }

  get plannedDepartureAt(): Date {
    return new Date(this._plannedDepartureAt);
  }

  get actualArrivalAt(): Date | undefined {
    return this._actualArrivalAt && new Date(this._actualArrivalAt);
  }

  get actualDepartureAt(): Date | undefined {
    return this._actualDepartureAt && new Date(this._actualDepartureAt);
  }

  static create(details: CreateRouteStopParams): RouteStop {
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
      throw new DomainConflictException(
        "Arrival can only be recorded for a planned route stop.",
        ROUTE_ERROR_CODES.arrivalCanOnlyBeRecordedForAPlannedRouteStop,
      );
    }
    this._actualArrivalAt = requireValidDate(at, "Route stop actual arrival");
    this._status = RouteStopStatus.InProgress;
    this.raiseDomainEvent("RouteStopArrivedDomainEvent");
  }

  recordDeparture(at: Date): void {
    if (this._status !== RouteStopStatus.InProgress) {
      throw new DomainConflictException(
        "Departure can only be recorded for an in-progress route stop.",
        ROUTE_ERROR_CODES.departureCanOnlyBeRecordedForAnInProgressRouteStop,
      );
    }
    const departure = requireValidDate(at, "Route stop actual departure");
    if (!this._actualArrivalAt || departure < this._actualArrivalAt) {
      throw new DomainException(
        "Route stop departure cannot precede arrival.",
        ROUTE_ERROR_CODES.routeStopDepartureCannotPrecedeArrival,
      );
    }
    this._actualDepartureAt = departure;
    this._status = RouteStopStatus.Completed;
    this.raiseDomainEvent("RouteStopDepartedDomainEvent");
  }

  cancel(): void {
    if (this._status === RouteStopStatus.Completed) {
      throw new DomainConflictException(
        "A completed route stop cannot be cancelled.",
        ROUTE_ERROR_CODES.completedRouteStopCannotBeCancelled,
      );
    }
    if (this._status === RouteStopStatus.Cancelled) {
      throw new DomainConflictException(
        "A cancelled route stop cannot be cancelled again.",
        ROUTE_ERROR_CODES.cancelledRouteStopCannotBeCancelledAgain,
      );
    }
    this._status = RouteStopStatus.Cancelled;
    this.raiseDomainEvent("RouteStopCancelledDomainEvent");
  }

  private assertTimelineIsValid(): void {
    if (this._plannedDepartureAt < this._plannedArrivalAt) {
      throw new DomainException(
        "Route stop planned departure cannot precede arrival.",
        ROUTE_ERROR_CODES.routeStopPlannedDepartureCannotPrecedeArrival,
      );
    }
    if (
      this._actualDepartureAt !== undefined &&
      (this._actualArrivalAt === undefined ||
        this._actualDepartureAt < this._actualArrivalAt)
    ) {
      throw new DomainException(
        "Route stop actual departure cannot precede arrival.",
        ROUTE_ERROR_CODES.routeStopActualDepartureCannotPrecedeArrival,
      );
    }
    if (
      this._status === RouteStopStatus.Planned &&
      (this._actualArrivalAt !== undefined ||
        this._actualDepartureAt !== undefined)
    ) {
      throw new DomainException(
        "A planned route stop cannot have execution times.",
        ROUTE_ERROR_CODES.plannedRouteStopCannotHaveExecutionTimes,
      );
    }
    if (
      this._status === RouteStopStatus.InProgress &&
      this._actualArrivalAt === undefined
    ) {
      throw new DomainException(
        "An in-progress route stop requires an arrival time.",
        ROUTE_ERROR_CODES.inProgressRouteStopRequiresAnArrivalTime,
      );
    }
    if (
      this._status === RouteStopStatus.Completed &&
      (this._actualArrivalAt === undefined ||
        this._actualDepartureAt === undefined)
    ) {
      throw new DomainException(
        "A completed route stop requires arrival and departure times.",
        ROUTE_ERROR_CODES.completedRouteStopRequiresArrivalAndDepartureTimes,
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
