# Validation — TypeScript

Framework-free runtime value primitives. This package does not make business
decisions or throw domain errors.

The package has three distinct categories:

- `predicates/` inspect unknown values, return booleans or type predicates, and
  never transform or throw;
- `normalizers/` transform already typed values;
- `parsers/` may be introduced only when a structured result is
  needed by multiple consumers.

Each operation category is subdivided by value category, for example
`predicates/string/`, `predicates/enum/`, and `normalizers/string/`. Each source
file exports one public function.

Applications and bounded contexts own requiredness, the meaning of invalid
data, and mapping failures to their own errors at the appropriate boundary.
