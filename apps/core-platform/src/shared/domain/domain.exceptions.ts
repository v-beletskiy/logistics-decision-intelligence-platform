declare const domainErrorCodeBrand: unique symbol;

export type DomainErrorCode = string & {
  readonly [domainErrorCodeBrand]: true;
};

type ErrorCodeDefinitions = Readonly<Record<string, string>>;

/** Creates a module-owned catalog and rejects malformed or duplicate codes. */
export function defineErrorCodes<
  const TDefinitions extends ErrorCodeDefinitions,
>(
  namespace: string,
  definitions: TDefinitions,
): Readonly<{ [TKey in keyof TDefinitions]: DomainErrorCode }> {
  assertCodePart(namespace, "namespace");
  const codes = Object.entries(definitions).map(([key, suffix]) => {
    assertCodePart(suffix, `suffix for ${key}`);
    return [key, `${namespace}.${suffix}` as DomainErrorCode] as const;
  });
  if (new Set(codes.map(([, code]) => code)).size !== codes.length) {
    throw new Error(`Domain error codes in ${namespace} must be unique.`);
  }
  return Object.freeze(Object.fromEntries(codes)) as Readonly<{
    [TKey in keyof TDefinitions]: DomainErrorCode;
  }>;
}

function assertCodePart(value: string, label: string): void {
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(value)) {
    throw new Error(
      `Domain error code ${label} must be a dot/dash-delimited lowercase identifier.`,
    );
  }
}

/**
 * Base class for failures caused by a violated business rule.
 *
 * It deliberately carries no transport or persistence concern, so domain code
 * can express a business failure without depending on NestJS.
 */
export class DomainException extends Error {
  constructor(
    message: string,
    readonly code: DomainErrorCode,
    readonly context?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** A business rule failure caused by the aggregate's current state. */
export class DomainConflictException extends DomainException {
  constructor(
    message: string,
    code: DomainErrorCode,
    context?: Readonly<Record<string, unknown>>,
  ) {
    super(message, code, context);
  }
}
