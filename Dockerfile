# syntax=docker/dockerfile:1
# ============================================================================
# Multi-stage build for the dcsa-ual npm-workspaces monorepo.
# Base image pinned by tag per TechArch §2.7 (digest pinning is added when the
# image is first resolved on the build host).
# ============================================================================

# ── build stage ────────────────────────────────────────────────────────────
FROM node:22.11-bookworm-slim AS build
WORKDIR /app

# Copy the root manifests and every workspace manifest first so the dependency
# layer caches independently of source churn.
COPY package.json package-lock.json ./
COPY tsconfig.base.json tsconfig.json ./
COPY packages/db/package.json packages/db/
COPY packages/migrate/package.json packages/migrate/

# npm ci — never npm install — for a reproducible install from the lockfile
# (TechArch §2.10 rule 3). devDependencies are required to build (§4 runtime
# contract): do NOT set NODE_ENV=production here.
RUN npm ci

# Copy sources and build every workspace package.
COPY packages ./packages
RUN npm run build

# ── runtime stage ──────────────────────────────────────────────────────────
FROM node:22.11-bookworm-slim AS runtime
WORKDIR /app

# node_modules and built output from the build stage.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages ./packages

# No default CMD: each compose service supplies its own command (TechArch §15.2).
