import { RECOMMENDATION_ERROR_CODES } from "./recommendation-error-codes.js";
import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Entity } from "../../../../../shared/domain/core/entity.js";
import { DomainException } from "../../../../../shared/domain/domain.exceptions.js";
import { requireNonBlankString } from "../../../../../shared/domain/validation/primitives/string/require-non-blank-string.js";
import { FindingId } from "./finding-id.js";
import { FindingCategory } from "./recommendation.enums.js";

export interface FindingProps {
  readonly category: FindingCategory;
  readonly title: string;
  readonly description: string;
}

/** A single AI finding about a Recommendation. */
export class Finding extends Entity<FindingId> {
  readonly category: FindingCategory;
  readonly title: string;
  readonly description: string;

  private constructor(id: FindingId, props: FindingProps) {
    super(id);
    if (!isEnumValue(FindingCategory, props.category)) {
      throw new DomainException(
        "A finding category is invalid.",
        RECOMMENDATION_ERROR_CODES.findingCategoryIsInvalid,
      );
    }
    this.category = props.category;
    this.title = requireNonBlankString(props.title, "Finding title");
    this.description = requireNonBlankString(
      props.description,
      "Finding description",
    );
    Object.freeze(this);
  }

  static create(props: FindingProps): Finding {
    return new Finding(FindingId.generate(), props);
  }

  static reconstitute(id: FindingId, props: FindingProps): Finding {
    return new Finding(id, props);
  }
}
