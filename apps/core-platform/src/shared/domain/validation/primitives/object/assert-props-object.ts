import { SHARED_DOMAIN_ERROR_CODES } from "../../../domain-error-codes";
import { DomainException } from "../../../domain.exceptions";

/** Asserts that a value-object property bag is a non-null object. */
export function assertPropsObject(
  props: unknown,
  valueObjectName: string,
): asserts props is object {
  if (props === null || typeof props !== "object") {
    throw new DomainException(
      `${valueObjectName} properties must be specified.`,
      SHARED_DOMAIN_ERROR_CODES.requiredProperties,
    );
  }
}
