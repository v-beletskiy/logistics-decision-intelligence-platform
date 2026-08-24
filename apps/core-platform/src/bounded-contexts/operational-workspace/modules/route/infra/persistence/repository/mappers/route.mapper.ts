import { hydratePersistenceData } from "../../../../../../../../shared/infra/persistence/persistence-hydration.js";
import {
  Route,
  RouteStatus,
  type RouteProps,
} from "../../../../domain/route.aggregate.js";
import { RouteId } from "../../../../domain/route-id.js";
import type { IInsertRouteParams } from "../queries/route.insert.queries.js";

export interface RoutePersistenceRow {
  readonly id: string;
  readonly status: string;
  readonly planned_stop_count: number;
  readonly next_stop_sequence: number;
  readonly active_stop_sequence: number | null;
}

/** Maps the flat Route root persistence representation to its domain aggregate. */
export class RouteMapper {
  static toDomain(row: RoutePersistenceRow): Route {
    return hydratePersistenceData("route", () => {
      const props: RouteProps = {
        status: row.status as RouteStatus,
        plannedStopCount: row.planned_stop_count,
        nextPermittedStopSequence: row.next_stop_sequence,
        activeStopSequence: row.active_stop_sequence ?? undefined,
      };
      return Route.reconstitute(RouteId.from(row.id), props);
    });
  }

  static toPersistence(tenantId: string, route: Route): IInsertRouteParams {
    return {
      tenantId,
      id: route.id.value,
      status: route.status,
      plannedStopCount: route.plannedStopCount,
      nextPermittedStopSequence: route.nextPermittedStopSequence,
      activeStopSequence: route.activeStopSequence,
    };
  }
}
