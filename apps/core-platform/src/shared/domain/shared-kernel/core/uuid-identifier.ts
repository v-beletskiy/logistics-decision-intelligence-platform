import { requireUuid } from '../validation/primitives/uuid/require-uuid';

import { ValueObject } from './value-object';

/** Base class for immutable UUID-backed domain identifiers. */
export abstract class UuidIdentifier<
  TIdentifier extends UuidIdentifier<TIdentifier>,
> extends ValueObject<TIdentifier> {
  readonly value: string;

  protected constructor(value: unknown, label: string) {
    super();
    this.value = requireUuid(value, label);
    Object.freeze(this);
  }

  toString(): string {
    return this.value;
  }

  protected equalityComponents(): readonly unknown[] {
    return [this.value];
  }
}
