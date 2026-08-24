import { OPTIMIZATION_ERROR_CODES } from "./optimization-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import type { RouteReference } from "../../../domain/route-reference.js";
import { Aggregate } from "../../../../../shared/domain/core/aggregate.js";
import {
  DomainConflictException,
  DomainException,
} from "../../../../../shared/domain/domain.exceptions.js";
import { requirePositiveSafeInteger } from "../../../../../shared/domain/validation/primitives/number/require-positive-safe-integer.js";
import type { OptimizationEvent } from "./optimization.events.js";
import { OptimizationId } from "./optimization-id.js";

export enum OptimizationStatus {
  Queued = "QUEUED",
  Running = "RUNNING",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
  Failed = "FAILED",
}

export interface QueueOptimizationParams {
  readonly routeId: RouteReference;
  readonly inputVersion: number;
}

export interface OptimizationProps {
  readonly routeId: RouteReference;
  readonly status: OptimizationStatus;
  readonly inputVersion?: number;
}

/** Executes an optimization process for a specific Route. */
export class Optimization extends Aggregate<OptimizationId, OptimizationEvent> {
  private readonly _routeId: RouteReference;
  private _status: OptimizationStatus;
  private _inputVersion?: number;

  private constructor(id: OptimizationId, props: OptimizationProps) {
    super(id);
    if (!isEnumValue(OptimizationStatus, props.status)) {
      throw new DomainException(
        "An optimization status is invalid.",
        OPTIMIZATION_ERROR_CODES.optimizationStatusIsInvalid,
      );
    }
    this._routeId = props.routeId;
    this._status = props.status;
    this._inputVersion =
      props.inputVersion === undefined
        ? undefined
        : requirePositiveSafeInteger(
            props.inputVersion,
            "Optimization input version",
          );
  }

  get routeId(): RouteReference {
    return this._routeId;
  }

  get status(): OptimizationStatus {
    return this._status;
  }

  get inputVersion(): number | undefined {
    return this._inputVersion;
  }

  isActive(): boolean {
    return (
      this._status === OptimizationStatus.Queued ||
      this._status === OptimizationStatus.Running
    );
  }

  static queue(details: QueueOptimizationParams): Optimization {
    const optimization = new Optimization(OptimizationId.generate(), {
      routeId: details.routeId,
      inputVersion: details.inputVersion,
      status: OptimizationStatus.Queued,
    });
    optimization.raiseDomainEvent("OptimizationQueuedDomainEvent");
    return optimization;
  }

  static reconstitute(
    id: OptimizationId,
    props: OptimizationProps,
  ): Optimization {
    return new Optimization(id, props);
  }

  start(inputVersion: number): void {
    if (this._status !== OptimizationStatus.Queued) {
      throw new DomainConflictException(
        "Only a queued optimization can be started.",
        OPTIMIZATION_ERROR_CODES.onlyAQueuedOptimizationCanBeStarted,
      );
    }
    this._inputVersion = requirePositiveSafeInteger(
      inputVersion,
      "Optimization input version",
    );
    this._status = OptimizationStatus.Running;
    this.raiseDomainEvent("OptimizationStartedDomainEvent");
  }

  complete(): void {
    if (this._status !== OptimizationStatus.Running) {
      throw new DomainConflictException(
        "Only a running optimization can be completed.",
        OPTIMIZATION_ERROR_CODES.onlyARunningOptimizationCanBeCompleted,
      );
    }
    this._status = OptimizationStatus.Completed;
    this.raiseDomainEvent("OptimizationCompletedDomainEvent");
  }

  cancel(): void {
    if (this._status === OptimizationStatus.Completed) {
      throw new DomainConflictException(
        "A completed optimization cannot be cancelled.",
        OPTIMIZATION_ERROR_CODES.completedOptimizationCannotBeCancelled,
      );
    }
    if (this._status === OptimizationStatus.Cancelled) {
      throw new DomainConflictException(
        "A cancelled optimization cannot be cancelled again.",
        OPTIMIZATION_ERROR_CODES.cancelledOptimizationCannotBeCancelledAgain,
      );
    }
    if (this._status === OptimizationStatus.Failed) {
      throw new DomainConflictException(
        "A failed optimization cannot be cancelled.",
        OPTIMIZATION_ERROR_CODES.failedOptimizationCannotBeCancelled,
      );
    }
    this._status = OptimizationStatus.Cancelled;
    this.raiseDomainEvent("OptimizationCancelledDomainEvent");
  }

  fail(): void {
    if (this._status === OptimizationStatus.Completed) {
      throw new DomainConflictException(
        "A completed optimization cannot be failed.",
        OPTIMIZATION_ERROR_CODES.completedOptimizationCannotBeFailed,
      );
    }
    if (this._status === OptimizationStatus.Cancelled) {
      throw new DomainConflictException(
        "A cancelled optimization cannot be failed.",
        OPTIMIZATION_ERROR_CODES.cancelledOptimizationCannotBeFailed,
      );
    }
    if (this._status === OptimizationStatus.Failed) {
      throw new DomainConflictException(
        "A failed optimization cannot be failed again.",
        OPTIMIZATION_ERROR_CODES.failedOptimizationCannotBeFailedAgain,
      );
    }
    this._status = OptimizationStatus.Failed;
    this.raiseDomainEvent("OptimizationFailedDomainEvent");
  }

  private raiseDomainEvent(type: OptimizationEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
    } satisfies OptimizationEvent);
  }
}
