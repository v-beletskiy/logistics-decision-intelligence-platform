import { isEnumValue } from "@logistics-decision-intelligence/validation";

import {
  Schedule,
  type ScheduleProps,
} from "../../../../shared/domain/shared-kernel/value-objects/time";
import { DomainException } from "../../../../shared/domain/shared-kernel/exceptions/domain.exception";
import { requireNonBlankString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/require-non-blank-string";
import { Entity } from "../../../../shared/domain/shared-kernel/core/entity";
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

/** Business properties used to create a route stop. */
export interface RouteStopDetails {
  readonly shipmentId: string;
  readonly operationType: RouteStopOperationType;
  readonly schedule: ScheduleProps;
}

/** Complete route-stop state, excluding only the route-stop identity. */
export interface RouteStopProps extends RouteStopDetails {
  readonly status: RouteStopStatus;
}

/** Immutable read model of a route stop, safe to expose outside the aggregate. */
export interface RouteStopSnapshot {
  readonly id: string;
  readonly shipmentId: string;
  readonly operationType: RouteStopOperationType;
  readonly status: RouteStopStatus;
  readonly schedule: Schedule;
}

export class RouteStop extends Entity<RouteStopId> {
  readonly shipmentId: string;
  readonly operationType: RouteStopOperationType;
  private readonly _schedule: Schedule;
  private _status: RouteStopStatus;

  private constructor(id: RouteStopId, props: RouteStopProps) {
    super(id);
    const shipmentId = requireNonBlankString(
      props.shipmentId,
      "A route stop shipment",
    );
    const schedule = Schedule.create(props.schedule);
    if (!isEnumValue(RouteStopOperationType, props.operationType)) {
      throw new DomainException(
        "A valid route stop operation type must be specified.",
      );
    }
    if (!isEnumValue(RouteStopStatus, props.status)) {
      throw new DomainException("A route stop status is invalid.");
    }
    this.shipmentId = shipmentId;
    this.operationType = props.operationType;
    this._schedule = schedule;
    this._status = props.status;
  }

  get schedule(): Schedule {
    return this._schedule;
  }

  get status(): RouteStopStatus {
    return this._status;
  }

  static create(details: RouteStopDetails): RouteStop {
    return new RouteStop(RouteStopId.generate(), {
      ...details,
      status: RouteStopStatus.Planned,
    });
  }

  static reconstitute(id: RouteStopId, props: RouteStopProps): RouteStop {
    return new RouteStop(id, props);
  }

  start(): void {
    if (this._status !== RouteStopStatus.Planned) {
      throw new DomainException("Only a planned route stop can be started.");
    }
    this._status = RouteStopStatus.InProgress;
  }

  complete(): void {
    if (this._status !== RouteStopStatus.InProgress) {
      throw new DomainException(
        "Only an in-progress route stop can be completed.",
      );
    }
    this._status = RouteStopStatus.Completed;
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
  }

  toSnapshot(): RouteStopSnapshot {
    return {
      id: this.id.value,
      shipmentId: this.shipmentId,
      operationType: this.operationType,
      status: this.status,
      schedule: this.schedule,
    };
  }
}
