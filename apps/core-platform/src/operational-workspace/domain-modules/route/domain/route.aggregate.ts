import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import { requirePositiveInteger } from "../../../../shared/domain/shared-kernel/validation/primitives/number/require-positive-integer";

import type { RouteEvent } from "./events/route.domain-events";
import { RouteId } from "./route-id";

export enum RouteStatus {
  Draft = "DRAFT",
  Planned = "PLANNED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

export interface RouteDetails {
  readonly plannedStopCount: number;
}

export interface RouteProps extends RouteDetails {
  readonly status: RouteStatus;
  readonly nextPermittedStopSequence: number;
  readonly activeStopSequence?: number;
}

/** Owns route lifecycle and the strictly ordered progression through its stops. */
export class Route extends Aggregate<RouteId, RouteEvent> {
  private _status: RouteStatus;
  private readonly _plannedStopCount: number;
  private _nextPermittedStopSequence: number;
  private _activeStopSequence?: number;

  private constructor(id: RouteId, props: RouteProps) {
    super(id);
    if (!isEnumValue(RouteStatus, props.status)) {
      throw new DomainException("A route status is invalid.");
    }
    this._status = props.status;
    this._plannedStopCount = requirePositiveInteger(
      props.plannedStopCount,
      "Route planned stop count",
    );
    this._nextPermittedStopSequence = requirePositiveInteger(
      props.nextPermittedStopSequence,
      "Route next stop sequence",
    );
    this._activeStopSequence =
      props.activeStopSequence === undefined
        ? undefined
        : requirePositiveInteger(
            props.activeStopSequence,
            "Route active stop sequence",
          );
    this.assertProgressionIsValid();
  }

  get status(): RouteStatus {
    return this._status;
  }

  get plannedStopCount(): number {
    return this._plannedStopCount;
  }

  get nextPermittedStopSequence(): number {
    return this._nextPermittedStopSequence;
  }

  get activeStopSequence(): number | undefined {
    return this._activeStopSequence;
  }

  static create(details: RouteDetails): Route {
    const route = new Route(RouteId.generate(), {
      plannedStopCount: details.plannedStopCount,
      status: RouteStatus.Planned,
      nextPermittedStopSequence: 1,
    });
    route.raiseDomainEvent("RouteCreatedDomainEvent");
    return route;
  }

  static reconstitute(id: RouteId, props: RouteProps): Route {
    return new Route(id, props);
  }

  start(hasRunningAssignment: boolean): void {
    if (!hasRunningAssignment) {
      throw new DomainException(
        "A route requires a running assignment before it can start.",
      );
    }
    if (this._status !== RouteStatus.Planned) {
      throw new DomainException("Only a planned route can be started.");
    }
    this._status = RouteStatus.InProgress;
    this.raiseDomainEvent("RouteStartedDomainEvent");
  }

  startStop(sequence: number): void {
    this.assertCanExecuteStop(sequence);
    if (this._activeStopSequence !== undefined) {
      throw new DomainException("Another route stop is already active.");
    }
    this._activeStopSequence = sequence;
  }

  assertCanRecordStopArrival(sequence: number): void {
    this.assertCanExecuteStop(sequence);
    if (this._activeStopSequence !== sequence) {
      throw new DomainException("The route stop is not active.");
    }
  }

  completeStop(sequence: number): void {
    this.assertCanRecordStopArrival(sequence);
    this._activeStopSequence = undefined;
    this._nextPermittedStopSequence += 1;
  }

  complete(): void {
    if (this._status !== RouteStatus.InProgress) {
      throw new DomainException("Only an in-progress route can be completed.");
    }
    if (this._activeStopSequence !== undefined) {
      throw new DomainException(
        "The active route stop must be completed before the route.",
      );
    }
    if (this._nextPermittedStopSequence !== this._plannedStopCount + 1) {
      throw new DomainException(
        "All route stops must be completed before the route can be completed.",
      );
    }
    this._status = RouteStatus.Completed;
    this.raiseDomainEvent("RouteCompletedDomainEvent");
  }

  cancel(): void {
    if (this._status === RouteStatus.Completed) {
      throw new DomainException("A completed route cannot be cancelled.");
    }
    if (this._status === RouteStatus.Cancelled) {
      throw new DomainException("A cancelled route cannot be cancelled again.");
    }
    this._status = RouteStatus.Cancelled;
    this.raiseDomainEvent("RouteCancelledDomainEvent");
  }

  private assertCanExecuteStop(sequence: number): void {
    if (this._status !== RouteStatus.InProgress) {
      throw new DomainException(
        "Route stop execution requires an in-progress route.",
      );
    }
    if (sequence !== this._nextPermittedStopSequence) {
      throw new DomainException("Route stops must be executed in sequence.");
    }
  }

  private assertProgressionIsValid(): void {
    if (this._nextPermittedStopSequence > this._plannedStopCount + 1) {
      throw new DomainException("Route next stop sequence is invalid.");
    }
    if (
      this._activeStopSequence !== undefined &&
      this._activeStopSequence !== this._nextPermittedStopSequence
    ) {
      throw new DomainException("Route active stop sequence is invalid.");
    }
    if (
      this._status === RouteStatus.Completed &&
      (this._nextPermittedStopSequence !== this._plannedStopCount + 1 ||
        this._activeStopSequence !== undefined)
    ) {
      throw new DomainException("A completed route has invalid progression.");
    }
  }

  private raiseDomainEvent(type: RouteEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
    } satisfies RouteEvent);
  }
}
