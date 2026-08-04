import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { IntegrationEvent, IntegrationEventType } from "./integration-event";

export interface IntegrationEventMetadata {
  readonly eventId: string;
  readonly eventType: IntegrationEventType;
  readonly eventVersion: number;
  readonly occurredAt: Date;
  readonly tenantId: string;
  readonly initiatedByUserId?: string;
}

@Injectable()
export class IntegrationEventMetadataFactory {
  create(
    input: Omit<IntegrationEvent, "eventId" | "occurredAt">,
  ): IntegrationEvent {
    return {
      ...input,
      eventId: randomUUID(),
      occurredAt: new Date(),
    };
  }
}
