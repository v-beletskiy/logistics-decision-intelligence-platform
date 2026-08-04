import { randomUUID } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class RouteId extends UuidIdentifier<RouteId> {
  private constructor(value: unknown) {
    super(value, "Route identifier");
  }

  static generate(): RouteId {
    return new RouteId(randomUUID());
  }

  static from(value: unknown): RouteId {
    return new RouteId(value);
  }
}
