# AGENTS.md

## Commands
- Use npm in this repo: `package-lock.json` is committed; no pnpm/yarn workspace config is present.
- Start Strapi in dev with `npm run dev` or `npm run develop`; production start is `npm run start`.
- Build/verify the Strapi admin and server compilation with `npm run build`.
- There are no configured `lint`, `test`, or `typecheck` scripts; for a focused TS check use `npx tsc --noEmit`.

## Runtime And Data
- This is a Strapi 5 app (`@strapi/strapi` 5.31.0) targeting Node `>=20 <=24`; CI uses Node 22.
- Default DB is SQLite at `.tmp/data.db`; `config/database.ts` also supports MySQL/Postgres via `DATABASE_CLIENT` and related env vars.
- Required local secrets are listed in `.env.example`; `.env`, `.tmp`, `.strapi`, `dist`, `build`, and `public/uploads/*` are ignored.
- REST defaults are `defaultLimit: 25`, `maxLimit: 100`, and `withCount: true` in `config/api.ts`.

## Strapi Structure
- Server code is under `src/api`, `src/components`, `src/extensions`, and `src/index.ts`; `src/admin` is excluded from the root TS build and has its own `tsconfig.json`.
- Current content types are `product`, `product-variant`, `category`, `brand`, `global`, and `about`; controllers/services/routes mostly use Strapi core factories.
- Keep schema changes in the Strapi JSON schema files under `src/api/**/content-types/**/schema.json` and component schemas under `src/components/**`.

## Seed Scripts
- Current product seeding is split: run `npm run seed:start` before `npm run seed:products` so products exist before variants are linked by `productCustomId`.
- `seed:start` and `seed:products` read product JSON from `../../tehesa-products/data` relative to `scripts/`, not from this repo's `data/data.json`.
- `npm run seed:clear` deletes variants, products, brands, then categories; use it only when clearing local seed data is intended.
- `npm run publish:variants` publishes draft product variants; `npm run update-products-price-count` only updates products in category customId `perforacion-accesorios-taladro`.
- `npm run seed:example` is the Strapi starter/sample seed path and references `article`/`author` content types that are not present in the current app.

## CI And Releases
- PRs must carry one of `major`, `minor`, or `patch`; `.github/workflows/check-label.yml` fails without one.
- Merged PRs into `develop` trigger version bump/tag creation and prepend `CHANGELOG.md` via `.github/workflows/develop-pipeline.yml`.
