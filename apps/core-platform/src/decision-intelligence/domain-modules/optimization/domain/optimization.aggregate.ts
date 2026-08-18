import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { RouteId } from "../../../../operational-workspace/domain-modules/route/domain/route-id";
import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import { requirePositiveInteger } from "../../../../shared/domain/shared-kernel/validation/primitives/number/require-positive-integer";
import type { OptimizationEvent } from "./events/optimization.domain-events";
import { OptimizationId } from "./optimization-id";

export enum OptimizationStatus {
  Queued = "QUEUED",
  Running = "RUNNING",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
  Failed = "FAILED",
}

export interface OptimizationDetails {
  readonly routeId: RouteId;
}

export interface OptimizationProps extends OptimizationDetails {
  readonly status: OptimizationStatus;
  readonly inputVersion?: number;
}

/** Executes an optimization process for a specific Route. */
export class Optimization extends Aggregate<OptimizationId, OptimizationEvent> {
  private readonly _routeId: RouteId;
  private _status: OptimizationStatus;
  private _inputVersion?: number;

  private constructor(id: OptimizationId, props: OptimizationProps) {
    super(id);
    if (!(props.routeId instanceof RouteId)) {
      throw new DomainException("An optimization route reference is invalid.");
    }
    if (!isEnumValue(OptimizationStatus, props.status)) {
      throw new DomainException("An optimization status is invalid.");
    }
    this._routeId = props.routeId;
    this._status = props.status;
    this._inputVersion =
      props.inputVersion === undefined
        ? undefined
        : requirePositiveInteger(
            props.inputVersion,
            "Optimization input version",
          );
  }

  get routeId(): RouteId {
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

  static queue(details: OptimizationDetails): Optimization {
    const optimization = new Optimization(OptimizationId.generate(), {
      routeId: details.routeId,
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
      throw new DomainException("Only a queued optimization can be started.");
    }
    this._inputVersion = requirePositiveInteger(
      inputVersion,
      "Optimization input version",
    );
    this._status = OptimizationStatus.Running;
    this.raiseDomainEvent("OptimizationStartedDomainEvent");
  }

  complete(): void {
    if (this._status !== OptimizationStatus.Running) {
      throw new DomainException(
        "Only a running optimization can be completed.",
      );
    }
    this._status = OptimizationStatus.Completed;
    this.raiseDomainEvent("OptimizationCompletedDomainEvent");
  }

  cancel(): void {
    if (this._status === OptimizationStatus.Completed) {
      throw new DomainException(
        "A completed optimization cannot be cancelled.",
      );
    }
    if (this._status === OptimizationStatus.Cancelled) {
      throw new DomainException(
        "A cancelled optimization cannot be cancelled again.",
      );
    }
    if (this._status === OptimizationStatus.Failed) {
      throw new DomainException("A failed optimization cannot be cancelled.");
    }
    this._status = OptimizationStatus.Cancelled;
    this.raiseDomainEvent("OptimizationCancelledDomainEvent");
  }

  fail(): void {
    if (this._status === OptimizationStatus.Completed) {
      throw new DomainException("A completed optimization cannot be failed.");
    }
    if (this._status === OptimizationStatus.Cancelled) {
      throw new DomainException("A cancelled optimization cannot be failed.");
    }
    if (this._status === OptimizationStatus.Failed) {
      throw new DomainException(
        "A failed optimization cannot be failed again.",
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
