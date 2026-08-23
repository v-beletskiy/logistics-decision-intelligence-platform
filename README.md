## Documentation

The project documentation is organized into multiple areas:

- [Vision](docs/vision.md) and [capability map](docs/capability-map.md)
- [Architecture Decision Records](docs/architecture/adrs/)
- [C4 architecture](docs/architecture/c4/) maintained in LikeC4
- [Domain design](docs/domain/) covering strategic and tactical models

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

Core Platform starts one role per process through `PROCESS_ROLE`: `api` serves
HTTP/gRPC transports and `worker` runs background consumers.

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

`JSON_SCHEMA_BASE_URI` is the stable HTTPS namespace for JSON Schema identities. Use
an organization-owned domain in deployed environments and keep the value stable
across environments once contracts are published.

### Local authentication

Core Platform signs short-lived access tokens with ES256. Generate a local key
pair outside the repository, encode the PEM files as single-line base64 values,
and set `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` in
`apps/core-platform/.env`. Never commit private keys.

```bash
openssl ecparam -name prime256v1 -genkey -noout \
  | openssl pkcs8 -topk8 -nocrypt -out /tmp/ldi-jwt-private.pem
openssl pkey -in /tmp/ldi-jwt-private.pem -pubout \
  -out /tmp/ldi-jwt-public.pem
base64 < /tmp/ldi-jwt-private.pem | tr -d '\n'
base64 < /tmp/ldi-jwt-public.pem | tr -d '\n'
```

After migrations complete, provision the first tenant administrator through the
CLI. The password is passed through the environment rather than process
arguments:

```bash
INITIAL_ADMIN_PASSWORD='use-a-local-secret-manager' \
  pnpm docker:admin:provision -- \
  --tenant-id 00000000-0000-4000-8000-000000000010 \
  --email admin@example.com
```

Local login is `POST /api/v1/auth/tokens`. There is no public registration
endpoint.

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

After changing repository SQL, first start the development stack so PostgreSQL
and migrations are ready, then generate bindings:

```bash
pnpm docker:up
pnpm docker:db:codegen
```

`docker:db:codegen` runs pgTyped in a temporary Core Platform container and
writes the generated `*.queries.ts` files to your local checkout. Review and
commit both the source `.sql` and generated `.queries.ts` files.

## Production

The production docker image contains the application and migration runner, but no
database or broker. Run migrations as a deployment/release job before starting
the application against managed infrastructure.
