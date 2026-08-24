import type { OptimizationStop } from "../../domain/optimization-stop.js";
import type { CostMatrix } from "../../domain/cost-matrix.js";
import type { RouteOptimizationSolution } from "../../app/ports/route-optimizer.js";
import type { VroomRequest } from "./vroom-request.js";
import type { SuccessfulVroomSolution } from "./vroom-solution.schema.js";

function toSeconds(date: Date): number {
  return Math.round(date.getTime() / 1000);
}

/** Translates the route problem to VROOM's model and back to a neutral solution. */
export class VroomMapper {
  toRequest(
    fixedOrigin: OptimizationStop,
    stops: readonly OptimizationStop[],
  ): VroomRequest {
    const jobs = stops.map((stop, index) => ({
      id: index + 1,
      location: [stop.location.longitude, stop.location.latitude] as const,
      service: Math.max(
        0,
        toSeconds(stop.plannedDepartureAt) - toSeconds(stop.plannedArrivalAt),
      ),
      timeWindows: [
        [toSeconds(stop.plannedArrivalAt), toSeconds(stop.plannedDepartureAt)],
      ] as const,
    }));
    const start = [
      fixedOrigin.location.longitude,
      fixedOrigin.location.latitude,
    ] as const;
    return {
      jobs,
      vehicles: [{ id: 1, start }],
      options: { geometry: false },
    };
  }

  toSolution(
    solution: SuccessfulVroomSolution,
    matrix: CostMatrix,
  ): RouteOptimizationSolution {
    const orderedStopIndexes = [0, ...solution.orderedJobIds];
    const distanceKm = this.routeDistance(
      orderedStopIndexes,
      matrix.distanceMatrix,
    );
    const durationSeconds = this.routeDistance(
      orderedStopIndexes,
      matrix.durationMatrix,
    );

    return {
      orderedStopIndexes,
      metrics: { distanceKm, durationSeconds },
    };
  }

  private routeDistance(
    order: readonly number[],
    matrix: readonly (readonly number[])[],
  ): number {
    let total = 0;
    for (let i = 0; i < order.length - 1; i += 1) {
      total += matrix[order[i]][order[i + 1]];
    }
    return total;
  }
}
