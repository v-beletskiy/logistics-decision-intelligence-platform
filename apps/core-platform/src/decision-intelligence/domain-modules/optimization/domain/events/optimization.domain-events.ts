import type { DomainEvent } from "../../../../../shared/domain/shared-kernel/events/domain-event";

export interface OptimizationDomainEvent extends DomainEvent {}

export interface OptimizationQueuedDomainEvent extends OptimizationDomainEvent {
  readonly type: "OptimizationQueuedDomainEvent";
}

export interface OptimizationStartedDomainEvent extends OptimizationDomainEvent {
  readonly type: "OptimizationStartedDomainEvent";
}

export interface OptimizationCompletedDomainEvent extends OptimizationDomainEvent {
  readonly type: "OptimizationCompletedDomainEvent";
}

export interface OptimizationCancelledDomainEvent extends OptimizationDomainEvent {
  readonly type: "OptimizationCancelledDomainEvent";
}

export interface OptimizationFailedDomainEvent extends OptimizationDomainEvent {
  readonly type: "OptimizationFailedDomainEvent";
}

export type OptimizationEvent =
  | OptimizationQueuedDomainEvent
  | OptimizationStartedDomainEvent
  | OptimizationCompletedDomainEvent
  | OptimizationCancelledDomainEvent
  | OptimizationFailedDomainEvent;
