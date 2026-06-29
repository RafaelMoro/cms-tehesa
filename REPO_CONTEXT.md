# Repository Context - store-tehesa-api

**Last Updated:** 2026-06-29

This repository is a Strapi 5 CMS/API for the Tehesa store catalog. It manages products, product variants, categories, brands, and small site-level content used by the storefront.

## Overview

**Tech Stack:**

- Strapi 5 (`@strapi/strapi` 5.31.0)
- Node.js `>=20.0.0 <=24.x.x`
- TypeScript for Strapi config/server code
- SQLite by default via `better-sqlite3`; MySQL/Postgres are supported by config
- npm lockfile (`package-lock.json`)

The app mostly uses Strapi core factories. Custom business logic currently lives in seed/maintenance scripts under `scripts/`, not custom controllers or services.

---

## High-Level Structure

```text
config/                 Strapi runtime config: server, DB, REST API, admin, middleware
src/api/                Strapi APIs and content-type schemas
src/components/shared/  Reusable Strapi components
src/index.ts            Strapi register/bootstrap hooks, currently empty
src/admin/              Admin-side TypeScript config, excluded from root TS build
scripts/                Seed, publish, clear, and catalog maintenance scripts
data/                   Local seed metadata and upload fixtures
database/migrations/    Empty migrations folder placeholder
types/                  Generated Strapi TypeScript types
```

---

## Content Model

### Collection Types

| Content Type | Schema File | Key Fields | Notes |
| --- | --- | --- | --- |
| `product` | `src/api/product/content-types/product/schema.json` | `name`, `description`, unique `customId`, `minPrice`, `maxPrice`, `variantCount`, `hasOneProductVariant` | Draft/publish enabled. Relates to variants, one brand, and one category. |
| `product-variant` | `src/api/product-variant/content-types/product-variant/schema.json` | `diameter`, required `quantity`, `material`, `packageQuantity`, `measurementUnit`, `internalId`, `pricing`, `stock` | Draft/publish enabled. Many-to-one relation to `product`. Contains fastener/head enum fields. |
| `category` | `src/api/category/content-types/category/schema.json` | `name`, unique `customId` | Draft/publish enabled. One-to-many relation to products. |
| `brand` | `src/api/brand/content-types/brand/schema.json` | `name`, unique `customId` | Draft/publish enabled. One-to-many relation to products. |

### Single Types

| Content Type | Schema File | Key Fields | Notes |
| --- | --- | --- | --- |
| `global` | `src/api/global/content-types/global/schema.json` | required `siteName`, required `siteDescription`, `favicon`, `defaultSeo` | Draft/publish disabled. |
| `about` | `src/api/about/content-types/about/schema.json` | `title`, dynamic zone `blocks` | Draft/publish disabled. Blocks currently allow `shared.media`. |

### Shared Components

| Component | File | Purpose |
| --- | --- | --- |
| `shared.pricing` | `src/components/shared/pricing.json` | Variant price data: required decimal `price`, optional `pricePromotion`. |
| `shared.seo` | `src/components/shared/seo.json` | Required SEO title/description plus optional image. |
| `shared.media` | `src/components/shared/media.json` | Single media file for images/files/videos. |
| `shared.details` | `src/components/shared/details.json` | Detail attributes and enums; currently not wired into product schemas. |
| `shared.category` | `src/components/shared/category.json` | Category enum component; currently not wired into product schemas. |

---

## API Layer

All current API controllers, services, and routes use Strapi core factories:

```text
factories.createCoreController(...)
factories.createCoreService(...)
factories.createCoreRouter(...)
```

Default REST routes are generated for:

- `/api/products`
- `/api/product-variants`
- `/api/categories`
- `/api/brands`
- `/api/global`
- `/api/about`

REST pagination defaults are set in `config/api.ts`:

- `defaultLimit: 25`
- `maxLimit: 100`
- `withCount: true`

GraphQL is installed as `@strapi/plugin-graphql`, but `config/plugins.ts` currently returns an empty config object.

---

## Runtime Configuration

`config/server.ts` defaults to `HOST=0.0.0.0` and `PORT=1337`.

Required local secrets are listed in `.env.example`:

```text
APP_KEYS
API_TOKEN_SALT
ADMIN_JWT_SECRET
TRANSFER_TOKEN_SALT
JWT_SECRET
ENCRYPTION_KEY
```

