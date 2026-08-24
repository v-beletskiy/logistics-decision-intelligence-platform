import { RECOMMENDATION_ERROR_CODES } from "./recommendation-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import type { RouteReference } from "../../../domain/route-reference.js";
import { Aggregate } from "../../../../../shared/domain/core/aggregate.js";
import {
  DomainConflictException,
  DomainException,
} from "../../../../../shared/domain/domain.exceptions.js";
import { requireFiniteNumber } from "../../../../../shared/domain/validation/primitives/number/require-finite-number.js";
import { requireUuid } from "../../../../../shared/domain/validation/primitives/uuid/require-uuid.js";
import { OptimizationId } from "../../optimization/domain/optimization-id.js";
import { RecommendationType } from "../../../domain/recommendation-type.enum.js";
import { RecommendationFact } from "../../../domain/recommendation-fact.entity.js";
import type { RecommendationEvent } from "./recommendation.events.js";
import { RecommendationAnalysis } from "./recommendation-analysis.value-object.js";
import { RecommendationId } from "./recommendation-id.js";
import {
  RecommendationAnalysisStatus,
  RecommendationStatus,
} from "./recommendation.enums.js";
import { ProposedRoutePlan } from "./proposed-route-plan.value-object.js";

export interface CreateRecommendationParams {
  readonly routeId: RouteReference;
  readonly optimizationId: OptimizationId;
  readonly type: RecommendationType;
  readonly proposedRoutePlan: ProposedRoutePlan;
  readonly facts: readonly RecommendationFact[];
  readonly score: number;
}

export interface RecommendationProps {
  readonly routeId: RouteReference;
  readonly optimizationId: OptimizationId;
  readonly type: RecommendationType;
  readonly proposedRoutePlan?: ProposedRoutePlan;
  readonly facts: readonly RecommendationFact[];
  readonly score: number;
  readonly status: RecommendationStatus;
  readonly analysisRequestEventId?: string;
  readonly analysisStatus: RecommendationAnalysisStatus;
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
  private _analysisRequestEventId?: string;
  private _analysisStatus: RecommendationAnalysisStatus;
  private _analysis?: RecommendationAnalysis;
  private readonly _facts: readonly RecommendationFact[];

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
    this._analysisRequestEventId =
      props.analysisRequestEventId === undefined
        ? undefined
        : requireUuid(
            props.analysisRequestEventId,
            "Recommendation analysis request event ID",
          );
    this._analysisStatus = props.analysisStatus;
    if (!isEnumValue(RecommendationAnalysisStatus, this._analysisStatus)) {
      throw new DomainException(
        "A recommendation analysis status is invalid.",
        RECOMMENDATION_ERROR_CODES.recommendationAnalysisStatusIsInvalid,
      );
    }
    this._facts = [...props.facts];
    this._analysis = props.analysis;
    assertAnalysisLifecycleIsValid(
      this._analysisStatus,
      this._analysisRequestEventId,
      this._analysis,
    );
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

  get analysisRequestEventId(): string | undefined {
    return this._analysisRequestEventId;
  }

  get analysisStatus(): RecommendationAnalysisStatus {
    return this._analysisStatus;
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
      analysisStatus: RecommendationAnalysisStatus.Pending,
    });
    recommendation.raiseDomainEvent("RecommendationCreatedDomainEvent");
    return recommendation;
  }

  static reconstitute(
    id: RecommendationId,
    props: RecommendationProps,
  ): Recommendation {
    if (props.analysisRequestEventId === undefined) {
      throw new DomainException(
        "A persisted recommendation analysis requires its request event ID.",
        RECOMMENDATION_ERROR_CODES.recommendationAnalysisLifecycleIsInvalid,
      );
    }
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

  requestAnalysis(requestEventId: string): void {
    if (
      this._analysisStatus !== RecommendationAnalysisStatus.Pending ||
      this._analysisRequestEventId !== undefined
    ) {
      throw new DomainConflictException(
        "Recommendation analysis has already been requested.",
        RECOMMENDATION_ERROR_CODES.recommendationAnalysisRequestAlreadyExists,
      );
    }
    this._analysisRequestEventId = requireUuid(
      requestEventId,
      "Recommendation analysis request event ID",
    );
  }

  attachAnalysis(
    requestEventId: string,
    analysis: RecommendationAnalysis,
  ): boolean {
    if (!(analysis instanceof RecommendationAnalysis)) {
      throw new DomainException(
        "Recommendation analysis must be valid.",
        RECOMMENDATION_ERROR_CODES.recommendationAnalysisMustBeValid,
      );
    }
    const normalizedRequestEventId = requireUuid(
      requestEventId,
      "Recommendation analysis request event ID",
    );
    if (
      this._analysisStatus === RecommendationAnalysisStatus.Completed &&
      this._analysisRequestEventId === normalizedRequestEventId
    ) {
      return false;
    }
    if (this._status !== RecommendationStatus.Pending) {
      throw new DomainConflictException(
        "Analysis can only be attached to a pending recommendation.",
        RECOMMENDATION_ERROR_CODES.analysisCanOnlyBeAttachedToAPendingRecommendation,
      );
    }
    if (
      this._analysisStatus !== RecommendationAnalysisStatus.Pending ||
      this._analysisRequestEventId !== normalizedRequestEventId
    ) {
      throw new DomainConflictException(
        "Recommendation analysis completion does not match its request.",
        RECOMMENDATION_ERROR_CODES.recommendationAnalysisRequestDoesNotMatch,
      );
    }
    this._analysis = analysis;
    this._analysisStatus = RecommendationAnalysisStatus.Completed;
    this.raiseDomainEvent("RecommendationAnalysisAttachedDomainEvent");
    return true;
  }

  private raiseDomainEvent(type: RecommendationEvent["type"]): void {
    this.recordDomainEvent({
      aggregateId: this.id.value,
      occurredAt: new Date(),
      type,
    } satisfies RecommendationEvent);
  }
}

function assertAnalysisLifecycleIsValid(
  status: RecommendationAnalysisStatus,
  requestEventId: string | undefined,
  analysis: RecommendationAnalysis | undefined,
): void {
  const isValidPending =
    status === RecommendationAnalysisStatus.Pending && analysis === undefined;
  const isValidCompleted =
    status === RecommendationAnalysisStatus.Completed &&
    requestEventId !== undefined &&
    analysis !== undefined;
  if (!isValidPending && !isValidCompleted) {
    throw new DomainException(
      "The recommendation analysis lifecycle state is invalid.",
      RECOMMENDATION_ERROR_CODES.recommendationAnalysisLifecycleIsInvalid,
    );
  }
}
