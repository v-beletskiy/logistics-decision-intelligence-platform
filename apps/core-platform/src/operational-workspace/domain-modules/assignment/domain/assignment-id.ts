import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class AssignmentId extends UuidIdentifier<AssignmentId> {
  private constructor(value: unknown) {
    super(value, "Assignment identifier");
  }

  static generate(): AssignmentId {
    return new AssignmentId(randomUUIDv7());
  }

  static from(value: unknown): AssignmentId {
    return new AssignmentId(value);
  }
}
