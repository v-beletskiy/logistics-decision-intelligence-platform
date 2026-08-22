/**
 * Base class for immutable domain values.
 *
 * Concrete value objects expose only the data that defines their value through
 * `equalityComponents`. Their factory and validation rules remain local to the
 * concrete value object.
 */
export abstract class ValueObject<
  TValueObject extends ValueObject<TValueObject>,
> {
  equals(other: TValueObject): boolean {
    if (this.constructor !== other.constructor) {
      return false;
    }

    const left = this.equalityComponents();
    const right = other.equalityComponents();
    return (
      left.length === right.length &&
      left.every((component, index) => Object.is(component, right[index]))
    );
  }

  protected abstract equalityComponents(): readonly unknown[];
}
