# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.18.1

FROM node:${NODE_VERSION}-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable

WORKDIR /workspace

RUN chown node:node /workspace


FROM base AS dependencies

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY --chown=node:node apps/core-platform/package.json apps/core-platform/package.json
COPY --chown=node:node packages/contracts/package.json packages/contracts/package.json

USER node

RUN --mount=type=cache,id=pnpm-store-v11,target=/pnpm/store,uid=1000,gid=1000,sharing=locked \
  pnpm install --frozen-lockfile


FROM dependencies AS development

COPY --chown=node:node . .

ENV NODE_ENV=development

EXPOSE 3000

CMD ["pnpm", "--filter", "@logistics-decision-intelligence/core-platform", "dev"]


FROM dependencies AS build

COPY --chown=node:node . .

RUN pnpm turbo run build --filter=@logistics-decision-intelligence/core-platform...

RUN pnpm \
  --filter @logistics-decision-intelligence/core-platform \
  --prod \
  deploy /workspace/deploy/core-platform


FROM node:${NODE_VERSION}-bookworm-slim AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build --chown=node:node /workspace/deploy/core-platform ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT ?? '3000') + '/health/ready').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"]

CMD ["node", "dist/main.js"]