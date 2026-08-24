import { DECISION_INTELLIGENCE_ERROR_CODES } from "./decision-intelligence-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Entity } from "../../../shared/domain/core/entity.js";
import { DomainException } from "../../../shared/domain/domain.exceptions.js";
import { requireFiniteNumber } from "../../../shared/domain/validation/primitives/number/require-finite-number.js";
import { MeasurementUnit } from "./measurement-unit.enum.js";
import { RecommendationMetric } from "./recommendation-metric.enum.js";
import { RecommendationFactId } from "./recommendation-fact-id.js";

export interface RecommendationFactProps {
  readonly metric: RecommendationMetric;
  readonly baselineValue: number;
  readonly recommendedValue: number;
  readonly unit: MeasurementUnit;
  readonly improvement: number;
}

/** A measurable deterministic optimization result compared to the baseline operational plan. */
export class RecommendationFact extends Entity<RecommendationFactId> {
  readonly metric: RecommendationMetric;
  readonly baselineValue: number;
  readonly recommendedValue: number;
  readonly unit: MeasurementUnit;
  readonly improvement: number;

  private constructor(
    id: RecommendationFactId,
    props: RecommendationFactProps,
  ) {
    super(id);
    if (!isEnumValue(RecommendationMetric, props.metric)) {
      throw new DomainException(
        "A recommendation fact metric is invalid.",
        DECISION_INTELLIGENCE_ERROR_CODES.recommendationFactMetricIsInvalid,
      );
    }
    if (!isEnumValue(MeasurementUnit, props.unit)) {
      throw new DomainException(
        "A recommendation fact unit is invalid.",
        DECISION_INTELLIGENCE_ERROR_CODES.recommendationFactUnitIsInvalid,
      );
    }
    this.metric = props.metric;
    this.baselineValue = requireFiniteNumber(
      props.baselineValue,
      "Recommendation fact baseline value",
    );
    this.recommendedValue = requireFiniteNumber(
      props.recommendedValue,
      "Recommendation fact recommended value",
    );
    this.unit = props.unit;
    this.improvement = requireFiniteNumber(
      props.improvement,
      "Recommendation fact improvement",
    );
    Object.freeze(this);
  }

  static create(props: RecommendationFactProps): RecommendationFact {
    return new RecommendationFact(RecommendationFactId.generate(), props);
  }

  static reconstitute(
    id: RecommendationFactId,
    props: RecommendationFactProps,
  ): RecommendationFact {
    return new RecommendationFact(id, props);
  }
}
