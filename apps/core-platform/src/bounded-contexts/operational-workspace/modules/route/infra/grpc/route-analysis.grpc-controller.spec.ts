import * as assert from "node:assert/strict";
import { test } from "node:test";

import { AggregateNotFoundException } from "../../../../../../shared/app/app.exceptions";
import type {
  GetRouteAnalysisContextRequest,
  GetRouteAnalysisContextResponse,
} from "../../../../../../shared/infra/grpc/generated/operational_workspace/v1/route_analysis_service";
import { GrpcServiceRegistry } from "../../../../../../shared/infra/grpc/grpc-service-registry";
import type { GetRouteAnalysisContextHandler } from "../../app/queries/get-route-analysis-context/get-route-analysis-context.handler";
import type { RouteAnalysisContextResult } from "../../app/queries/get-route-analysis-context/get-route-analysis-context.result";
import { RouteAnalysisGrpcController } from "./route-analysis.grpc-controller";

const context: RouteAnalysisContextResult = {
  routeId: "00000000-0000-4000-8000-000000000001",
  routeVersion: 3,
  stops: [
    {
      shipmentId: "00000000-0000-4000-8000-000000000002",
      location: { latitude: 50.4501, longitude: 30.5234 },
      plannedArrivalAt: new Date("2026-08-10T08:00:00.000Z"),
      plannedDepartureAt: new Date("2026-08-10T09:00:00.000Z"),
    },
  ],
};

function handlerReturning(
  outcome: RouteAnalysisContextResult | Error,
): GetRouteAnalysisContextHandler {
  return {
    exec: () =>
      outcome instanceof Error
        ? Promise.reject(outcome)
        : Promise.resolve(outcome),
  } as unknown as GetRouteAnalysisContextHandler;
}

function controllerWith(
  outcome: RouteAnalysisContextResult | Error,
): RouteAnalysisGrpcController {
  return new RouteAnalysisGrpcController(
    handlerReturning(outcome),
    new GrpcServiceRegistry(),
  );
}

function invoke(
  controller: RouteAnalysisGrpcController,
  request: GetRouteAnalysisContextRequest,
): Promise<{
  error: { code?: number } | null;
  response: GetRouteAnalysisContextResponse | null | undefined;
}> {
  return new Promise((resolve) => {
    controller.handlers.getRouteAnalysisContext(
      { request } as never,
      (error, response) =>
        resolve({
          error: (error as { code?: number } | null) ?? null,
          response,
        }),
    );
  });
}

test("RouteAnalysisGrpcController maps a loaded route context", async () => {
  const controller = controllerWith(context);
  const { error, response } = await invoke(controller, {
    tenantId: "00000000-0000-4000-8000-000000000010",
    routeId: context.routeId,
  });

  assert.equal(error, null);
  assert.equal(response?.context?.routeId, context.routeId);
  assert.equal(response?.context?.routeVersion, 3);
  assert.equal(response?.context?.stops.length, 1);
  assert.equal(
    response?.context?.stops[0].shipmentId,
    context.stops[0].shipmentId,
  );
  assert.deepEqual(response?.context?.stops[0].location, {
    latitude: 50.4501,
    longitude: 30.5234,
  });
  assert.ok(response?.context?.stops[0].plannedArrivalAt instanceof Date);
  assert.ok(response?.context?.stops[0].plannedDepartureAt instanceof Date);
});

test("RouteAnalysisGrpcController propagates handler errors", async () => {
  const controller = controllerWith(new AggregateNotFoundException("Route"));
  const invoke = controller.handlers.getRouteAnalysisContext as unknown as (
    call: { request: GetRouteAnalysisContextRequest },
    callback: (error: unknown, response: unknown) => void,
  ) => Promise<void>;

  await assert.rejects(
    invoke(
      {
        request: {
          tenantId: "00000000-0000-4000-8000-000000000010",
          routeId: "00000000-0000-4000-8000-000000000099",
        },
      },
      () => undefined,
    ),
    (error: unknown) => error instanceof AggregateNotFoundException,
  );
});
