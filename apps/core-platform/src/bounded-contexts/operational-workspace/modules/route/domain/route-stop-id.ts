import { randomUUIDv7 } from "node:crypto";

import { UuidIdentifier } from "../../../../../shared/domain/core/uuid-identifier.js";

export class RouteStopId extends UuidIdentifier<RouteStopId> {
  private constructor(value: unknown) {
    super(value, "Route stop identifier");
  }

  static generate(): RouteStopId {
    return new RouteStopId(randomUUIDv7());
  }

  static from(value: unknown): RouteStopId {
    return new RouteStopId(value);
  }
}
