import type { PreparedQuery } from "@pgtyped/runtime";

import { ConcurrencyConflictException } from "../../app/app.exceptions.js";
import { PgDatabase } from "./pg-database.js";
import { isPgConstraintViolation, type PgSqlState } from "./pg-error.js";

export interface PgConstraintViolationTranslation {
  readonly sqlState: PgSqlState;
  readonly constraint: string;
  readonly toError: (cause: unknown) => Error;
}

export async function execAndTranslatePgConstraintViolations<TParams, TResult>({
  database,
  statement,
  params,
  options,
}: {
  readonly database: PgDatabase;
  readonly statement: PreparedQuery<TParams, TResult>;
  readonly params: TParams;
  readonly options: {
    readonly translations: readonly PgConstraintViolationTranslation[];
  };
}): Promise<TResult[]> {
  try {
    return await database.exec(statement, params);
  } catch (error: unknown) {
    const translation = options.translations.find((candidate) =>
      isPgConstraintViolation(error, candidate),
    );
    if (translation) throw translation.toError(error);
    throw error;
  }
}

export async function execRevisionedPgUpdate<
  TParams,
  TResult extends { readonly revision: string },
>({
  database,
  statement,
  params,
  options,
}: {
  readonly database: PgDatabase;
  readonly statement: PreparedQuery<TParams, TResult>;
  readonly params: TParams;
  readonly options: {
    readonly aggregateName: string;
    readonly constraintTranslations?: readonly PgConstraintViolationTranslation[];
  };
}): Promise<string> {
  const [row] = await execAndTranslatePgConstraintViolations({
    database,
    statement,
    params,
    options: {
      translations: options.constraintTranslations ?? [],
    },
  });
  if (!row) {
    throw new ConcurrencyConflictException(
      `${options.aggregateName} was changed or removed by another operation.`,
    );
  }
  return row.revision;
}
