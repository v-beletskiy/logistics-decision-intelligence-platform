# ADR-0006 — Persistence Architecture

## Context

The platform follows Domain-Driven Design with CQRS and a modular monolith architecture.

The persistence layer must:

- keep aggregates and entities independent of database concerns;
- preserve transactional consistency across aggregate and outbox writes;
- provide strong SQL-boundary type safety;
- support efficient aggregate reconstruction and read projections.

## Decision

### Database

Each application owns its database. PostgreSQL is the primary database for Core Platform; each bounded context operates in its own schema. SQL migrations are the source of truth for database structure and run before deployment.

```text
apps/core-platform/
├── db/
│   ├── migrations/
│   └── seeds/
└── src/
    ├── bounded-contexts/
    └── shared/
```

Tenant scope comes from trusted execution context and is passed explicitly to tenant-scoped repository and read-store operations. The shared-schema tenant model is:

- aggregate roots use an application-generated, globally unique UUIDv7 `id` as their primary key and store `tenant_id NOT NULL`;
- roots referenced by tenant-owned tables expose `UNIQUE (tenant_id, id)` for tenant-aware composite foreign keys;
- bounded child rows use ownership-scoped keys such as `(tenant_id, aggregate_id, id)`;
- every tenant-owned relationship includes `tenant_id` on both sides of its foreign key;
- business uniqueness and partial uniqueness are tenant-scoped;
- reads, writes, and existence checks include `tenant_id`.

Migrations define tenant-aware foreign keys with both columns, for example
`FOREIGN KEY (tenant_id, route_id) REFERENCES routes (tenant_id, id)`. The
referenced root's `UNIQUE (tenant_id, id)` makes this relationship valid while
the UUID primary key remains the aggregate's globally unique identity.

Shared infrastructure tables that are not tenant-owned, such as integration delivery bookkeeping, do not acquire tenant identity.

### SQL-first persistence

Repositories and read stores use native SQL compiled into TypeScript bindings with **pgtyped**. SQL is the source of truth for each statement.

```text
.sql
      │
      ▼
pgtyped
      │
      ▼
Generated query function and parameter/result types
      │
      ▼
Repository or read store
```

Generated artifacts are committed with their `.sql` files and are never edited manually. pgtyped types apply only to the statement that generated them: parameter types model that statement's inputs and result types model that statement's projection.

### Repository structure

Each aggregate owns a repository port in its domain module and one PostgreSQL implementation in module-owned infrastructure.

```text
driver/
├── domain/
│   └── driver.repository.ts
└── infra/
    └── persistence/
        ├── driver-persistence.module.ts
        ├── repository/
        │   ├── pg-driver.repository.ts
        │   ├── mappers/driver.mapper.ts
        │   └── queries/
        │       ├── driver.find-by-id.sql
        │       ├── driver.find-by-id-for-update.sql
        │       ├── driver.insert.sql
        │       ├── driver.update.sql
        │       └── driver.reconcile-certifications.sql
        └── read-store/
            ├── pg-driver.read-store.ts
            ├── mappers/driver-search.mapper.ts
            └── queries/driver.search.sql
```

Repositories are responsible for aggregate persistence. Read stores are responsible for query projections. Both depend on the PostgreSQL client, generated query bindings, and their own mapper; neither exposes persistence rows outside infrastructure.

A read-store port and implementation are named for their stable queried concept,
not for the first handler that uses them: for example, `RouteReadStore` and
`PgRouteReadStore`. One cohesive read store may expose several Route projections.
Create a separate read store only for a distinct read model, data source, or
ownership boundary. The Application port belongs in the feature's `app/ports/`;
the individual query input and its normalized options belong in that query's
folder. PostgreSQL projection mapping belongs in `read-store/mappers/`.

Register read stores in the module's existing persistence module alongside its
repositories.

### Mapping and reconstitution

Mappers translate between a statement-specific database projection and the domain model.

```text
pgtyped result row
       │
       ▼
Infrastructure mapper
       │
       ▼
Aggregate / child-entity reconstitution
```

- `toDomain(row)` reconstitutes the complete aggregate from its loader result.
- `toPersistence(tenantId, aggregate)` creates write-statement parameters from current aggregate state.
- The aggregate and child entities perform their normal invariant validation during reconstitution.
- Infrastructure performs only technical conversion required by stored values, such as timestamps, and wraps malformed persistence data as an infrastructure failure.

This keeps pgtyped row types, SQL aliases, and JSON payload shapes outside the domain model.

#### Mapper-owned persistence-row types

Each aggregate mapper declares the narrow structural `<Aggregate>PersistenceRow`
required by `toDomain`; a loader that aggregates relational children as JSON uses
equally focused persistence-data types in that mapper. This is the mapper's
canonical read contract, not a database entity or a type derived from
write-statement parameters. Do not mirror relational tables as JSON Schemas.

The repository passes the generated pgtyped result to the mapper directly.
TypeScript then verifies that the statement projection supplies every field the
mapper requires, while allowing different loader statements to select additional
columns. A query whose projection no longer satisfies the reconstitution contract
fails at the infrastructure boundary rather than coupling the domain to a
statement-specific pgtyped type.

### Aggregate persistence

Repositories expose `add` for a newly created aggregate and `save` for an aggregate loaded from the repository. Application-generated UUIDv7 identifiers identify roots and children before persistence, allowing the complete aggregate graph to be mapped before rows are written. UUIDv7 provides globally unique, time-ordered keys while identifiers remain opaque to the domain.

