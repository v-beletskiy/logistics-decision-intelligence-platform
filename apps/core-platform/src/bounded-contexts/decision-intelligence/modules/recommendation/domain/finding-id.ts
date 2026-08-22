import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../../shared/domain/core/uuid-identifier";

export class FindingId extends UuidIdentifier<FindingId> {
  private constructor(value: unknown) {
    super(value, "Finding identifier");
  }

  static generate(): FindingId {
    return new FindingId(randomUUIDv7());
  }

  static from(value: unknown): FindingId {
    return new FindingId(value);
  }
}
