/**
 * A trusted in-process message between bounded contexts in this deployable.
 * It is deliberately not a CloudEvent and never crosses a transport boundary.
 */
export interface InternalApplicationEvent<TPayload = unknown> {
  readonly type: string;
  readonly payload: TPayload;
}

export abstract class InternalApplicationEventBus {
  abstract publish<TPayload>(
    event: InternalApplicationEvent<TPayload>,
  ): Promise<void>;
}
