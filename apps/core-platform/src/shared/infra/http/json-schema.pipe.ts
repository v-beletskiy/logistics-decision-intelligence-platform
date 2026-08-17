import type { PipeTransform } from "@nestjs/common";
import type {
  IdentifiedSchema,
  SchemaRegistry,
} from "@logistics-decision-intelligence/validation/json-schema";
import type { FromSchema, JSONSchema } from "json-schema-to-ts";

/** Thin Nest adapter over the framework-independent, compile-once schema registry. */
export class JsonSchemaPipe<
  TSchema extends IdentifiedSchema & JSONSchema,
> implements PipeTransform<unknown, FromSchema<TSchema>> {
  constructor(
    private readonly schemaRegistry: SchemaRegistry,
    private readonly schema: TSchema,
  ) {}

  transform(value: unknown): FromSchema<TSchema> {
    return this.schemaRegistry.assert<FromSchema<TSchema>>(
      this.schema.$id,
      value,
    );
  }
}
