import { RouteStopReference } from "../../../domain/route-stop-reference.js";
import { ValueObject } from "../../../../../shared/domain/core/value-object.js";
import { DomainException } from "../../../../../shared/domain/domain.exceptions.js";

import { RECOMMENDATION_ERROR_CODES } from "./recommendation-error-codes.js";

export interface ProposedRoutePlanProps {
  readonly orderedRouteStopIds: readonly RouteStopReference[];
}

/** The complete ordered route-stop plan proposed by a recommendation. */
export class ProposedRoutePlan extends ValueObject<ProposedRoutePlan> {
  private readonly _orderedRouteStopIds: readonly RouteStopReference[];

  private constructor(props: ProposedRoutePlanProps) {
    super();
    if (
      !Array.isArray(props.orderedRouteStopIds) ||
      props.orderedRouteStopIds.length < 2 ||
      !props.orderedRouteStopIds.every(
        (routeStopId) => routeStopId instanceof RouteStopReference,
      )
    ) {
      throw new DomainException(
        "A proposed route plan must contain at least two valid route stops.",
        RECOMMENDATION_ERROR_CODES.proposedRoutePlanIsInvalid,
      );
    }
    const ids = props.orderedRouteStopIds.map((routeStopId) => routeStopId.value);
    if (new Set(ids).size !== ids.length) {
      throw new DomainException(
        "A proposed route plan cannot contain the same route stop more than once.",
        RECOMMENDATION_ERROR_CODES.proposedRoutePlanHasDuplicateRouteStops,
      );
    }
    this._orderedRouteStopIds = [...props.orderedRouteStopIds];
    Object.freeze(this);
  }

  get orderedRouteStopIds(): readonly RouteStopReference[] {
    return [...this._orderedRouteStopIds];
  }

  static create(props: ProposedRoutePlanProps): ProposedRoutePlan {
    return new ProposedRoutePlan(props);
  }

  static reconstitute(props: ProposedRoutePlanProps): ProposedRoutePlan {
    return new ProposedRoutePlan(props);
  }

  protected equalityComponents(): readonly unknown[] {
    return this._orderedRouteStopIds;
  }
}
