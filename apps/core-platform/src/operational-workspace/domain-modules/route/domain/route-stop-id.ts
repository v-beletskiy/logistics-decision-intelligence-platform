import { randomUUID } from "node:crypto";

import { UuidIdentifier } from "../../../../shared/domain/shared-kernel/core/uuid-identifier";

export class RouteStopId extends UuidIdentifier<RouteStopId> {
  private constructor(value: unknown) {
    super(value, "Route stop identifier");
  }

  static generate(): RouteStopId {
    return new RouteStopId(randomUUID());
  }

  static from(value: unknown): RouteStopId {
    return new RouteStopId(value);
  }
}
