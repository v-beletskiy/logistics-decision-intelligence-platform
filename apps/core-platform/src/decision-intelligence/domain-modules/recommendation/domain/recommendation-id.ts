import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class RecommendationId extends UuidIdentifier<RecommendationId> {
  private constructor(value: unknown) {
    super(value, "Recommendation identifier");
  }

  static generate(): RecommendationId {
    return new RecommendationId(randomUUIDv7());
  }

  static from(value: unknown): RecommendationId {
    return new RecommendationId(value);
  }
}
