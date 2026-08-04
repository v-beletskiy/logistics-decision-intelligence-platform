/** Common shape for business facts raised by an aggregate. */
export interface DomainEvent {
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly type: string;
}
