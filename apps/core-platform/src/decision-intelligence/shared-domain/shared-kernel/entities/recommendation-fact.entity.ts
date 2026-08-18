import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Entity } from "../../../../shared/domain/shared-kernel/core/entity";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import { requireFiniteNumber } from "../../../../shared/domain/shared-kernel/validation/primitives/number/require-finite-number";
import { MeasurementUnit } from "../enums/measurement-unit.enum";
import { RecommendationMetric } from "../enums/recommendation-metric.enum";
import { RecommendationFactId } from "./recommendation-fact-id";

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
      throw new DomainException("A recommendation fact metric is invalid.");
    }
    if (!isEnumValue(MeasurementUnit, props.unit)) {
      throw new DomainException("A recommendation fact unit is invalid.");
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
