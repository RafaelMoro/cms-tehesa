# Catalog resync plan (products-tehesa → Strapi)

Audit date: 2026-09-18. Seed source: `/home/rafael/projects/tehesa/products-tehesa` @ `bdf7a69` (post v1.6.0).
Local DB: `.tmp/data.db`, seeded 2026-07-08 (products-tehesa v1.2.0). Phase B applied 2026-09-18; note the local DB got an extra 8,525 variants from an accidental script run and must be cleared (phase C) before use.

## Findings

### Seed path is broken
- `scripts/seed.js:9` and `scripts/seed-products-variants.js:9` read `../../tehesa-products/data`. That directory does not exist; the repo is `products-tehesa`. Both scripts throw `ENOENT` at load. `AGENTS.md` repeats the wrong name.
- Categories and brands do **not** come from products-tehesa — they come from this repo's `data/data.json`. Products/variants come from products-tehesa.

### Categories — 2 missing
Schema is flat (no parent relation). Fastener "subcategories" are the `product.subcategory` enum under `tornilleria`.
`abrasivos-discos-corte`, `abrasivos-herramientas-desbaste`, `herramientas-maquinado` were dropped from the seed (`c29cf65`, `36035aa`, `0b15096`..`bdf7a69`): their 4 products now use `carburo` / `herramientas-corte-conformado`, both already in DB. `abrasivos` is now empty in the seed (`products.abrasivos.json` is `[]`).

| customId | seed products / variants | in data.json + DB |
|---|---|---|
| herramientas-marcado | 2 / 11 | **missing** |
| sellado-taponado | 1 / 8 | **missing** |
| abrasivos | 0 / 0 | present, unused |
| other 15 (tornilleria, herramientas-corte-conformado, perforacion-accesorios-taladro, llaves-herramientas-apriete, roscado-herramientas-roscas, carburo, sujecion, calibrador, adhesivos-selladores, extraccion-reparacion-fijaciones, herramientas-impacto-forja, equipo-seguridad, herrajes-accesorios-cable, herramientas-diagnostico-electricidad, lubricantes-multifuncionales) | — | OK, names match |

Effect today: 7 products sit in the DB with `category = null` because `seed.js:224` maps unknown customIds to null. Display names for the 2 new categories exist nowhere — must be authored.

| DB product (category = null) | seed category now |
|---|---|
| `punta-montada-rosa-weston` | carburo |
| `discos-corte-weston`, `avellanador-weston`, `avellanador-juego-6f-weston` | herramientas-corte-conformado |
| `marcador-valve-action`, `marcador-hp-proline` | herramientas-marcado (missing) |
| `tapon-dry-seal` | sellado-taponado (missing) |

### Brands — Volkel missing
`data.json`/DB have 7: weston, king-tony, bohrcraft, bondhus, cleveland (name typo "Clevaland"), precision, libre.
Seed data uses 8 — **`volkel` (60 products, 740 variants) is missing** → all Volkel products have `brand = null`. 67 null-brand products in DB total; seed now has **0** products without a brand (`_missing_brand` / empty `brandCustomId` grep is clean @ `34cbf38`).

| DB products with brand = null | seed brand now | seed file |
|---|---|---|
| 60 `*-volkel` products (dado-tarraja-*, machuelo-*, juego-machuelos-*, kit-reparador-roscas-*, maneral-*, insertos-elicoil-std-volkel, extension-machuelos-volkel, punzon-rompe-arrastre-volkel) | volkel (missing in data.json) | `herramientas-corte-conformado/products.*.json` (45), `roscado-herramientas-roscas/products.*.json` (14), `extraccion_reparación_fijaciones/products.*.json` (1) |
| `juego-brocas-acero-av-fraccionales`, `juego-brocas-av-metricas-25-pzas`, `juego-brocas-cobalto-metricas-25-pzas` | weston | `perforacion-accesorios-taladro/products.perforacion-accessorios-taladro.json` |
| `juego-llaves-allen-std-mm`, `juego-llaves-torx` | bondhus | `llaves-herramientas-apriete/products.*.json` |
| `broca-avv-zanco-1-2-118`, `broca-aav-zanco-1-2-118-thunderbit` | removed from seed (`72a85ac`) | — delete from DB |

Handoff for products-tehesa: nothing left to fix for brands. All null brands are a store-tehesa-api side issue (add `volkel`, reseed).

