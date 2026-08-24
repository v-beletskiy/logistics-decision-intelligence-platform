import {
  OptimizationStopOperationType,
  type OptimizationStop,
} from "../../domain/optimization-stop.js";
import type { CostMatrix } from "../../domain/cost-matrix.js";
import type {
  RouteOptimizationProblem,
  RouteOptimizationSolution,
} from "../../app/ports/route-optimizer.js";
import type { VroomRequest, VroomShipment } from "./vroom-request.js";
import type { SuccessfulVroomSolution } from "./vroom-solution.schema.js";

function toSeconds(date: Date): number {
  return Math.round(date.getTime() / 1000);
}

/** Translates the route problem to VROOM's model and back to a neutral solution. */
export class VroomMapper {
  toRequest(problem: RouteOptimizationProblem): VroomRequest {
    const { fixedOrigin, stops, matrix } = problem;
    const allStops = [fixedOrigin, ...stops];
    const originShipmentDelivery = stops.find(
      (stop) =>
        stop.shipmentId === fixedOrigin.shipmentId &&
        stop.operationType === OptimizationStopOperationType.Delivery,
    )!;
    const jobs = [
      toVroomTask(
        originShipmentDelivery,
        allStops.indexOf(originShipmentDelivery),
      ),
    ];
    const shipments = toVroomShipments(allStops, fixedOrigin.shipmentId);
    const start = [
      fixedOrigin.location.longitude,
      fixedOrigin.location.latitude,
    ] as const;
    const latestRequestedEnd = Math.max(
      ...allStops.map((stop) => toSeconds(stop.requestedTimeWindowEndAt)),
    );
    return {
      jobs,
      shipments,
      vehicles: [
        {
          id: 1,
          profile: "car",
          start,
          start_index: 0,
          time_window: [
            toSeconds(fixedOrigin.plannedDepartureAt),
            latestRequestedEnd,
          ],
        },
      ],
      matrices: {
        car: {
          durations: matrix.durationMatrix.map((row) =>
            row.map((value) => Math.round(value)),
          ),
          distances: matrix.distanceMatrix.map((row) =>
            row.map((value) => Math.round(value * 1_000)),
          ),
        },
      },
      options: { geometry: false },
    };
  }

  toSolution(
    solution: SuccessfulVroomSolution,
    matrix: CostMatrix,
  ): RouteOptimizationSolution {
    const orderedStopIndexes = [0, ...solution.orderedTaskIds];
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

function toVroomShipments(
  allStops: readonly OptimizationStop[],
  fixedOriginShipmentId: string,
): readonly VroomShipment[] {
  const byShipment = new Map<string, OptimizationStop[]>();
  for (const stop of allStops) {
    if (stop.shipmentId === fixedOriginShipmentId) continue;
    const shipmentStops = byShipment.get(stop.shipmentId) ?? [];
    shipmentStops.push(stop);
    byShipment.set(stop.shipmentId, shipmentStops);
  }
  return [...byShipment.values()].map((shipmentStops) => {
    const pickup = shipmentStops.find(
      (stop) => stop.operationType === OptimizationStopOperationType.Pickup,
    );
    const delivery = shipmentStops.find(
      (stop) => stop.operationType === OptimizationStopOperationType.Delivery,
    );
    return {
      pickup: toVroomTask(pickup!, allStops.indexOf(pickup!)),
      delivery: toVroomTask(delivery!, allStops.indexOf(delivery!)),
    };
  });
}

function toVroomTask(stop: OptimizationStop, index: number): VroomRequest["jobs"][number] {
  return {
    id: index,
    location: [stop.location.longitude, stop.location.latitude],
    location_index: index,
    service: Math.max(
      0,
      toSeconds(stop.plannedDepartureAt) - toSeconds(stop.plannedArrivalAt),
    ),
    time_windows: [
      [
        toSeconds(stop.requestedTimeWindowStartAt),
        toSeconds(stop.requestedTimeWindowEndAt),
      ],
    ],
  };
}
