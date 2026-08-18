import { isEnumValue } from "@logistics-decision-intelligence/validation";

import { Entity } from "../../../../shared/domain/shared-kernel/core/entity";
import { DomainException } from "../../../../shared/domain/shared-kernel/domain.exceptions";
import { requireNonBlankString } from "../../../../shared/domain/shared-kernel/validation/primitives/string/require-non-blank-string";
import { FindingId } from "./finding-id";
import { FindingCategory } from "./recommendation.enums";

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
      throw new DomainException("A finding category is invalid.");
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