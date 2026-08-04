# ADR-0006 — Persistence Architecture

## Context

The platform follows Domain-Driven Design with CQRS and a modular monolith architecture.

The persistence layer must:

- preserve domain isolation, keeping aggregates persistence-ignorant;
- support transactional consistency across multiple repositories;
- provide strong compile-time guarantees;
- allow complex SQL to remain readable and maintainable;

## Decision

### Database

Each app owns its own database. **PostgreSQL** is used as the main database.

Version 1 consists of:

- Core Platform → PostgreSQL
- AI Platform → may own its own persistence if required.

Each bounded context operates in its own schema. This allows future extraction of Bounded Contexts into independent services with less migration effort.

### Persistence Strategy

Repositories use a **SQL-first** approach.

Business queries are written as native SQL and compiled into fully typed TypeScript bindings using **pgTyped**.

SQL remains the single source of truth.

### Repository Structure

Each aggregate owns its repository implementation.

```text
optimization/

├── domain/
│   └── optimization.repository.ts
│
└── infra/
    ├── optimization.pg-repository.ts
    ├── optimization.mapper.ts
    └── queries/
        ├── find-by-id.sql
        ├── find-running-by-route.sql
        ├── save.sql
        └── ...
```

Repository implementations depend only on:

- generated pgTyped queries;
- PostgreSQL client;
- domain mapper.

### Mapping

Domain mapping is explicit.

```text
Database Row
       ▲
       │
Domain Mapper
       │
       ▼
Domain Aggregate
```

Repositories always return Domain Aggregates.

### Aggregate Persistence

Aggregates with child entities are persisted with **domain-owned change tracking**
(dirty marking): the aggregate classifies its children since load — created,
modified, removed — through a shared `ChildCollection`/`ChildChanges` tracker and
exposes `getPersistencePlan()` (`{ isNew, children: { inserts, updates,
removedIds } }`). No snapshots, no repository-side diffing.

Mappers are explicit in both directions: 
- `toDomain(persistence)` reconstructs the
aggregate (business rules validated by domain constructors);
- `toPersistence(aggregate)` derives write rows from the plan, typed against the generated pgTyped parameter types.

Persistence is batched and atomic: `persistRoot` (INSERT/UPDATE by `isNew`) plus
`persistChildChanges` (batched INSERT/UPDATE/DELETE), all inside one
TransactionManager transaction. Aggregates are loaded in a single round trip via
JSON aggregation (`jsonb_agg` + `COALESCE`). IDs are application-generated UUIDs,
so the graph is fully known before any row is written.

### Queries

Read models can bypass repositories to avoid unnecessary overhead with multiple queries.

Commands:

```text
Application Use Case
        │
        ▼
Repository
        │
        ▼
Domain Aggregate
```

Queries:

```text
Application Query
        │
        ▼
SQL Projection
        │
        ▼
DTO / Read Model
```

Repositories are responsible only for aggregate persistence.

### Transactions

Transactions are handled on application use case level. But application use cases do not create or manage database transactions directly. They are coordinated by a shared **TransactionManager**.

```
Application Use Case
        │
        ▼
TransactionManager
        │
        ▼
Repositories
        │
        ▼
PostgreSQL
```

A transaction may include operations across multiple repositories.

Typical example:

```
OptimizationRepository.save()
RecommendationRepository.saveMany()
OutboxRepository.save()
```

All persistence operations complete atomically.

Repositories never start or commit transactions themselves.

### SQL Organization

Business queries are stored in dedicated `.sql` files.

Example:

```
optimization/
├── infra/
    └── persistence/
        ├── optimization.pg-repository.ts
        ├── optimization.mapper.ts
        └── queries/
            ├── optimization.find-by-id.sql
            ├── optimization.find-running-by-route.sql
            ├── optimization.save.sql
            └── optimization.delete.sql
```

This provides:

- readable SQL;
- easy query optimization.

---

### Migrations

Database schema is managed through SQL migrations.

```
apps/

├── backend/
│   ├── db/
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   └── src/
│       ├── operational-workspace/
│       ├── decision-intelligence/
│       └── shared/
```

SQL migrations are the single source of truth for database structure.

Migrations are executed automatically by the CI/CD pipeline before deployment.

### Generated Types

pgTyped generates strongly typed query bindings during development whenever
query SQL changes. Generated bindings are committed so builds and migration
jobs do not require a database connection to compile.

```
.sql
      │
      ▼
pgTyped
      │
      ▼
Generated TypeScript Queries
      │
      ▼
Repositories
```

Generated files are not edited manually; they are committed with their source
`.sql` files.

## Consequences

### Advantages

- SQL remains the source of truth.
- Strong compile-time validation of SQL queries.
- Complex SQL remains readable and easy to optimize.

### Trade-offs

- Requires SQL knowledge.
- Additional build step for pgTyped code generation.

## Alternatives Considered

### ORM (Drizzle, Prisma, TypeORM)

Rejected because ORMs introduce persistence concerns into the domain model, encourage Active Record-style development, and become cumbersome when working with rich aggregates and complex SQL.

### Query Builder (Kysely)

Rejected because SQL should remain the primary source of truth rather than being expressed through TypeScript.

### Raw SQL Without Code Generation

Rejected because it provides no type-safety.

## Implementation Notes

- Each Repository owns persistence for exactly one Aggregate.
- Mappers expose `toDomain`/`toPersistence` and extend a shared
  `AggregatePersistenceMapper` base; validation lives in domain constructors, not
  class-validator.
- Corrupted persisted data raises `MalformedPersistenceDataException` (infra);
  Domain Exceptions are never thrown from infrastructure.
- Transactional Outbox records participate in the same database transaction as aggregate persistence.
- Generated pgTyped artifacts are treated as build outputs and must never be modified manually.
