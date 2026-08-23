# ADR-0001 — Web Application Administration Module

## Context

The platform needs user management, access control, feature flags, audit logs,
and system settings. Their initial scope does not justify a separate frontend.

## Decision

Administrative capabilities are implemented as a module within the primary Web
Application. A separate Admin Portal is not introduced initially.

## Consequences

- Authentication, navigation, UI components, and deployment infrastructure are
  reused.
- Administrative and operational functionality share one frontend deployment.
- The module may be extracted into a dedicated portal if its scope or operating
  model diverges materially.
