import type { RouteOptimizationInputStop } from "../../../domain-modules/optimization/domain/optimization.inputs";
import type { CostMatrix } from "../../../domain-modules/optimization/domain/cost-matrix";
import type { RouteOptimizationSolution } from "../../../app/optimization/models/route-optimization-solution";
import type { VroomRequest, VroomSolution } from "./vroom-request";

function toSeconds(date: Date): number {
  return Math.round(date.getTime() / 1000);
}

/** Translates the route problem to VROOM's model and back to a neutral solution. */
export class VroomMapper {
  toRequest(input: readonly RouteOptimizationInputStop[]): VroomRequest {
    const jobs = input.slice(1).map((stop, index) => ({
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
    const first = input[0];
    const start = [first.location.longitude, first.location.latitude] as const;
    return {
      jobs,
      vehicles: [{ id: 1, start }],
      options: { geometry: false },
    };
  }

  toSolution(
    solution: VroomSolution,
    matrix: CostMatrix,
  ): RouteOptimizationSolution {
    const route = solution.routes?.[0];
    const steps = route?.steps ?? [];
    const delivery =
      steps.length > 0
        ? steps
            .filter((step) => step.type === "job" && step.job !== undefined)
            .map((step) => step.job as number)
        : (route?.delivery ?? []);

    const orderedStopIndexes = [0, ...delivery];
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
