# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Strapi 5 (`@strapi/strapi` 5.31.0, TypeScript, Node 20–24) headless CMS/API for the Tehesa store catalog. `AGENTS.md` and `REPO_CONTEXT.md` hold more detail (content-model field tables, key-file reference); keep all three consistent when the model or scripts change.

## Commands

Use npm (`package-lock.json` is committed).

- `npm run dev` — Strapi with auto-reload (admin at `http://localhost:1337/admin`)
- `npm run build` — compiles server TS + admin panel; this is the closest thing to a full verification step
- `npx tsc --noEmit` — focused TS check (no `lint`/`test`/`typecheck` scripts exist; there are no tests)
- `npm run start` — production start (used by the Docker image)
- `npm run console` — Strapi REPL

Seed / maintenance (all `scripts/*.js`, run via `node`, hit the local Strapi DB directly):

- `npm run seed:start` then `npm run seed:products` — order matters: products must exist before variants are linked by `productCustomId`
- `npm run seed:clear` — destructive: deletes variants → products → brands → categories
- `npm run publish:all` / `publish:variants` — publish drafts (`scripts/publish-content.js` takes model names as args)
- `npm run draft:variants` — list unpublished variants
- `npm run update-products-price-count` — recomputes `minPrice`/`maxPrice`/`variantCount`, but only for category `perforacion-accesorios-taladro`
- `npm run transfer:prod` — `strapi transfer` to the remote instance using `STRAPI_TRANSFER_URL`/`STRAPI_TRANSFER_TOKEN` from `.env`
- `npm run seed:example` — Strapi starter seed; references `article`/`author` types that don't exist here. Ignore.

## Architecture

**Everything in `src/api` is Strapi core factories** (`createCoreController/Service/Router`) with no custom logic, `src/index.ts` has empty `register`/`bootstrap`, and `src/extensions` is empty. The real business logic lives in `scripts/` and in the schema JSON. Schema files (`src/api/**/content-types/**/schema.json`, `src/components/shared/*.json`) are the source of truth; `types/generated/` is Strapi output.

Content model:
- `category` ⇢ `product` ⇢ `product-variant` (one-to-many each way down); `brand` ⇢ `product`. All four are draft/publish collection types. `global` and `about` are single types.
- `product`, `category`, `brand` each have a unique `customId` string. This is the join key the seed scripts and the sibling data repo use — never rename or drop it.
- `product` carries denormalized aggregates from its variants (`minPrice`, `maxPrice`, `variantCount`, `hasOneProductVariant`); they are computed by scripts, not by lifecycle hooks, so schema/data changes to variants leave them stale until a script runs.
- Categories are flat. Fastener "subcategories" are the `product.subcategory` enum, not category rows.
- `product-variant` has enum fields (`screwHeadType`, `fastenersComponents`); seed JSON contains these exact strings, so changing enum values breaks seeding.
- `shared.details` and `shared.category` components exist but are not wired into any schema.

Seed data sources (two different places):
- Categories, brands and `global` come from this repo's `data/data.json`.
- Products and variants come from the sibling repo at `../products-tehesa/data` (resolved as `../../products-tehesa/data` from `scripts/`). Each subdirectory has one `products.<name>.json`; each product's `_file` names its variant JSON. Variants without a matching `productCustomId` are skipped with a warning. Products whose category `customId` isn't in `data/data.json` get `category = null` silently — see `docs/catalog-resync-plan.md`.
- Scripts map `customId → documentId` before creating relations; use Strapi document IDs, not numeric IDs, when writing new scripts.

Config: REST pagination is `defaultLimit 25 / maxLimit 100 / withCount` (`config/api.ts`); GraphQL plugin is enabled with the same limits, `depthLimit 7`, and introspection gated by `GRAPHQL_INTROSPECTION` (`config/plugins.ts`). DB is SQLite at `.tmp/data.db` unless `DATABASE_CLIENT` is set.

## Deployment

Production is Docker Compose (Strapi + Postgres 16 + Caddy) on a 512 MB AWS Lightsail box; `.github/workflows/deploy-lightsail.yml` builds the image to GHCR on push to `develop` and SSHes in to `docker compose up`. The Dockerfile sets `NODE_OPTIONS=--max-old-space-size=3072` because the admin build OOMs otherwise. Full step-by-step is in `docs/lightsail-deployment-runbook.md`; data is pushed to prod with `npm run transfer:prod`, not by re-seeding.

## CI / release

- Every PR needs exactly one of the labels `major`, `minor`, `patch` or `check-label.yml` fails.
- Merging into `develop` runs `develop-pipeline.yml`: `npm version` bump, git tag, and a prepended entry in `CHANGELOG.md`. Don't bump `package.json` version or edit `CHANGELOG.md` by hand.
