import {
  eventTypesForContracts as eventTypesForSharedContracts,
  IntegrationEventDecoder,
  IntegrationEventValidationError,
  type IntegrationEventContract,
  type IntegrationEventsOf,
} from "@logistics-decision-intelligence/integration-events";

import { NonRetryableMessageException } from "../errors.js";

export type { IntegrationEventContract };

/** A deterministic transport failure that must be dead-lettered, never retried. */
export class InvalidIntegrationEventException extends NonRetryableMessageException {
  constructor(
    readonly reason: IntegrationEventValidationError["reason"],
    readonly schemaId?: string,
  ) {
    super("Integration event does not satisfy a supported contract.");
  }
}

/**
 * RabbitMQ-facing failure mapping over the transport-neutral decoder. Contract
 * compilation and schema validation live in the shared integration runtime.
 */
export class IntegrationEventValidator<
  const TContracts extends readonly IntegrationEventContract[],
> {
  private readonly decoder: IntegrationEventDecoder<TContracts>;

  constructor(contracts: TContracts) {
    this.decoder = new IntegrationEventDecoder(contracts);
  }

  parse(value: unknown): IntegrationEventsOf<TContracts> {
    try {
      return this.decoder.parse(value);
    } catch (error: unknown) {
      if (error instanceof IntegrationEventValidationError) {
        throw new InvalidIntegrationEventException(
          error.reason,
          error.schemaId,
        );
      }
      throw error;
    }
  }
}

export function eventTypesForContracts<
  const TContracts extends readonly IntegrationEventContract[],
>(contracts: TContracts): readonly TContracts[number]["eventType"][] {
  return eventTypesForSharedContracts(contracts);
}
