import { RECOMMENDATION_ERROR_CODES } from "./recommendation-error-codes";
import { DomainException } from "../../../../../shared/domain/domain.exceptions";
import { ValueObject } from "../../../../../shared/domain/core/value-object";
import { requireNonNegativeFiniteNumber } from "../../../../../shared/domain/validation/primitives/number/require-non-negative-finite-number";
import { requireNonBlankString } from "../../../../../shared/domain/validation/primitives/string/require-non-blank-string";
import { Finding } from "./finding.entity";

export interface RecommendationAnalysisProps {
  readonly summary: string;
  readonly confidence: number;
  readonly findings: readonly Finding[];
}

/** AI-generated analysis of a Recommendation. */
export class RecommendationAnalysis extends ValueObject<RecommendationAnalysis> {
  readonly summary: string;
  readonly confidence: number;
  private readonly _findings: readonly Finding[];

  private constructor(props: RecommendationAnalysisProps) {
    super();
    this.summary = requireNonBlankString(
      props.summary,
      "Recommendation analysis summary",
    );
    this.confidence = requireNonNegativeFiniteNumber(
      props.confidence,
      "Recommendation analysis confidence",
    );
    if (this.confidence > 100) {
      throw new DomainException(
        "Recommendation analysis confidence cannot exceed 100.",
        RECOMMENDATION_ERROR_CODES.recommendationAnalysisConfidenceCannotExceed100,
      );
    }
    if (
      !Array.isArray(props.findings) ||
      !props.findings.every((finding) => finding instanceof Finding)
    ) {
      throw new DomainException(
        "Recommendation analysis findings are invalid.",
        RECOMMENDATION_ERROR_CODES.recommendationAnalysisFindingsAreInvalid,
      );
    }
    this._findings = [...props.findings];
    Object.freeze(this);
  }

  get findings(): readonly Finding[] {
    return [...this._findings];
  }

  static create(props: RecommendationAnalysisProps): RecommendationAnalysis {
    return new RecommendationAnalysis(props);
  }

  static reconstitute(
    props: RecommendationAnalysisProps,
  ): RecommendationAnalysis {
    return new RecommendationAnalysis(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.summary, this.confidence, this._findings];
  }
}