### Products & variants drift
- DB: 333 products / 9044 variants (all published). Seed: 332 products.
- Since the July seed (products-tehesa v1.3.0–v1.6.0 + `2355754`..`bdf7a69`): Weston, Precision, Bohrcraft, King Tony, Cleveland, Bondhus, Volkel all revalidated. 3 new products (`cortador-vertical-av-4f-lgo-weston`, `juego-brocas-cobalto-fraccionales-weston`, `clamp-pestillo-weston`), 3 removed (`broca-avv-zanco-1-2-118`, `broca-aav-zanco-1-2-118-thunderbit`, `juego-llaves-hexagonales-l-mm-largas`), 39 variant price changes, 45 products with changed `minPrice/maxPrice`, ~95 variants removed/renamed (Bohrcraft/Bondhus internalId rewrites), 31 added.
- **Scripts are create-only** (`documents().create()`, no lookup). Re-running `seed:products` would duplicate every variant (no unique key on variants). Incremental update is not viable → full reseed.
- **Duplicate-file bug**: `seed-products-variants.js:21-28` loads every non-`products.*` JSON in a folder instead of only the `_file` each product references. This is why the DB has doubled variants for `insertos-elicoil-std-volkel` (72 vs 36), `broca-zco-recto-acero-av-bohrcraft` (150 vs 75), `juego-brocas-acero-av-25-pzas-bohrcraft` (4 vs 2). Those stray files were since deleted upstream, but `products-tehesa/data/tornillos/tornilleria-hex-int-cab-cilindrica-din-912.json` (361 rows, unreferenced, identical to `tornilleria-hex-int-cab-baja.json`) is still there and will double `tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912` again.
- `scripts/clear-seed-data.js:278-280`: `deleteProducts/Brands/Categories` are commented out — `seed:clear` currently deletes variants only, contrary to AGENTS.md.
- Schema mismatches (silently dropped, harmless): product keys `_file`, `_line_excel`, `_missing_brand`, `_check`; variant `description` (188 non-empty values, no attribute on `product-variant`).
- Public permissions are re-created on every seed run (`seed.js:240`, `seed-products-variants.js:205`); DB already has 15–20 duplicate rows per action.

## Execution plan

### A. Data fixes (products-tehesa)
1. Delete `data/tornillos/tornilleria-hex-int-cab-cilindrica-din-912.json` (unreferenced duplicate).
2. Verify `data/sujecion/clamp-pestillo-weston.json` `CH-40344` now has a `diameter` (it was split out in `34cbf38`; the old row lacked one and would be rejected by the schema).

### B. Script/config fixes (this repo)
1. `scripts/seed.js:9`, `scripts/seed-products-variants.js:9`: `'../../tehesa-products/data'` → `'../../products-tehesa/data'`. Fix `AGENTS.md` line.
2. `data/data.json`: add brand `{ "customId": "volkel", "name": "Volkel" }`; add categories `herramientas-marcado` and `sellado-taponado` with names; fix "Clevaland" → "Cleveland".
3. `scripts/seed-products-variants.js`: load only each product's `_file` instead of globbing the folder (prevents future duplicate-file doubling). Alternative: rely on A.1 only.
4. `scripts/clear-seed-data.js:278-280`: uncomment `deleteProducts/Brands/Categories` so `seed:clear` is a full wipe.
5. Optional: guard permission creation with a findOne so re-runs don't duplicate `up_permissions` rows.

### C. Reseed (local)
```
npm run seed:clear      # full wipe after B.4 — irreversible for .tmp/data.db
npm run seed:start      # categories + brands (data.json), products (products-tehesa)
npm run seed:products   # variants
npm run publish:all     # publish any drafts: categories → brands → products → variants
npm run draft:variants  # expect 0 drafts
```
Expected: 332 products, 0 null categories, 0 null brands. `update-products-price-count` is not needed (values ship in the JSON).

### D. Production
`npm run transfer:prod` (`strapi transfer --to $STRAPI_TRANSFER_URL`) overwrites remote content with the local DB. Run only after C is verified. `documentId`s change on reseed; `customId`s are stable — check the frontend doesn't cache documentIds.

## Open questions
- Display names for `herramientas-marcado` and `sellado-taponado`.
- ~~Keep or drop `abrasivos`~~ → dropped.

## Action items
- [x] `data/data.json`: add categories `herramientas-marcado` and `sellado-taponado`, drop `abrasivos` (`marcador-valve-action`, `marcador-hp-proline`, `tapon-dry-seal` depend on them).
- [x] `data/data.json`: add brand `volkel` (60 products / 740 variants currently `brand = null`).
- [x] Fix seed path `../../tehesa-products/data` → `../../products-tehesa/data` in both seed scripts + AGENTS.md.
- [x] `seed-products-variants.js`: load only `_file` per product (or delete the stray `tornilleria-hex-int-cab-cilindrica-din-912.json` upstream).
- [x] `clear-seed-data.js`: uncomment product/brand/category deletes.
- [ ] Reseed local (section C), verify counts, then `transfer:prod`.
