import { randomUUID } from "node:crypto";

import {
  integrationEventEnvelopeV1Schema,
  type IntegrationEventEnvelopeV1,
} from "@logistics-decision-intelligence/integration-contracts";
import type {
  IntegrationEventContract,
  IntegrationEventPayloadOf,
  IntegrationEventTypeOf,
} from "@logistics-decision-intelligence/integration-contracts";
import { isUuid } from "@logistics-decision-intelligence/validation";
import {
  SchemaRegistry,
  SchemaValidationError,
  type SchemaDefinition,
} from "@logistics-decision-intelligence/validation/json-schema";

export type { IntegrationEventContract } from "@logistics-decision-intelligence/integration-contracts";

declare const integrationEventIdBrand: unique symbol;

export type IntegrationEventId = string & {
  readonly [integrationEventIdBrand]: true;
};

export function integrationEventId(value: string): IntegrationEventId {
  if (!isUuid(value)) {
    throw new Error("Integration event ID must be a UUID.");
  }
  return value as IntegrationEventId;
}

/** Canonical CloudEvents structured JSON used for persistence and transport. */
export type CloudEvent<
  TData = unknown,
  TType extends string = string,
> = Readonly<
  Omit<IntegrationEventEnvelopeV1, "id" | "type" | "data"> & {
    readonly id: IntegrationEventId;
    readonly type: TType;
    readonly data: Readonly<TData>;
  }
>;

export type IntegrationEventOf<
  TContract extends IntegrationEventContract,
> = TContract extends IntegrationEventContract
  ? CloudEvent<
      IntegrationEventPayloadOf<TContract>,
      IntegrationEventTypeOf<TContract>
    >
  : never;

export type IntegrationEventsOf<
  TContracts extends readonly IntegrationEventContract[],
> = IntegrationEventOf<TContracts[number]>;

export interface CreateIntegrationEventInput<TData> {
  readonly source: string;
  readonly tenantid: string;
  readonly subject: string;
  readonly data: TData;
}

/** @deprecated Use CloudEvent. CloudEvents are now the canonical event model. */
export type IntegrationEvent<TData = unknown, TType extends string = string> =
  CloudEvent<TData, TType>;

/** @deprecated Use CloudEvent. CloudEvents are already in wire format. */
export type SerializedIntegrationEvent<TData = unknown> = CloudEvent<TData>;

export class IntegrationEventValidationError extends Error {
  constructor(
    readonly reason: "malformed" | "unsupported" | "schema-mismatch",
    readonly schemaId?: string,
  ) {
    super(`Integration event validation failed: ${reason}.`);
    this.name = "IntegrationEventValidationError";
  }
}

export function createIntegrationEvent<
  const TType extends string,
  TData,
>(
  contract: IntegrationEventContract<TType, TData>,
  input: CreateIntegrationEventInput<TData>,
  options: {
    readonly id?: string;
    readonly time?: string;
  } = {},
): CloudEvent<TData, TType> {
  return {
    specversion: "1.0",
    id: integrationEventId(options.id ?? randomUUID()),
    source: input.source,
    type: contract.eventType,
    subject: input.subject,
    time: options.time ?? new Date().toISOString(),
    dataschema: contract.schemaId,
    tenantid: input.tenantid,
    data: input.data,
  };
}

/** @deprecated CloudEvents are already in wire format; use the event directly. */
export function serializeIntegrationEvent<TData>(
  event: CloudEvent<TData>,
): CloudEvent<TData> {
  return event;
}

/**
 * Compiles trusted contracts once. It is transport-neutral: callers supply a
 * parsed JSON value and decide how failures are mapped to their transport.
 */
export class IntegrationEventDecoder<
  const TContracts extends readonly IntegrationEventContract[],
> {
  private readonly schemas: SchemaRegistry;
  private readonly contracts = new Map<
    string,
    IntegrationEventContract
  >();

  constructor(contracts: TContracts) {
    if (contracts.length === 0) {
      throw new Error("At least one integration-event contract is required.");
    }

    for (const contract of contracts) {
      if (this.contracts.has(contract.eventType)) {
        throw new Error(
          `Integration event contract ${contract.eventType} is declared more than once.`,
        );
      }
      this.contracts.set(contract.eventType, contract);
    }

    this.schemas = new SchemaRegistry([
      toSchemaDefinition(
        integrationEventEnvelopeV1Schema.$id,
        integrationEventEnvelopeV1Schema,
      ),
      ...contracts.map((contract) =>
        toSchemaDefinition(contract.schemaId, contract.payloadSchema),
      ),
    ]);
  }

  parse(value: unknown): IntegrationEventsOf<TContracts> {
    let event: Omit<CloudEvent, "id"> & { readonly id: string };
    try {
      event = this.schemas.assert<Omit<CloudEvent, "id"> & { readonly id: string }>(
        integrationEventEnvelopeV1Schema.$id,
        value,
      );
    } catch (error: unknown) {
      throw validationError(error);
    }

    const contract = this.contracts.get(event.type);
    if (contract === undefined) {
      throw new IntegrationEventValidationError("unsupported");
    }
    if (event.dataschema !== contract.schemaId) {
      throw new IntegrationEventValidationError(
        "schema-mismatch",
        contract.schemaId,
      );
    }

    try {
      this.schemas.assert(contract.schemaId, event.data);
    } catch (error: unknown) {
      throw validationError(error);
    }

    return {
      ...event,
      id: integrationEventId(event.id),
      type: contract.eventType,
    } as IntegrationEventsOf<TContracts>;
  }

  assert(event: CloudEvent): void {
    this.parse(event);
  }
}

export function eventTypesForContracts<
  const TContracts extends readonly IntegrationEventContract[],
>(
  contracts: TContracts,
): readonly IntegrationEventTypeOf<TContracts[number]>[] {
  return [...new Set(contracts.map((contract) => contract.eventType))];
}

function toSchemaDefinition(
  id: string,
  schema: Readonly<Record<string, unknown>>,
): SchemaDefinition {
  return { id, schema: schema as SchemaDefinition["schema"] };
}

function validationError(error: unknown): IntegrationEventValidationError {
  const schemaId =
    error instanceof SchemaValidationError ? error.schemaId : undefined;

  return new IntegrationEventValidationError("malformed", schemaId);
}
