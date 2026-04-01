# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript/Rust monorepo for Datto RMM tooling — API clients, MCP server, and developer tools. Uses pnpm workspaces + Turborepo for build orchestration.

## Build & Development Commands

```bash
pnpm install              # Install dependencies
pnpm build                # Build all packages (turbo-orchestrated)
pnpm dev                  # Start development servers
pnpm test                 # Run all tests
pnpm lint                 # Lint all packages
pnpm typecheck            # TypeScript type checking

# Single package commands
pnpm --filter datto-rmm-api test          # Test API package only
pnpm --filter datto-rmm-api test:watch    # Watch mode for API tests
pnpm --filter datto-rmm-mcp-server build  # Build MCP server only
pnpm --filter @datto-rmm/docs dev         # Run docs site locally (port 4000)

# API generation
pnpm sync:openapi         # Fetch latest OpenAPI spec from Datto RMM
pnpm generate:api         # Regenerate TS/Rust clients from OpenAPI spec

# Rust
cargo test -p datto-api   # Run Rust tests
cargo clippy              # Rust linting
cargo fmt                 # Rust formatting

# AI docs sync
pnpm setup:claude         # Sync .ai-docs/ to .claude/ (after adding prompts/chatmodes)
pnpm validate:ai-docs     # Validate AI docs are in sync
```

## Architecture

```
apps/
  mcp-server/     # MCP server (datto-rmm-mcp-server) — 39+ tools for AI assistants
  docs/           # Starlight documentation site (@datto-rmm/docs)
packages/
  api/            # TypeScript API client (datto-rmm-api) — core library
crates/
  datto-api/      # Rust API client — async/await, OAuth 2.0
specs/
  datto-rmm-openapi.json  # Cached OpenAPI 3.1.0 spec (committed to git)
tooling/
  scripts/        # Build scripts (generate clients, sync specs, setup AI docs)
.ai-docs/         # Single source of truth for AI assistant configuration
```

**Dependency graph**: `mcp-server` depends on `api` package. Turbo handles build ordering automatically.

### Key Packages

**packages/api** — TypeScript client with auto-generated types from OpenAPI, OAuth 2.0 token management with concurrent request deduplication, supports all 6 Datto RMM platforms. Tests use Vitest (files colocated as `*.test.ts`).

**apps/mcp-server** — Model Context Protocol server exposing Datto RMM as tools. Tool modules live in `src/tools/` (account, alerts, audit, devices, sites, jobs, activity, variables, filters, system). Resources in `src/resources/`.

**crates/datto-api** — Rust client using progenitor for code generation at build time (`build.rs`). OpenAPI 3.1.0 support in progenitor is incomplete, so it provides client infrastructure but not fully auto-generated types yet.

### Generated Code

`packages/api/src/generated/types.ts` is auto-generated from the OpenAPI spec — never edit manually. Regenerate with `pnpm generate:api`.

### Platforms

Six Datto RMM platforms (Pinotage, Merlot, Concord, Vidal, Zinfandel, Syrah) all share the same API schema. Platform config is in `packages/api/src/platforms.ts` and `crates/datto-api/src/platforms.rs`.

## Code Style

- **TypeScript**: Strict mode, explicit types for public APIs, `unknown` over `any`, type imports (`import type { Foo }`)
- **Naming**: Files in kebab-case, classes/types in PascalCase, functions/variables in camelCase, constants in SCREAMING_SNAKE_CASE
- **Node.js**: v22+ (see `.nvmrc`)
- **Package manager**: pnpm 9.14.2+

## Commits

Conventional commits enforced via commitlint + husky:
- **Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Scopes**: api, mcp-server, rust, docs, specs, ci, deps, config, tests, repo
- **Breaking changes**: Use `!` suffix or `BREAKING CHANGE:` footer

## Documentation

Two documentation systems:
- **AI docs** (`.ai-docs/`): Instructions, plans, and context for AI assistants — single source of truth, synced to `.claude/` via `pnpm setup:claude`
- **Human docs** (`apps/docs/`): Starlight site for developers — every new feature must include documentation here

Architecture plans live in `.ai-docs/plans/`. Check existing plans before making significant changes.

## Workflow

1. Check `.ai-docs/plans/` for existing architecture decisions before starting
2. For significant changes, create a plan in `.ai-docs/plans/`
3. Run `pnpm lint` and `pnpm typecheck` before committing
4. Include documentation changes in the same PR as code changes
