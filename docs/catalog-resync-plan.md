# Catalog resync plan (products-tehesa → Strapi)

Audit date: 2026-09-18. Seed source: `/home/rafael/projects/tehesa/products-tehesa` @ `ea8a11e` (v1.6.0).
Local DB: `.tmp/data.db`, seeded 2026-07-08 (products-tehesa v1.2.0). Nothing has been changed yet — this is the plan.

## Findings

### Seed path is broken
- `scripts/seed.js:9` and `scripts/seed-products-variants.js:9` read `../../tehesa-products/data`. That directory does not exist; the repo is `products-tehesa`. Both scripts throw `ENOENT` at load. `AGENTS.md` repeats the wrong name.
- Categories and brands do **not** come from products-tehesa — they come from this repo's `data/data.json`. Products/variants come from products-tehesa.

### Categories — 5 missing, 1 unused
Schema is flat (no parent relation). Fastener "subcategories" are the `product.subcategory` enum under `tornilleria`.

| customId | seed products / variants | in data.json + DB |
|---|---|---|
| abrasivos-discos-corte | 1 / 5 | **missing** |
| abrasivos-herramientas-desbaste | 1 / 26 | **missing** |
| herramientas-maquinado | 2 / 28 | **missing** |
| herramientas-marcado | 2 / 11 | **missing** |
| sellado-taponado | 1 / 8 | **missing** |
| abrasivos | 0 / 0 | present, unused |
| other 15 (tornilleria, herramientas-corte-conformado, perforacion-accesorios-taladro, llaves-herramientas-apriete, roscado-herramientas-roscas, carburo, sujecion, calibrador, adhesivos-selladores, extraccion-reparacion-fijaciones, herramientas-impacto-forja, equipo-seguridad, herrajes-accesorios-cable, herramientas-diagnostico-electricidad, lubricantes-multifuncionales) | — | OK, names match |

Effect today: 7 products (78 variants) sit in the DB with `category = null` because `seed.js:224` maps unknown customIds to null. Display names for the 5 new categories exist nowhere — must be authored.

### Brands — Volkel missing
`data.json`/DB have 7: weston, king-tony, bohrcraft, bondhus, cleveland (name typo "Clevaland"), precision, libre.
Seed data uses 8 — **`volkel` (60 products, 740 variants) is missing** → all Volkel products have `brand = null`. Plus 5 products gained a brand after July (bondhus ×2, weston ×3) and are still null. 67 null-brand products in DB total.
2 products have `_missing_brand: "TODO"` (`broca-avv-zanco-1-2-118`, `broca-aav-zanco-1-2-118-thunderbit`) — brand unknown in both repos.

### Products & variants drift
- DB: 333 products / 9044 variants (all published). Seed: 334 products / 8583 effective variants.
- Since the July seed (products-tehesa v1.3.0–v1.6.0, PRs #51–#56): Weston, Precision, Bohrcraft, King Tony, Cleveland, Bondhus, Volkel all revalidated. 2 new products (`cortador-vertical-av-4f-lgo-weston`, `juego-brocas-cobalto-fraccionales-weston`), 39 variant price changes, 45 products with changed `minPrice/maxPrice`, ~95 variants removed/renamed (Bohrcraft/Bondhus internalId rewrites), 31 added.
- **Scripts are create-only** (`documents().create()`, no lookup). Re-running `seed:products` would duplicate every variant (no unique key on variants). Incremental update is not viable → full reseed.
- **Duplicate-file bug**: `seed-products-variants.js:21-28` loads every non-`products.*` JSON in a folder instead of only the `_file` each product references. This is why the DB has doubled variants for `insertos-elicoil-std-volkel` (72 vs 36), `broca-zco-recto-acero-av-bohrcraft` (150 vs 75), `juego-brocas-acero-av-25-pzas-bohrcraft` (4 vs 2). Those stray files were since deleted upstream, but `products-tehesa/data/tornillos/tornilleria-hex-int-cab-cilindrica-din-912.json` (361 rows, unreferenced, identical to `tornilleria-hex-int-cab-baja.json`) is still there and will double `tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912` again.
- `scripts/clear-seed-data.js:278-280`: `deleteProducts/Brands/Categories` are commented out — `seed:clear` currently deletes variants only, contrary to AGENTS.md.
- Schema mismatches (silently dropped, harmless): product keys `_file`, `_line_excel`, `_missing_brand`, `_check`; variant `description` (188 non-empty values, no attribute on `product-variant`).
- One invalid variant: `sujecion/clamp-accion-pestillo-weston.json` internalId `CH-40344` has no `diameter` (required) → rejected.
- Public permissions are re-created on every seed run (`seed.js:240`, `seed-products-variants.js:205`); DB already has 15–20 duplicate rows per action.

## Execution plan

### A. Data fixes (products-tehesa)
1. Delete `data/tornillos/tornilleria-hex-int-cab-cilindrica-din-912.json` (unreferenced duplicate).
2. Add `diameter` to `CH-40344` in `data/sujecion/clamp-accion-pestillo-weston.json`.
3. Optional: resolve the 2 `_missing_brand` products if the brand is known.

### B. Script/config fixes (this repo)
1. `scripts/seed.js:9`, `scripts/seed-products-variants.js:9`: `'../../tehesa-products/data'` → `'../../products-tehesa/data'`. Fix `AGENTS.md` line.
2. `data/data.json`: add brand `{ "customId": "volkel", "name": "Volkel" }`; add the 5 categories (`abrasivos-discos-corte`, `abrasivos-herramientas-desbaste`, `herramientas-maquinado`, `herramientas-marcado`, `sellado-taponado`) with names; fix "Clevaland" → "Cleveland"; drop unused `abrasivos` (or keep if wanted as a parent-like label — schema has no parents, so it would stay empty).
3. `scripts/seed-products-variants.js`: load only each product's `_file` instead of globbing the folder (prevents future duplicate-file doubling). Alternative: rely on A.1 only.
4. `scripts/clear-seed-data.js:278-280`: uncomment `deleteProducts/Brands/Categories` so `seed:clear` is a full wipe.
5. Optional: guard permission creation with a findOne so re-runs don't duplicate `up_permissions` rows.

### C. Reseed (local)
```
npm run seed:clear      # full wipe after B.4 — irreversible for .tmp/data.db
npm run seed:start      # categories + brands (data.json), products (products-tehesa)
npm run seed:products   # variants, created published
npm run draft:variants  # expect 0 drafts
```
Expected: 334 products, 8583 variants, 0 null categories, null brand only on the 2 `_missing_brand` products. `update-products-price-count` is not needed (values ship in the JSON).

### D. Production
`npm run transfer:prod` (`strapi transfer --to $STRAPI_TRANSFER_URL`) overwrites remote content with the local DB. Run only after C is verified. `documentId`s change on reseed; `customId`s are stable — check the frontend doesn't cache documentIds.

## Open questions
- Display names for the 5 new categories.
- Brand for the 2 `_missing_brand` drill bits.
- Keep or drop the empty `abrasivos` category.
