import { UuidIdentifier } from "../../../shared/domain/core/uuid-identifier";

/** Decision Intelligence's local reference to an Operational Workspace route. */
export class RouteReference extends UuidIdentifier<RouteReference> {
  private constructor(value: unknown) {
    super(value, "Route reference");
  }

  static from(value: unknown): RouteReference {
    return new RouteReference(value);
  }
}
