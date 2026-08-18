import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { RouteId } from "../../../../operational-workspace/domain-modules/route/domain/route-id";
import { Aggregate } from "../../../../shared/domain/shared-kernel/core/aggregate";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import { requireFiniteNumber } from "../../../../shared/domain/shared-kernel/validation/primitives/number/require-finite-number";
import { OptimizationId } from "../../optimization/domain/optimization-id";
import { RecommendationType } from "../../../shared-domain/shared-kernel/enums/recommendation-type.enum";
import { RecommendationFact } from "../../../shared-domain/shared-kernel/entities/recommendation-fact.entity";
import type { RecommendationEvent } from "./events/recommendation.domain-events";
import { RecommendationAnalysis } from "./recommendation-analysis.value-object";
import { RecommendationId } from "./recommendation-id";
import { RecommendationStatus } from "./recommendation.enums";

export interface RecommendationDetails {
  readonly routeId: RouteId;
  readonly optimizationId: OptimizationId;
  readonly type: RecommendationType;
  readonly facts: readonly RecommendationFact[];
  readonly score: number;
}

export interface RecommendationProps extends RecommendationDetails {
  readonly status: RecommendationStatus;
  readonly analysis?: RecommendationAnalysis;
}

/** An actionable optimization outcome generated for a specific Route version. */
export class Recommendation extends Aggregate<
  RecommendationId,
  RecommendationEvent
> {
  private readonly _routeId: RouteId;
  private readonly _optimizationId: OptimizationId;
  private readonly _type: RecommendationType;
  private readonly _score: number;
  private _status: RecommendationStatus;
  private readonly _facts: readonly RecommendationFact[];
  private _analysis?: RecommendationAnalysis;

  private constructor(id: RecommendationId, props: RecommendationProps) {
    super(id);
    if (!(props.routeId instanceof RouteId)) {
      throw new DomainException("A recommendation route reference is invalid.");
    }
    if (!(props.optimizationId instanceof OptimizationId)) {
      throw new DomainException(
        "A recommendation optimization reference is invalid.",
      );
    }
    if (!isEnumValue(RecommendationType, props.type)) {
      throw new DomainException("A recommendation type is invalid.");
    }
    if (!isEnumValue(RecommendationStatus, props.status)) {
      throw new DomainException("A recommendation status is invalid.");
    }
    if (
      !Array.isArray(props.facts) ||
      !props.facts.every((fact) => fact instanceof RecommendationFact)
    ) {
      throw new DomainException(
        "Recommendation facts must be valid recommendation facts.",
      );
    }
    this._routeId = props.routeId;
    this._optimizationId = props.optimizationId;
    this._type = props.type;
    this._score = requireFiniteNumber(props.score, "Recommendation score");
    this._status = props.status;
    this._facts = [...props.facts];
    this._analysis = props.analysis;
  }

  get routeId(): RouteId {
    return this._routeId;
  }

  get optimizationId(): OptimizationId {
    return this._optimizationId;
  }

  get type(): RecommendationType {
    return this._type;
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

  static create(details: RecommendationDetails): Recommendation {
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
      throw new DomainException("A recommendation has already been accepted.");
    }
    if (this._status === RecommendationStatus.Rejected) {
      throw new DomainException(
        "A rejected recommendation cannot be accepted.",
      );
    }
    if (this._status === RecommendationStatus.Expired) {
      throw new DomainException(
        "An expired recommendation cannot be accepted.",
      );
    }
    this._status = RecommendationStatus.Accepted;
    this.raiseDomainEvent("RecommendationAcceptedDomainEvent");
  }

  reject(): void {
    if (this._status === RecommendationStatus.Accepted) {
      throw new DomainException(
        "An accepted recommendation cannot be rejected.",
      );
    }
    if (this._status === RecommendationStatus.Rejected) {
      throw new DomainException("A recommendation has already been rejected.");
    }
    this._status = RecommendationStatus.Rejected;
    this.raiseDomainEvent("RecommendationRejectedDomainEvent");
  }

  expire(): void {
    if (this._status !== RecommendationStatus.Pending) {
      throw new DomainException(
        "Only a pending recommendation can be expired.",
      );
    }
    this._status = RecommendationStatus.Expired;
    this.raiseDomainEvent("RecommendationExpiredDomainEvent");
  }

  attachAnalysis(analysis: RecommendationAnalysis): void {
    if (!(analysis instanceof RecommendationAnalysis)) {
      throw new DomainException("Recommendation analysis must be valid.");
    }
    if (this._status !== RecommendationStatus.Pending) {
      throw new DomainException(
        "Analysis can only be attached to a pending recommendation.",
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
