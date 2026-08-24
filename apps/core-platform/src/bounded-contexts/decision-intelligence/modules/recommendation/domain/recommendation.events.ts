import type { DomainEvent } from "../../../../../shared/domain/domain-event.js";

export interface RecommendationDomainEvent extends DomainEvent {}

export interface RecommendationCreatedDomainEvent extends RecommendationDomainEvent {
  readonly type: "RecommendationCreatedDomainEvent";
}

export interface RecommendationAcceptedDomainEvent extends RecommendationDomainEvent {
  readonly type: "RecommendationAcceptedDomainEvent";
}

export interface RecommendationRejectedDomainEvent extends RecommendationDomainEvent {
  readonly type: "RecommendationRejectedDomainEvent";
}

export interface RecommendationExpiredDomainEvent extends RecommendationDomainEvent {
  readonly type: "RecommendationExpiredDomainEvent";
}

export interface RecommendationAnalysisAttachedDomainEvent extends RecommendationDomainEvent {
  readonly type: "RecommendationAnalysisAttachedDomainEvent";
}

export type RecommendationEvent =
  | RecommendationCreatedDomainEvent
  | RecommendationAcceptedDomainEvent
  | RecommendationRejectedDomainEvent
  | RecommendationExpiredDomainEvent
  | RecommendationAnalysisAttachedDomainEvent;
