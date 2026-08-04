# gRPC contracts

Protocol Buffers are the source of truth for Core Platform and AI Platform inter-service APIs.

This package contains only language-neutral `.proto` source contracts. It owns
the contract module, formatting, linting, and breaking-change policy.

Each consuming service owns its language-specific Buf generation configuration
and generates its own client/server stubs from this source. Generated artifacts
are build outputs and must not be edited.

- Core Platform generates TypeScript `grpc-js` stubs with
  `pnpm grpc:generate`.
- The AI Platform must generate Python stubs in its own build from this same
  module.
