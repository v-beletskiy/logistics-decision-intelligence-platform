import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class OptimizationId extends UuidIdentifier<OptimizationId> {
  private constructor(value: unknown) {
    super(value, "Optimization identifier");
  }

  static generate(): OptimizationId {
    return new OptimizationId(randomUUIDv7());
  }

  static from(value: unknown): OptimizationId {
    return new OptimizationId(value);
  }
}
