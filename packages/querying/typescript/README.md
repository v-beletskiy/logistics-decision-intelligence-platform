# Querying

Database-neutral TypeScript primitives for application read queries.

The package owns pagination and sorting primitives: input normalization, page
metadata, offset calculation, criteria-bound opaque cursors, ordered allowlisted
sort clauses, and server-owned deterministic tie-breakers. SQL, database
drivers, generated query types, and domain-specific filters stay in their
owning apps.

Cursors contain navigation state only. They never replace tenant scoping,
authorization, or server-side filtering.
