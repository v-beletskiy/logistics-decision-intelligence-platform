import assert from "node:assert/strict";
import test from "node:test";

import type { CloudEvent } from "@logistics-decision-intelligence/integration-events";

import type { DomainEvent } from "../../../../../../../shared/domain/domain-event";
import { DomainEventBus } from "../../../../../../../shared/app/messaging/domain-event-bus";
import { IntegrationEventPublisher } from "../../../../../../../shared/app/messaging/integration-event-publisher";
import { TrxManager } from "../../../../../../../shared/app/trx/trx-manager";
import { UseCaseContext } from "../../../../../../../shared/modules/access-control/app/execution/use-case-context";
import { SYSTEM_PRINCIPALS } from "../../../../../../../shared/modules/access-control/app/identity/system-principals";
import {
  RouteOptimizationInputQuery,
  type RouteOptimizationInput,
} from "../../ports/route-optimization-input.query";
import { RouteReference } from "../../../../../domain/route-reference";
import {
  Optimization,
  OptimizationStatus,
} from "../../../domain/optimization.aggregate";
import { OptimizationId } from "../../../domain/optimization-id";
import {
  OptimizationRepository,
  type LoadedOptimization,
} from "../../../domain/optimization.repository";
import { RouteOptimizationTriggerPolicy } from "../../../domain/route-optimization-trigger.policy";
import { QueueOptimizationCommand } from "./queue-optimization.command";
import { QueueOptimizationHandler } from "./queue-optimization.handler";

const tenantId = "11111111-1111-4111-8111-111111111111";
const routeId = "22222222-2222-4222-8222-222222222222";

class ImmediateTrxManager extends TrxManager {
  run<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }
}

class RecordingDomainEventBus extends DomainEventBus {
  readonly events: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.events.push(event);
  }
}

class RecordingIntegrationEventPublisher extends IntegrationEventPublisher {
  readonly events: CloudEvent[] = [];

  async publishMany(events: readonly CloudEvent[]): Promise<void> {
    this.events.push(...events);
  }
}

class StubRouteOptimizationInputQuery extends RouteOptimizationInputQuery {
  constructor(private readonly input: RouteOptimizationInput) {
    super();
  }

  async get(): Promise<RouteOptimizationInput> {
    return this.input;
  }
}

class StubOptimizationRepository extends OptimizationRepository {
  readonly saved: LoadedOptimization[] = [];
  readonly added: Optimization[] = [];
  findCalls = 0;

  constructor(
    private readonly activeResults: readonly (LoadedOptimization | null)[],
  ) {
    super();
  }

  async findActiveByRouteIdForUpdate(): Promise<LoadedOptimization | null> {
    const result = this.activeResults[this.findCalls];
    this.findCalls += 1;
    return result ?? null;
  }

  async add(_tenantId: string, optimization: Optimization): Promise<void> {
    this.added.push(optimization);
  }

  async save(
    _tenantId: string,
    loadedOptimization: LoadedOptimization,
  ): Promise<string> {
    this.saved.push(loadedOptimization);
    return "2";
  }

  async findById(): Promise<LoadedOptimization | null> {
    throw new Error("Not used by this test.");
  }

  async delete(): Promise<void> {
    throw new Error("Not used by this test.");
  }
}

function routeInput(routeVersion: number): RouteOptimizationInput {
  const plannedArrivalAt = new Date("2026-01-01T10:00:00.000Z");
  const plannedDepartureAt = new Date("2026-01-01T10:05:00.000Z");
  return {
    routeId,
    routeVersion,
    fixedOrigin: {
      shipmentId: "33333333-3333-4333-8333-333333333333",
      location: { latitude: 50.45, longitude: 30.52 },
      plannedArrivalAt,
      plannedDepartureAt,
    },
    stops: [],
  };
}

function loadedOptimization(inputVersion: number): LoadedOptimization {
  const aggregate = Optimization.reconstitute(OptimizationId.generate(), {
    routeId: RouteReference.from(routeId),
    status: OptimizationStatus.Queued,
    inputVersion,
  });
  return { aggregate, expectedRevision: "1" };
}

function context(): UseCaseContext {
  return UseCaseContext.fromIdentity({
    ...SYSTEM_PRINCIPALS.decisionIntelligenceOptimization,
    tenantId,
  });
}

test("replaces an older active optimization under a route lock", async () => {
  const active = loadedOptimization(1);
  const repository = new StubOptimizationRepository([active]);
  const integrationEvents = new RecordingIntegrationEventPublisher();
  const domainEvents = new RecordingDomainEventBus();
  const handler = new QueueOptimizationHandler(
    repository,
    integrationEvents,
    new RouteOptimizationTriggerPolicy(),
    new StubRouteOptimizationInputQuery(routeInput(2)),
    new ImmediateTrxManager(),
    domainEvents,
  );

  await handler.exec({
    context: context(),
    input: new QueueOptimizationCommand(routeId),
  });

  assert.equal(active.aggregate.status, OptimizationStatus.Cancelled);
  assert.equal(repository.saved.length, 1);
  assert.equal(repository.added.length, 1);
  assert.equal(repository.added[0]?.inputVersion, 2);
  assert.equal(integrationEvents.events.length, 1);
  assert.equal(domainEvents.events.length, 2);
});

test("does not replace an active optimization for the same input version", async () => {
  const active = loadedOptimization(2);
  const repository = new StubOptimizationRepository([active]);
  const integrationEvents = new RecordingIntegrationEventPublisher();
  const handler = new QueueOptimizationHandler(
    repository,
    integrationEvents,
    new RouteOptimizationTriggerPolicy(),
    new StubRouteOptimizationInputQuery(routeInput(2)),
    new ImmediateTrxManager(),
    new RecordingDomainEventBus(),
  );

  await handler.exec({
    context: context(),
    input: new QueueOptimizationCommand(routeId),
  });

  assert.equal(repository.findCalls, 1);
  assert.equal(repository.added.length, 0);
  assert.equal(repository.saved.length, 0);
  assert.equal(integrationEvents.events.length, 0);
});
