export interface IntegrationEvent {
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly tenantId: string;
  readonly initiatedByUserId?: string;
}
