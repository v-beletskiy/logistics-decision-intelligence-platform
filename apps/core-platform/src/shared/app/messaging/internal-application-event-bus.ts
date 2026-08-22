/**
 * A trusted in-process message between bounded contexts in this deployable.
 * It is deliberately not a CloudEvent and never crosses a transport boundary.
 */
export interface InternalApplicationEvent<
  TPayload = unknown,
  TType extends string = string,
> {
  readonly type: TType;
  readonly payload: TPayload;
}

export interface InternalApplicationEventContract<
  TType extends string,
  TPayload,
> {
  readonly type: TType;
  create(payload: TPayload): InternalApplicationEvent<TPayload, TType>;
}

export type InternalApplicationEventOf<
  TContract extends InternalApplicationEventContract<string, unknown>,
> = ReturnType<TContract["create"]>;

/** Defines one typed, stable in-process event contract. */
export function defineInternalApplicationEvent<TPayload>(): <
  const TType extends string,
>(
  type: TType,
) => InternalApplicationEventContract<TType, TPayload> {
  return <const TType extends string>(type: TType) => {
    if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(type)) {
      throw new Error(
        "An internal application event type must be a dot/dash-delimited lowercase identifier.",
      );
    }
    return Object.freeze({
      type,
      create: (payload: TPayload) => ({ type, payload }),
    });
  };
}

export abstract class InternalApplicationEventBus {
  abstract publish<TPayload, TType extends string>(
    event: InternalApplicationEvent<TPayload, TType>,
  ): Promise<void>;
}
