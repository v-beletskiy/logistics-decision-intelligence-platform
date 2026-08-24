import { Injectable } from "@nestjs/common";
import {
  SchemaRegistry,
  SchemaValidationError,
} from "@logistics-decision-intelligence/validation/json-schema";

import { HttpClient } from "../../../../../../shared/infra/http/http-client.js";
import type { VroomRequest } from "./vroom-request.js";
import {
  vroomSolutionSchema,
  type SuccessfulVroomSolution,
  type VroomSolution,
} from "./vroom-solution.schema.js";

const vroomResponseSchemas = new SchemaRegistry([vroomSolutionSchema]);

@Injectable()
export class VroomClient {
  constructor(private readonly httpClient: HttpClient) {}

  async optimize(
    baseUrl: string,
    request: VroomRequest,
  ): Promise<SuccessfulVroomSolution> {
    return decodeVroomSolution(
      await this.httpClient.post(`${baseUrl}/`, request),
      request,
    );
  }
}

function decodeVroomSolution(
  value: unknown,
  request: VroomRequest,
): SuccessfulVroomSolution {
  const solution = parseVroomSolution(value);
  if (solution.code !== 0) {
    throw new Error("VROOM failed to solve the optimization problem.");
  }
  const [route] = solution.routes ?? [];
  const expectedVehicleId = request.vehicles[0]?.id;
  if (
    !route ||
    solution.routes?.length !== 1 ||
    expectedVehicleId === undefined ||
    route.vehicle !== expectedVehicleId ||
    (solution.unassigned?.length ?? 0) > 0 ||
    route.steps === undefined
  ) {
    throw new Error("VROOM returned an incomplete optimization solution.");
  }

  const orderedTaskIds = route.steps.flatMap((step) =>
    (step.type === "job" ||
      step.type === "pickup" ||
      step.type === "delivery") &&
    step.id !== undefined
      ? [step.id]
      : [],
  );
  const expectedTaskIds = new Set([
    ...request.jobs.map((job) => job.id),
    ...request.shipments.flatMap((shipment) => [
      shipment.pickup.id,
      shipment.delivery.id,
    ]),
  ]);
  if (
    orderedTaskIds.length !== expectedTaskIds.size ||
    new Set(orderedTaskIds).size !== expectedTaskIds.size ||
    orderedTaskIds.some((taskId) => !expectedTaskIds.has(taskId))
  ) {
    throw new Error("VROOM returned an incomplete optimization solution.");
  }

  return { route, orderedTaskIds };
}

function parseVroomSolution(value: unknown): VroomSolution {
  try {
    return vroomResponseSchemas.assert<VroomSolution>(
      vroomSolutionSchema.$id,
      value,
    );
  } catch (error: unknown) {
    if (error instanceof SchemaValidationError) {
      throw new Error("VROOM returned a malformed optimization response.", {
        cause: error,
      });
    }
    throw error;
  }
}
