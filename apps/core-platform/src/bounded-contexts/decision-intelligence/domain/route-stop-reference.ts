import { UuidIdentifier } from "../../../shared/domain/core/uuid-identifier.js";

/** Decision Intelligence's local reference to an Operational Workspace route stop. */
export class RouteStopReference extends UuidIdentifier<RouteStopReference> {
  private constructor(value: unknown) {
    super(value, "Route stop reference");
  }

  static from(value: unknown): RouteStopReference {
    return new RouteStopReference(value);
  }
}
