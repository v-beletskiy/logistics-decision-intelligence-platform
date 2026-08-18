import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { RouteId } from "../../../../operational-workspace/domain-modules/route/domain/route-id";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import { ValueObject } from "../../../../shared/domain/shared-kernel/core/value-object";
import { requireFiniteNumber } from "../../../../shared/domain/shared-kernel/validation/primitives/number/require-finite-number";
import { RecommendationFact } from "../../../shared-domain/shared-kernel/entities/recommendation-fact.entity";
import { RecommendationType } from "../../../shared-domain/shared-kernel/enums/recommendation-type.enum";

export interface CandidateRecommendationProps {
  readonly routeId: RouteId;
  readonly type: RecommendationType;
  readonly facts: readonly RecommendationFact[];
  readonly score: number;
}

/** A transient deterministic optimization candidate produced during execution. */
export class CandidateRecommendation extends ValueObject<CandidateRecommendation> {
  readonly routeId: RouteId;
  readonly type: RecommendationType;
  readonly score: number;
  private readonly _facts: readonly RecommendationFact[];

  private constructor(props: CandidateRecommendationProps) {
    super();
    if (!(props.routeId instanceof RouteId)) {
      throw new DomainException(
        "A candidate recommendation route reference is invalid.",
      );
    }
    if (!isEnumValue(RecommendationType, props.type)) {
      throw new DomainException("A candidate recommendation type is invalid.");
    }
    if (
      !Array.isArray(props.facts) ||
      !props.facts.every((fact) => fact instanceof RecommendationFact)
    ) {
      throw new DomainException(
        "Candidate recommendation facts must be valid recommendation facts.",
      );
    }
    this.routeId = props.routeId;
    this.type = props.type;
    this._facts = [...props.facts];
    this.score = requireFiniteNumber(
      props.score,
      "Candidate recommendation score",
    );
    Object.freeze(this);
  }

  get facts(): readonly RecommendationFact[] {
    return [...this._facts];
  }

  static create(props: CandidateRecommendationProps): CandidateRecommendation {
    return new CandidateRecommendation(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.routeId, this.type, this._facts, this.score];
  }
}
