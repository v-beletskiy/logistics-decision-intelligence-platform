declare const payloadType: unique symbol;

/** JSON Schema data that can be consumed by any platform language. */
export type JsonSchema = Readonly<Record<string, unknown>> & {
  readonly $id: string;
};

/**
 * An immutable producer-owned external contract. The payload type is a
 * TypeScript facade over the language-neutral schema, not a Domain model.
 */
export interface IntegrationEventContract<
  TEventType extends string = string,
  TPayload = unknown,
> {
  readonly eventType: TEventType;
  readonly schemaId: string;
  readonly payloadSchema: JsonSchema;
  readonly [payloadType]?: TPayload;
}

export type IntegrationEventTypeOf<
  TContract extends IntegrationEventContract,
> = TContract["eventType"];

export type IntegrationEventPayloadOf<
  TContract extends IntegrationEventContract,
> = TContract extends IntegrationEventContract<string, infer TPayload>
  ? TPayload
  : never;

export function defineContract<TPayload>() {
  return <const TEventType extends string>(
    eventType: TEventType,
    payloadSchema: JsonSchema,
  ): IntegrationEventContract<TEventType, TPayload> => ({
    eventType,
    schemaId: payloadSchema.$id,
    payloadSchema,
  });
}
