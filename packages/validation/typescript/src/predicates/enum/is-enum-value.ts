/** A TypeScript string enum represented at runtime. */
export type StringEnum = Readonly<Record<string, string>>;

/**
 * Returns whether an unknown runtime value is one of a string enum's values.
 *
 * Numeric enums are intentionally excluded because TypeScript emits reverse
 * mappings for them, which makes Object.values() unsuitable for this check.
 */
export function isEnumValue<TEnum extends StringEnum>(
  enumeration: TEnum,
  value: unknown,
): value is TEnum[keyof TEnum] {
  return typeof value === 'string' && Object.values(enumeration).includes(value);
}
