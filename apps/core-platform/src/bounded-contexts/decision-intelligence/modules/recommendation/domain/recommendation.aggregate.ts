import { RECOMMENDATION_ERROR_CODES } from "./recommendation-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import type { RouteReference } from "../../../domain/route-reference.js";
import { Aggregate } from "../../../../../shared/domain/core/aggregate.js";
import {
  DomainConflictException,
  DomainException,
} from "../../../../../shared/domain/domain.exceptions.js";
import { requireFiniteNumber } from "../../../../../shared/domain/validation/primitives/number/require-finite-number.js";
import { OptimizationId } from "../../optimization/domain/optimization-id.js";
import { RecommendationType } from "../../../domain/recommendation-type.enum.js";
import { RecommendationFact } from "../../../domain/recommendation-fact.entity.js";
import type { RecommendationEvent } from "./recommendation.events.js";
import { RecommendationAnalysis } from "./recommendation-analysis.value-object.js";
import { RecommendationId } from "./recommendation-id.js";
import { RecommendationStatus } from "./recommendation.enums.js";
import { ProposedRoutePlan } from "./proposed-route-plan.value-object.js";

export interface CreateRecommendationParams {
  readonly routeId: RouteReference;
  readonly optimizationId: OptimizationId;
  readonly type: RecommendationType;
  readonly proposedRoutePlan: ProposedRoutePlan;
  readonly facts: readonly RecommendationFact[];
  readonly score: number;
}

export interface RecommendationProps
  extends Omit<
    CreateRecommendationParams,
    "proposedRoutePlan"
  > {
  readonly proposedRoutePlan?: ProposedRoutePlan;
  readonly status: RecommendationStatus;
  readonly analysis?: RecommendationAnalysis;
}

/** An actionable optimization outcome generated for a specific Route version. */
export class Recommendation extends Aggregate<
  RecommendationId,
  RecommendationEvent
> {
  private readonly _routeId: RouteReference;
  private readonly _optimizationId: OptimizationId;
  private readonly _type: RecommendationType;
  private readonly _proposedRoutePlan?: ProposedRoutePlan;
  private readonly _score: number;
  private _status: RecommendationStatus;
  private readonly _facts: readonly RecommendationFact[];
  private _analysis?: RecommendationAnalysis;

  private constructor(id: RecommendationId, props: RecommendationProps) {
    super(id);
    if (!isEnumValue(RecommendationType, props.type)) {
      throw new DomainException(
        "A recommendation type is invalid.",
        RECOMMENDATION_ERROR_CODES.recommendationTypeIsInvalid,
      );
    }
    if (!isEnumValue(RecommendationStatus, props.status)) {
      throw new DomainException(
        "A recommendation status is invalid.",
        RECOMMENDATION_ERROR_CODES.recommendationStatusIsInvalid,
      );
    }
    if (
      !Array.isArray(props.facts) ||
      !props.facts.every((fact) => fact instanceof RecommendationFact)
    ) {
      throw new DomainException(
        "Recommendation facts must be valid recommendation facts.",
        RECOMMENDATION_ERROR_CODES.recommendationFactsMustBeValidRecommendationFacts,
      );
    }
    this._routeId = props.routeId;
    this._optimizationId = props.optimizationId;
    this._type = props.type;
    this._proposedRoutePlan = props.proposedRoutePlan;
    this._score = requireFiniteNumber(props.score, "Recommendation score");
    this._status = props.status;
    this._facts = [...props.facts];
    this._analysis = props.analysis;
  }

  get routeId(): RouteReference {
    return this._routeId;
  }

  get optimizationId(): OptimizationId {
    return this._optimizationId;
  }

  get type(): RecommendationType {
    return this._type;
  }

  get proposedRoutePlan(): ProposedRoutePlan | undefined {
    return this._proposedRoutePlan;
  }

  get score(): number {
    return this._score;
  }

  get status(): RecommendationStatus {
    return this._status;
  }

  get facts(): readonly RecommendationFact[] {
    return [...this._facts];
  }

  get analysis(): RecommendationAnalysis | undefined {
    return this._analysis;
  }

  static create(details: CreateRecommendationParams): Recommendation {
    if (!(details.proposedRoutePlan instanceof ProposedRoutePlan)) {
      throw new DomainException(
        "An optimize route plan recommendation requires a valid proposed route plan.",
        RECOMMENDATION_ERROR_CODES.optimizeRoutePlanRecommendationRequiresAProposedRoutePlan,
      );
    }
    const recommendation = new Recommendation(RecommendationId.generate(), {
      ...details,
      status: RecommendationStatus.Pending,
    });
    recommendation.raiseDomainEvent("RecommendationCreatedDomainEvent");
    return recommendation;
  }

  static reconstitute(
    id: RecommendationId,
    props: RecommendationProps,
  ): Recommendation {
    return new Recommendation(id, props);
  }

  accept(): void {
    if (this._status === RecommendationStatus.Accepted) {
      throw new DomainConflictException(
        "A recommendation has already been accepted.",
        RECOMMENDATION_ERROR_CODES.recommendationHasAlreadyBeenAccepted,
      );
    }
    if (this._status === RecommendationStatus.Rejected) {
      throw new DomainConflictException(
        "A rejected recommendation cannot be accepted.",
        RECOMMENDATION_ERROR_CODES.rejectedRecommendationCannotBeAccepted,
      );
    }
    if (this._status === RecommendationStatus.Expired) {
      throw new DomainConflictException(
        "An expired recommendation cannot be accepted.",
        RECOMMENDATION_ERROR_CODES.expiredRecommendationCannotBeAccepted,
      );
    }
    this._status = RecommendationStatus.Accepted;
    this.raiseDomainEvent("RecommendationAcceptedDomainEvent");
  }

  reject(): void {
    if (this._status === RecommendationStatus.Accepted) {
      throw new DomainConflictException(
        "An accepted recommendation cannot be rejected.",
        RECOMMENDATION_ERROR_CODES.acceptedRecommendationCannotBeRejected,
      );
    }
    if (this._status === RecommendationStatus.Rejected) {
      throw new DomainConflictException(
        "A recommendation has already been rejected.",
        RECOMMENDATION_ERROR_CODES.recommendationHasAlreadyBeenRejected,
      );
    }
    this._status = RecommendationStatus.Rejected;
    this.raiseDomainEvent("RecommendationRejectedDomainEvent");
  }

  expire(): void {
    if (this._status !== RecommendationStatus.Pending) {
      throw new DomainConflictException(
        "Only a pending recommendation can be expired.",
        RECOMMENDATION_ERROR_CODES.onlyAPendingRecommendationCanBeExpired,
      );
    }
    this._status = RecommendationStatus.Expired;
    this.raiseDomainEvent("RecommendationExpiredDomainEvent");
  }

  attachAnalysis(analysis: RecommendationAnalysis): void {
    if (!(analysis instanceof RecommendationAnalysis)) {
      throw new DomainException(
        "Recommendation analysis must be valid.",
        RECOMMENDATION_ERROR_CODES.recommendationAnalysisMustBeValid,
      );
    }
    if (this._status !== RecommendationStatus.Pending) {
      throw new DomainConflictException(
        "Analysis can only be attached to a pending recommendation.",
        RECOMMENDATION_ERROR_CODES.analysisCanOnlyBeAttachedToAPendingRecommendation,
      );
    }
    this._analysis = analysis;
    this.raiseDomainEvent("RecommendationAnalysisAttachedDomainEvent");
  }

  private raiseDomainEvent(type: RecommendationEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
    } satisfies RecommendationEvent);
  }
}
