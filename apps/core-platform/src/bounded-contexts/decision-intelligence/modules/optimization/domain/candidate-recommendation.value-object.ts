import { OPTIMIZATION_ERROR_CODES } from "./optimization-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import type { RouteReference } from "../../../domain/route-reference.js";
import { DomainException } from "../../../../../shared/domain/domain.exceptions.js";
import { ValueObject } from "../../../../../shared/domain/core/value-object.js";
import { requireFiniteNumber } from "../../../../../shared/domain/validation/primitives/number/require-finite-number.js";
import { RecommendationFact } from "../../../domain/recommendation-fact.entity.js";
import { RecommendationType } from "../../../domain/recommendation-type.enum.js";

export interface CandidateRecommendationProps {
  readonly routeId: RouteReference;
  readonly type: RecommendationType;
  readonly facts: readonly RecommendationFact[];
  readonly score: number;
}

/** A transient deterministic optimization candidate produced during execution. */
export class CandidateRecommendation extends ValueObject<CandidateRecommendation> {
  readonly routeId: RouteReference;
  readonly type: RecommendationType;
  readonly score: number;
  private readonly _facts: readonly RecommendationFact[];

  private constructor(props: CandidateRecommendationProps) {
    super();
    if (!isEnumValue(RecommendationType, props.type)) {
      throw new DomainException(
        "A candidate recommendation type is invalid.",
        OPTIMIZATION_ERROR_CODES.candidateRecommendationTypeIsInvalid,
      );
    }
    if (
      !Array.isArray(props.facts) ||
      !props.facts.every((fact) => fact instanceof RecommendationFact)
    ) {
      throw new DomainException(
        "Candidate recommendation facts must be valid recommendation facts.",
        OPTIMIZATION_ERROR_CODES.candidateRecommendationFactsMustBeValidRecommendationFacts,
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
