import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class RecommendationFactId extends UuidIdentifier<RecommendationFactId> {
  private constructor(value: unknown) {
    super(value, "Recommendation fact identifier");
  }

  static generate(): RecommendationFactId {
    return new RecommendationFactId(randomUUIDv7());
  }

  static from(value: unknown): RecommendationFactId {
    return new RecommendationFactId(value);
  }
}