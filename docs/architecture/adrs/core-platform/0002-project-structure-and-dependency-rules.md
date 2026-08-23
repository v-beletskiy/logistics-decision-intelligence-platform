# ADR-0002 — Project Structure and Dependency Rules

## Context

Core Platform is a modular monolith following Domain-Driven Design, CQRS, and
Hexagonal Architecture. Its structure must make bounded-context and module
ownership explicit without speculative layers or abstractions.

## Decision

### Source Structure

```text
src/
├── bounded-contexts/
│   └── <bounded-context>/
│       ├── app/                 # bounded-context orchestration
│       ├── domain/              # domain concepts shared by its modules
│       ├── infra/               # bounded-context transports and adapters
│       ├── composition/         # cross-module/public API wiring
│       ├── public-api/          # contracts offered to other contexts
│       └── modules/
│           └── <module>/
│               ├── app/
│               ├── domain/
│               ├── infra/
│               └── composition/     # cross-layer feature wiring
├── composition/                 # process composition roots
├── shared/
│   ├── app/
│   ├── domain/
│   ├── infra/
│   ├── modules/
│   └── utils/
└── cli/
```

Directories are optional and exist only when they contain real code.

`modules/` contains cohesive business capabilities.

### Ownership

- Module `domain/` owns its aggregates, entities, value objects, policies,
  events, error codes, and repository ports.
- Module `app/` owns use cases and outbound application ports.
- Module `infra/` owns adapters used only by that module.
- Bounded-context-level `domain/`, `app/`, and `infra/` contain concepts shared
  by multiple modules in that context.
- Root `shared/domain` is the deliberate cross-context Shared Kernel. It
  contains only concepts with identical meaning across contexts.
- Complete cross-cutting capabilities such as Access Control live under
  `shared/modules/`; they may contain their own `app`, `domain`, and `infra`.
- Generic cohesive utilities may remain under `shared/utils`; they are not
  fragmented solely to avoid a utility file.

### Public APIs Between Bounded Contexts

`public-api/` is owned by a bounded context, not by an individual module. It
contains only contracts deliberately offered to other in-process contexts:

- typed internal application events;
- query interfaces and their transport-independent result types.

It does not export concrete handlers, repositories, domain internals, or
infrastructure. Provider contracts use the provider's language. A consumer maps
them through a consumer-owned adapter in its own module infrastructure, for
example `infra/operational-workspace/`.

### Dependencies

```text
infra ──► app ──► domain
  │                  │
  └──── composition ─┘
```

- Domain depends only on its own context and the Shared Kernel.
- Application depends on Domain and application-owned ports.
- Infrastructure implements Domain and Application ports.
- Composition may depend on all layers but contains no business logic.
- Modules do not import another bounded context's internals. They use its
  `public-api`, a shared package contract, or an external transport.
- Applications under `apps/` never import from another application.

### Ports and Abstractions

- Aggregate repository ports remain in module `domain/`.
- Heterogeneous outbound Application capabilities, including read-store ports,
  are grouped in `app/ports/`. A query's input and normalized options remain
  in that query's folder.
- Port names describe capabilities, such as `RouteOptimizer` or
  `CostMatrixProvider`; neither a `Port` class suffix nor `.port.ts` is required.
- Narrow input/output types are colocated with the abstraction that owns them.
  A separate file is justified only when the concept is independently reusable
  or substantial.
- `Factory` and `Provider` suffixes are used only when the type performs those
  roles. E.g. `GrpcClientFactory` is valid because it owns extra creation logic -
  client creation and its connection/authentication concerns.
- Do not introduce an abstraction for a single implementation unless it
  protects an architectural boundary or a likely replacement point.

### Application and Domain Organization

- Commands and queries use one folder per use case when they have multiple
  files. Handlers expose `exec(...)`.
- Event handlers stay under `app/event-handlers/` and remain thin; substantial
  use cases are delegated to command handlers.
- Application inputs describe the exact use-case intent. Generic update bags
  with many optional `Details` fields are avoided.
- Domain files remain flat while cohesive. A folder is introduced when several
  files form a meaningful sub-area, not merely for one `events` or `policies`
  file.
- Multiple aggregate events may share `<aggregate>.events.ts`; a single event
  may use its own descriptive file.
- Policies express business decisions. Authorization policies remain in Access
  Control rather than Domain policy folders.

### Infrastructure Organization

Adapters are grouped first by technical boundary within their owning scope:

```text
infra/
├── http/
├── grpc/
├── messaging/
│   └── inbound/
├── persistence/
└── <external-context-or-provider>/
```

A broker subscription is a `Consumer`; `Worker` is reserved for process or
background-work lifecycle. Persistence follows ADR-0006.

### Composition

- `src/composition/` contains process roots such as API and Worker composition.
- Bounded-context composition wiring lives near that context.
- Feature modules that combine Application handlers with Infrastructure
  implementations live in the feature's `composition/`; `app/` and `domain/`
  do not contain Nest modules.
- Adapter-focused provider modules remain beside their adapter under `infra/`,
  such as `infra/persistence/` or `infra/grpc/`.
- Transport modules remain under the bounded context or module that owns the
  transport.
- Only implemented handlers and adapters are registered. Empty or placeholder
  use cases are not exposed through composition.

### Naming

- Folders and files use kebab-case; classes and types use PascalCase.
- Layer folders use `app`, `domain`, and `infra`.
- Transaction abstractions use `trx` in paths and identifiers.
- Common file suffixes include `.aggregate.ts`, `.entity.ts`,
  `.value-object.ts`, `.repository.ts`, `.policy.ts`, `.command.ts`, `.query.ts`,
  `.handler.ts`, `.controller.ts`, `.consumer.ts`, and `.module.ts`.

## Consequences

- Ownership and dependency direction are visible from paths.
- Bounded contexts can be extracted without much rework.
- Some concepts remain intentionally flat until their size warrants grouping.
- Composition and mapping code are explicit at architectural boundaries.