`config/database.ts` uses SQLite unless `DATABASE_CLIENT` is set. SQLite defaults to `.tmp/data.db`; MySQL and Postgres use the standard `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, SSL, pool, and timeout env vars.

Ignored local/runtime outputs include `.env`, `.tmp`, `.strapi`, `dist`, `build`, logs, and `public/uploads/*` except `.gitkeep`.

---

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` / `npm run develop` | Start Strapi in development with auto-reload. |
| `npm run start` | Start Strapi in production mode. |
| `npm run build` | Build/verify the Strapi admin and server compilation. |
| `npx tsc --noEmit` | Focused TypeScript check; there is no package script for this. |
| `npm run console` | Open Strapi console. |
| `npm run seed:transfer` | Run `strapi transfer`. |
| `npm run upgrade:dry` | Dry-run Strapi upgrade. |
| `npm run upgrade` | Run Strapi upgrade to latest. |

There are no configured `lint`, `test`, or `typecheck` scripts in `package.json`.

---

## Seed And Maintenance Scripts

The active product seed flow is split and order-dependent:

1. `npm run seed:start`
2. `npm run seed:products`

`seed:start` creates categories, brands, and products. `seed:products` creates product variants and links each variant to an existing product using `productCustomId`.

Important script behavior:

- `scripts/seed.js` reads categories/brands/global metadata from `data/data.json` but reads products from `../../tehesa-products/data` relative to `scripts/`.
- `scripts/seed-products-variants.js` reads variant JSON from the same external `../../tehesa-products/data` tree.
- Product files must be named like `products.<name>.json`; variant files are other `.json` files in the same subdirectories.
- Variant entries without `productCustomId` are skipped; variants whose `productCustomId` does not match an existing product are skipped.
- `npm run seed:clear` deletes product variants, products, brands, then categories. It is destructive for local seed data.
- `npm run publish:variants` publishes draft product variants.
- `npm run update-products-price-count` recalculates `minPrice`, `maxPrice`, and `variantCount` only for products in category customId `perforacion-accesorios-taladro`.
- `npm run seed:example` uses the Strapi starter/sample seed and references `article` and `author` content types that are not present in this app.

---

## TypeScript Notes

The root `tsconfig.json` compiles the Strapi server/config side and excludes:

- `src/admin/`
- `src/plugins/**`
- build/runtime directories
- test files

`src/admin/tsconfig.json` is separate, strict, and uses `moduleResolution: Bundler` with React JSX settings.

---

## CI And Release Flow

GitHub workflows are under `.github/workflows/`.

- `check-label.yml` runs on pull requests and fails unless the PR has one of `major`, `minor`, or `patch`.
- `develop-pipeline.yml` runs when PRs into `develop` close. If merged, it reuses the label check, bumps `package.json`/`package-lock.json` via `npm version`, creates a version tag, and prepends `CHANGELOG.md` with the PR details.
- CI setup uses Node 22.

---

## Key Files Reference

| File | Purpose |
| --- | --- |
| `package.json` | Scripts, dependencies, Node engine range, current app version. |
| `config/database.ts` | DB client selection and connection env mapping. |
| `config/api.ts` | REST pagination defaults. |
| `config/admin.ts` | Admin JWT/API token/transfer/encryption secret env usage. |
| `src/index.ts` | Strapi lifecycle hooks; currently no custom register/bootstrap logic. |
| `src/api/**/content-types/**/schema.json` | Source of truth for Strapi content types. |
| `src/components/shared/*.json` | Source of truth for reusable Strapi components. |
| `scripts/seed.js` | Category/brand/product seed script. |
| `scripts/seed-products-variants.js` | Product variant seed script. |
| `scripts/clear-seed-data.js` | Destructive local seed cleanup script. |
| `.env.example` | Required local secret names. |

---

## Practical Notes For Changes

- Prefer schema JSON changes for content model edits; Strapi generated types under `types/` may need regeneration by Strapi tooling after model changes.
- Preserve the `customId` fields because seed scripts and product/variant linking depend on them.
- Be careful changing enum values in `product-variant` because seed data may contain those exact string values.
- Use Strapi document IDs when creating relations in scripts; existing scripts map `customId` to `documentId` before creating relations.
- Do not treat `data/data.json` as the full product source; the active product/variant seed source is the sibling `tehesa-products` repository path.
