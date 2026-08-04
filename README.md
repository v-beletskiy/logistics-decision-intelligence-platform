## Documentation

The project documentation is organized into multiple areas:

- **MVP** — the first end-to-end delivery scope and its explicit exclusions
- **C4** — software architecture (LikeC4 DSL)
- **ADRs** — Architecture Decision Records
- **Domain** — Domain-Driven Design documentation (Markdown and Excalidraw)

### C4 Diagrams

The architecture is maintained using LikeC4.

After modifying any `.c4` files, regenerate the rendered diagrams:

```bash
pnpm c4:export
```

Commit both the `.c4` sources and the generated diagrams.

### Domain Documentation

DDD diagrams are maintained as `.excalidraw` files. Can preview and edit via Excalidraw IDE extensions.

After modifying an Excalidraw diagram, export it as an **SVG** with the **same filename** and save it alongside the source file. This allows the diagrams to be previewed directly on GitHub while keeping the editable Excalidraw source under version control.

Example:

```text
context-map.excalidraw
context-map.svg
```

Commit both the `.excalidraw` source and the exported `.svg`.

## Local Development

Development is container-first. Docker Compose runs every application under
`apps/` together with local PostgreSQL and RabbitMQ. PostgreSQL is a development dependency only. Production deployments provide `DATABASE_URL` for a managed PostgreSQL service.

Prerequisites: Docker Desktop (or Docker Engine) and Docker Compose 2.22 or
newer for Compose Watch.

For each app create the environment file. Located at each app root (under `apps/<app>/.env`).
These files are supplied to the applications by Docker Compose.

Start the local stack:

```bash
pnpm docker:up
```

On a fresh checkout, and after changing a Protobuf contract, generate the gRPC
TypeScript sources:

```bash
pnpm grpc:generate
```

Compose waits for PostgreSQL to become healthy, runs database migrations as a
one-shot service, and starts Core Platform only after migrations complete.

Compose Watch synchronizes application source and configuration files, then
restarts Core Platform cleanly. Dependency manifests and Dockerfiles trigger image rebuilds. An application's
`.env` is deliberately excluded from both the image and source synchronization.
After changing it, recreate the relevant container so Docker reloads `env_file`.

Stop the stack without deleting development data:

```bash
pnpm docker:down
```

After adding a migration while the stack is running, apply it with:

```bash
pnpm docker:db:migrate
```

Build the production Core Platform image independently:

```bash
pnpm docker:build:core-platform
```

## Production

The production docker image contains the application and migration runner, but no
database or broker. Run migrations as a deployment/release job before starting
the application against managed infrastructure.