An aggregate owns only a bounded child collection. The aggregate loader returns the root and its owned children in one round trip using `jsonb_agg` and `COALESCE`; the mapper reconstitutes the root and every child entity.

Saving a bounded aggregate maps its complete current state. Child rows are reconciled atomically in SQL:

1. insert children not yet stored;
2. update existing children whose persisted values differ;
3. delete stored children absent from current aggregate state.

`IS DISTINCT FROM` is used for null-safe comparison in conditional updates. This keeps write semantics in the repository and business invariants in the aggregate.

In terms of aggregate children this pattern works for a limited number of children. For cases with considerable number of children reconsider aggregate boundaries and extract into a separate aggregate to avoid performance issues.

#### Canonical methods and constraint translation

Aggregate `add` uses an insert, never an upsert. Recognized constraint failures
are translated by the shared `execAndTranslatePgConstraintViolations` utility;
unknown PostgreSQL failures propagate unchanged. Translation matches both the
SQLSTATE and the explicit schema-owned constraint name.

Aggregate `save` uses `execRevisionedPgUpdate`. The utility translates configured
constraints, requires an updated row, and returns its revision; no updated row
is an Application concurrency conflict. Bounded children are reconciled only
after the root write succeeds.

Module repositories own the mapping from their constraint names to
Application exceptions. Generic PostgreSQL inspection and concurrency handling
remain in shared Infrastructure rather than repository-local helper functions.

### Concurrency

Aggregate roots have a positive revision. Revision columns use `BIGINT` for frequently updated aggregates.

Regular write flows use optimistic concurrency:

```text
findById() → { aggregate, expectedRevision }
        │
        ▼
aggregate behavior
        │
        ▼
save() → UPDATE ... WHERE revision = :expectedRevision
        │
        ▼
new revision or concurrency conflict
```

Repository ports name this pair `Loaded<Aggregate>` (for example,
`LoadedRecommendation`). It is a repository-read result, not a Domain object:
it pairs the reconstituted Aggregate with `expectedRevision` captured
by that read. Read methods return it; Save methods receive it unchanged. Used for **optimistic concurrentcy during future saves**. The
revision is never supplied by a transport client or manufactured by an
application use case.

`save` increments in the same transaction and returns the revision. A root update that affects no row is an application-level concurrency conflict.

Repositories also provide `findByIdForUpdate` for use cases requiring pessimistic coordination. It loads the same complete aggregate projection and locks the root row with `FOR UPDATE`; the use case then saves within the shared transaction.

Repository methods describe Aggregate retrieval and consistency, not a caller's
business process.

### Transactions

State-changing application use cases execute through the shared transaction boundary. The transaction can include multiple repositories and transactional-outbox persistence.

```text
Application use case
        │
        ▼
Transaction manager
        │
        ▼
Repositories / Outbox repository
        │
        ▼
PostgreSQL
```

Repositories use the active transaction and do not create, commit, or publish from it. Aggregate changes and integration-event outbox records persist atomically; domain events are dispatched only after successful persistence.

### Read projections

Query handlers use dedicated read stores and return DTO/read projections instead of aggregates.

```text
Application query
        │
        ▼
Read store
        │
        ▼
SQL projection → read-store mapper → DTO
```

### Filtering, pagination, and sorting

Each read use case defines explicit, typed filter and sort contracts. The shared `packages/querying/typescript/src/pagination` package provides pagination, cursor, and sort primitives; it does not own domain-specific filter fields or sort profiles.

Page and cursor pagination use separate static pgtyped statements with identical filtering semantics:

- Page queries apply `LIMIT` and `OFFSET` and return the page plus exact total count from one statement.
- Cursor queries use a stable order, return `pageSize + 1` rows (+1 to determine whether another page exists without a separate count query), and create next cursor from the last returned row.
- A cursor contains every ordered field and the identifier as a deterministic tie-breaker. Its scope binds it to the logical query, filters, and sort.
- Cursor ordering uses one direction for the complete order, enabling composite tuple predicates and matching indexes.
- Page ordering may expose independently selected directions for its supported fields.

Static SQL remains the default for explicit read use cases. Type-safe query builder (e.g. Kysely) may be introduced for future read cases requiring advanced composable dynamic filtering or sorting. In order to have dynamic queries and avoid performance issues.

Allowed fields, operators, and sort expressions remain server-defined and parameterized.

### SQL organization and indexes

Each logical repository or read-store operation has a dedicated `.sql` file and its generated pgtyped artifact. This keeps SQL reviewable and query optimization local to its use case.

Usually indexes support actual tenant-scoped filter and ordering paths. They are selected from supported query shapes, selectivity, write cost, and `EXPLAIN (ANALYZE, BUFFERS)` results. Composite indexes lead with `tenant_id` where queries are tenant-scoped.

## Consequences

### Advantages

- Domain models remain persistence-ignorant and own business invariants.
- SQL projections remain type-checked, explicit, and directly optimizable.
- Bounded aggregates have predictable load and save costs.
- Read projections scale independently from aggregate persistence.
- Optimistic and pessimistic concurrency are available per use case.

### Trade-offs

- Complex dynamic filtering and sorting results in overly big sql queries and potential performance degradation due to static sql queries nature.
- pgtyped generation remains part of the development workflow.
- Full-state child reconciliation is limited to bounded aggregate-owned collections.
