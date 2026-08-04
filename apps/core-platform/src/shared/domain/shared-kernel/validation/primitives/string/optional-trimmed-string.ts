import { trimBlankToUndefined } from '@logistics-decision-intelligence/validation';

import { DomainException } from '../../../exceptions/domain.exception';

/** Returns a trimmed optional string, treating blank text as absent. */
export function optionalTrimmedString(value: unknown, label: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new DomainException(`${label} must be text when specified.`);
  }
  return trimBlankToUndefined(value);
}
