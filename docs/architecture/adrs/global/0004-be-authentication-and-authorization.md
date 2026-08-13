# ADR-0004 — Authentication & Authorization

## Context

The platform backend consists of:

- **Core Platform** (NestJS), acting as the system entry point and API Gateway.
- **AI Platform** (Python), communicating with the Core Platform through gRPC and asynchronous Integration Events.

The platform must:

- authenticate both users and internal services;
- support Google OAuth and local authentication;
- provide fine-grained authorization;
- support multi-tenancy;
- allow future extraction of the Administration Bounded Context into an independent IAM service.

---

## Decision

### Administration Bounded Context

Authentication and identity management belong to the **Administration** Bounded Context.

Administration Bounded Context owns:

- User management;
- Role assignment;
- Authentication;
- Session management (Refresh Tokens);
- JWT issuance;
- Google OAuth integration.

Administration does **not** own authorization execution. Authorization is evaluated locally inside each Bounded Context using the shared Access Control module.

---

### Authentication

The platform uses **JWT Bearer Authentication**.

Authentication is performed through:

- local username/password authentication;
- Google OAuth.

Regardless of authentication mechanism, the platform always issues its own JWT Access Token and Refresh Token.

External identity provider tokens are never propagated through the system.

JWTs are transmitted using the **Authorization Bearer** header.

---

### Refresh Tokens

The platform uses Refresh Tokens with **rotation**.

Access Tokens remain stateless and short-lived.

Refresh Tokens:

- are stored hashed;
- are rotated on every refresh;
- can be revoked;
- support future device-based logout.

Refresh Token persistence belongs to the Administration Bounded Context.

Future versions may introduce device management and per-device logout.

---

### Identity

Authentication produces an application-level **Identity** object.

Identity is the only security object visible to the Application Layer.

Identity represents both human users and internal services.

```text
Identity

id (userId | serviceId)

type (USER | SERVICE)

tenantId?

roles?

scopes?
```

The Application Layer never depends on:

- JWT;
- NestJS Request;
- HTTP;
- gRPC metadata.

Controllers (or transport adapters) translate transport-specific authentication into Identity before invoking application use cases.

---

### User JWT

User JWTs contain only stable identity information.

Example claims:

```text
sub
tenantId
roles
type = USER
```

Permissions are **not** embedded inside JWTs.

---

### Service JWT

Internal services authenticate using JWTs obtained through the Client Credentials flow.

Example claims:

```text
sub = ai-platform
aud = core-platform
scopes = [route-analysis.read]
type = SERVICE
```

Service JWTs are validated exactly like User JWTs.

All synchronous inter-service communication requires Service JWT authentication.

---

### Authorization

Authorization follows a hybrid Role-Based and Attribute-Based Access Control (RBAC + ABAC) model. Roles define broad capabilities through static permissions, providing a manageable and scalable permission model, while policies evaluate contextual constraints using identity and resource attributes to make fine-grained authorization decisions.

Authorization is **deny-by-default**.

Every authenticated Application use case must explicitly authorize the requested operation before executing business behavior.

Authorization is performed before invoking Aggregate behavior.

Example:

```text
Handler

↓

AccessManager.authorize()

↓

Aggregate.execute()
```

---

### Permission Catalog

Permissions are static application capabilities.

Examples:

```text
recommendation.accept

recommendation.reject

route.read

route.update

optimization.execute
```

Permissions are defined in code under:

```text
shared/
└── access-control/
    └── permissions/
```

Permission dynamicmanagement is outside the scope of Version 1.

---

### Policy Catalog

Policies define contextual authorization constraints.

Examples:

- Dispatcher may accept Recommendations only within their Region.
- Planner may execute Optimizations only within their Tenant.
- Administrators may manage all resources.

Policies are implemented using **CASL**.

Policy definitions remain static in Version 1.

---

### Shared Access Control

Authorization infrastructure is shared across all Bounded Contexts.

```text
shared/

├── access-control/
    ├── identity/
    ├── authorization/
    │   ├── access-manager.ts
    │   └── authorization.exceptions.ts
    │
    ├── roles/
    ├── permissions/
    ├── policies/
    ├── casl/
    │   ├── ability.factory.ts
    │   ├── casl-access-manager.ts
    │   └── conditions/
    └── jwt/
```

Responsibilities:

- Identity abstraction;
- Permission catalog;
- Policy catalog;
- Authorization abstraction;
- CASL implementation;
- JWT abstractions.

Administration owns identity data.

Shared Access Control owns authorization evaluation.

---

### Authorization Boundaries

Authentication determines **who** is performing an action.

Authorization determines **whether** the action is allowed.

Business rules determine **whether the domain state transition is valid**.

Example:

```text
Authentication

↓

Identity

↓

Authorization

↓

Application Use Case

↓

Domain
```

Example:

Dispatcher attempts to accept a Recommendation.

Authorization verifies:

- Recommendation.Accept permission;
- DispatcherRegionPolicy.

Domain verifies:

- Recommendation is Pending;
- Recommendation has not expired;
- Recommendation has not already been accepted.

The Domain never knows users, roles, permissions, tenants, or JWTs.

---

### Multi-Tenancy

The platform supports multi-tenancy. Tenant represents a customer company.

Identity contains: `tenantId`

The authenticated transport boundary creates `ExecutionContext` from the Identity. Handlers receive it through `ExecutionRequest<T>` and pass its tenant scope explicitly to tenant-scoped repository and read-store operations. The PostgreSQL tenant data model and relational isolation constraints are defined by [ADR-0006](0006-be-persistence-architecture.md).

PostgreSQL Row-Level Security (RLS) is **not used** as duplicate enforcement. The database is responsible only for data integrity. Authorization is enforced in the Application Layer.

---

### Service-to-Service Communication

Internal services authenticate using Service JWTs.

The Core Platform validates:

- signature;
- issuer;
- audience;
- expiration;
- scopes.

Service scopes follow the Principle of Least Privilege. E.g. AI Platform receives only the permissions required for its responsibilities.

---

### Identity Propagation

#### Synchronous

Identity is propagated through Service JWTs.

#### Asynchronous

Integration Events include:

```text
tenantId

initiatedByUserId
```

The AI Platform does not authenticate as users.

It processes tenant-scoped requests initiated by users.

---

## Future Evolution

The Administration Bounded Context is designed so it can later be extracted into a dedicated IAM service without affecting Application or Domain logic.

Future versions may additionally introduce:

- device management;
- per-device logout;
- distributed tracing through Correlation ID and Causation ID propagation;
- audit trail;
- permission administration.

---

## Consequences

### Benefits

- Clear separation between Authentication, Authorization and Domain.
- Transport-independent Application Layer.
- Fine-grained authorization through permissions and policies.
- Consistent authentication model for both users and services.
- Future extraction of IAM without architectural changes.

### Trade-offs

- Additional authorization infrastructure.
- Policy implementation introduces moderate complexity.
