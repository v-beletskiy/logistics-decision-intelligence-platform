import { ROUTE_ERROR_CODES } from "./route-error-codes";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Aggregate } from "../../../../../shared/domain/core/aggregate";
import {
  DomainConflictException,
  DomainException,
} from "../../../../../shared/domain/domain.exceptions";
import { requirePositiveSafeInteger } from "../../../../../shared/domain/validation/primitives/number/require-positive-safe-integer";

import type { RouteEvent } from "./route.events";
import { RouteId } from "./route-id";

export enum RouteStatus {
  Draft = "DRAFT",
  Planned = "PLANNED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

export interface CreateRouteParams {
  readonly plannedStopCount: number;
}

export interface RouteProps extends CreateRouteParams {
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
      throw new DomainException(
        "A route status is invalid.",
        ROUTE_ERROR_CODES.routeStatusIsInvalid,
      );
    }
    this._status = props.status;
    this._plannedStopCount = requirePositiveSafeInteger(
      props.plannedStopCount,
      "Route planned stop count",
    );
    this._nextPermittedStopSequence = requirePositiveSafeInteger(
      props.nextPermittedStopSequence,
      "Route next stop sequence",
    );
    this._activeStopSequence =
      props.activeStopSequence === undefined
        ? undefined
        : requirePositiveSafeInteger(
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

  static create(details: CreateRouteParams): Route {
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
      throw new DomainConflictException(
        "A route requires a running assignment before it can start.",
        ROUTE_ERROR_CODES.routeRequiresARunningAssignmentBeforeItCanStart,
      );
    }
    if (this._status !== RouteStatus.Planned) {
      throw new DomainConflictException(
        "Only a planned route can be started.",
        ROUTE_ERROR_CODES.onlyAPlannedRouteCanBeStarted,
      );
    }
    this._status = RouteStatus.InProgress;
    this.raiseDomainEvent("RouteStartedDomainEvent");
  }

  startStop(sequence: number): void {
    this.assertCanExecuteStop(sequence);
    if (this._activeStopSequence !== undefined) {
      throw new DomainConflictException(
        "Another route stop is already active.",
        ROUTE_ERROR_CODES.anotherRouteStopIsAlreadyActive,
      );
    }
    this._activeStopSequence = sequence;
  }

  assertCanRecordStopArrival(sequence: number): void {
    this.assertCanExecuteStop(sequence);
    if (this._activeStopSequence !== sequence) {
      throw new DomainConflictException(
        "The route stop is not active.",
        ROUTE_ERROR_CODES.routeStopIsNotActive,
      );
    }
  }

  completeStop(sequence: number): void {
    this.assertCanRecordStopArrival(sequence);
    this._activeStopSequence = undefined;
    this._nextPermittedStopSequence += 1;
  }

  complete(): void {
    if (this._status !== RouteStatus.InProgress) {
      throw new DomainConflictException(
        "Only an in-progress route can be completed.",
        ROUTE_ERROR_CODES.onlyAnInProgressRouteCanBeCompleted,
      );
    }
    if (this._activeStopSequence !== undefined) {
      throw new DomainConflictException(
        "The active route stop must be completed before the route.",
        ROUTE_ERROR_CODES.activeRouteStopMustBeCompletedBeforeTheRoute,
      );
    }
    if (this._nextPermittedStopSequence !== this._plannedStopCount + 1) {
      throw new DomainConflictException(
        "All route stops must be completed before the route can be completed.",
        ROUTE_ERROR_CODES.allRouteStopsMustBeCompletedBeforeTheRouteCanBeCompleted,
      );
    }
    this._status = RouteStatus.Completed;
    this.raiseDomainEvent("RouteCompletedDomainEvent");
  }

  cancel(): void {
    if (this._status === RouteStatus.Completed) {
      throw new DomainConflictException(
        "A completed route cannot be cancelled.",
        ROUTE_ERROR_CODES.completedRouteCannotBeCancelled,
      );
    }
    if (this._status === RouteStatus.Cancelled) {
      throw new DomainConflictException(
        "A cancelled route cannot be cancelled again.",
        ROUTE_ERROR_CODES.cancelledRouteCannotBeCancelledAgain,
      );
    }
    this._status = RouteStatus.Cancelled;
    this.raiseDomainEvent("RouteCancelledDomainEvent");
  }

  private assertCanExecuteStop(sequence: number): void {
    if (this._status !== RouteStatus.InProgress) {
      throw new DomainConflictException(
        "Route stop execution requires an in-progress route.",
        ROUTE_ERROR_CODES.routeStopExecutionRequiresAnInProgressRoute,
      );
    }
    if (sequence !== this._nextPermittedStopSequence) {
      throw new DomainException(
        "Route stops must be executed in sequence.",
        ROUTE_ERROR_CODES.routeStopsMustBeExecutedInSequence,
      );
    }
  }

  private assertProgressionIsValid(): void {
    if (this._nextPermittedStopSequence > this._plannedStopCount + 1) {
      throw new DomainException(
        "Route next stop sequence is invalid.",
        ROUTE_ERROR_CODES.routeNextStopSequenceIsInvalid,
      );
    }
    if (
      this._activeStopSequence !== undefined &&
      this._activeStopSequence !== this._nextPermittedStopSequence
    ) {
      throw new DomainException(
        "Route active stop sequence is invalid.",
        ROUTE_ERROR_CODES.routeActiveStopSequenceIsInvalid,
      );
    }
    if (
      this._status === RouteStatus.Completed &&
      (this._nextPermittedStopSequence !== this._plannedStopCount + 1 ||
        this._activeStopSequence !== undefined)
    ) {
      throw new DomainException(
        "A completed route has invalid progression.",
        ROUTE_ERROR_CODES.completedRouteHasInvalidProgression,
      );
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
