# Product images plan

Date: 2026-09-19. Products: 332 in `../products-tehesa/data` @ current HEAD. Images: 196 Cloudinary webp URLs (base `https://res.cloudinary.com/dov7g4avx/image/upload/`), organized by category folder. Image names are **product-type** slugs, not `customId`s, so the map below is by hand and one image often serves several products.

## 1. How the image gets into Strapi

Images already live on Cloudinary — no upload step. Store the URL as a string.

1. Schema: add `"imageUrl": { "type": "string" }` to `src/api/product/content-types/product/schema.json` (and `AGENTS.md`/`REPO_CONTEXT.md` field tables). No media-library field, no Cloudinary provider: nothing to sync, nothing to back up, no extra RAM on the 512 MB box.
2. Mapping file: `data/product-images.json` — `{ "<customId>": "<full URL>" }`, one line per product, built from section 2. Same shape as `data/data.json`, keyed by `customId` like every other script.
3. Script: `scripts/set-product-images.js` (`npm run images:products`) — loads the map, `strapi.documents('api::product.product').findMany({ filters: { customId: { $in: ids } } })`, then `update({ documentId, data: { imageUrl }, status: 'published' })` per product. Idempotent; logs customIds missing in DB and DB products without a URL. Reuse the bootstrap pattern of `scripts/update-price-variant-count-products.js`.
4. Prod: run `npm run build` (schema change), `npm run images:products` locally, then `npm run transfer:prod`. Do **not** reseed.
5. Optional later: put `imageUrl` in the products-tehesa `products.*.json` so a full reseed carries it. Skipped now — the map lives here and the seed is create-only anyway.

Frontend fallback: products without `imageUrl` should render a category placeholder; don't invent a fallback in the API.

## 2. Image → product map

Confidence: ✓ exact match, ~ same product type (shared image), ? guess — verify before shipping.

### carburo
| image | customId | conf |
|---|---|---|
| lima-sc | lima-rotativa-weston | ~ (SC/SD/SF/SG are shapes; pick one per product) |
| lima-sd | lima-rotativa-doble-corte-weston | ~ |
| lima-sf, lima-sg | — | unused (shape variants) |

### extraccion-reparacion-fijaciones
| image | customId | conf |
|---|---|---|
| insertos-helicoil | insertos-elicoil-std-volkel, insertos-elicoil-milim-weston | ✓ |
| insertos-roscado-con-ranura | inserto-roscado-bohrcraft | ✓ |

### herramientas-corte-conformado
| image | customId | conf |
|---|---|---|
| avellanador-3-filos | avellanador-weston | ✓ |
| avellanador-3-filos | avellanador-juego-6f-weston | ? (6F set, image is 3 flutes) |
| rima-recta-maquina | rima-recta-maquina-h8-weston, rima-maquina-h8-weston, rima-flauta-recta-aav-h7-weston | ~ |
| laina-metrica-inoxidable | laina-acero-inoxidable-150mm-1-25m-precision, laina-acero-inoxidable-6pul-50pul-precision | ~ |
| laina-fraccional-metrica | laina-acero-6pul-100pul-precision, laina-acero-150mm-2-5m-precision | ~ |
| laina-azul-templado | laina-acero-azul-templado-precision, laina-acero-azul-templado-5pul-precision | ✓ |
| escariador-caja | escareador-tornillo-allen-acero-av-bohrcraft | ~ |
| cortador-vertical-tin | cortador-vertical-4f-titanio-weston, cortador-vertical-carburo-ctian-weston, cortador-vertical-radial-carburo-altin-weston | ~ |
| buril-redondo | buriles-redondo-av-weston | ✓ |
| buril-momax-cobalto | buriles-cuadrados-cobalto-cleveland | ✓ (Mo-Max = Cleveland) |
| buril-cobalto-8-porciento | buriles-cobalto-co8-weston | ✓ |
| buril-calzado-punta-60, buril-calzado-punta-80, buril-calzado-punta-cuadrada, buril-corte-izquierdo, buril-corte-derecho, sierra-cinta, rima-ajustable | — | no product |

### llaves-herramientas-torque (category `llaves-herramientas-apriete`)
| image | customId | conf |
|---|---|---|
| llave-torx-larga | llave-tipo-torx-larga-bondhus | ✓ |
| llave-torx | llave-tipo-torx-corta-bondhus | ✓ |
| llave-allen-punta-bola-metrica-fraccional | llave-hexagonal-std-punta-de-bola-bondhus, llave-hexagonal-mm-punta-de-bola-bondhus | ✓ |
| llave-allen-brazo-largo | llave-hexagonal-mm-larga-recta-bondhus, llave-hexagonal-std-larga-recta-bondhus | ✓ |
| llave-allen | llave-hexagonal-mm-corta-recta-bondhus, llave-hexagonal-std-corta-bondhus | ✓ |
| jgo-llave-torx | juego-llaves-torx | ✓ |
| jgo-llave-allen-brazo-largo-metrico | juego-llaves-allen-std-mm | ~ |
| jgo-llave-torx-larga, jgo-llave-punta-bola-fraccional, jgo-llave-allen-punta-bola-metrica, llave-allen-t-metrica, llave-allen-t-fraccional, llave-torx-t, goldguard, colorguard, plateado, extra-largas | — | no product (finishes / T-handles are not in the seed) |

### perforacion-accesorios-taladro
| image | customId | conf |
|---|---|---|
| broca-fraccional-zanco-recto | broca-zco-recto-acero-av-weston-inches, broca-zco-recto-acero-av-weston, broca-zco-recto-acero-av-weston-number, broca-zanco-recto-acero-av-weston-abc, broca-zco-recto-acero-av-mims-weston, broca-zco-recto-acero-av-bohrcraft, broca-aav-135-split-point, broca-aav-135-split-point-thunderbit | ~ |
| broca-concreto-sds | broca-concreto-sds-weston, broca-wp-zanco-sds-plus-weston | ✓ |
| broca-concreto | broca-concreto-weston, broca-para-concreto-diager | ✓/~ |
| broca-concreto-booster | broca-wp-concreto-weston | ? |
| broca-cobalto | broca-zco-recto-cobalto-bohrcraft, broca-zco-recto-cobalto-weston-inches, broca-zco-recto-cobalto-weston-m-measure | ✓ |
| broca-centro | broca-centro-acero-av-weston | ✓ |
| broca-carburo-TiAlN | broca-carburo-solido-m13-tialn-bohrcraft | ✓ |
| broca-carburo-solido | broca-carburo-solido-weston | ✓ |
| jgo-escariadores-metrico | insertos-elicoil-std-juego-6-escareadores-tornillo-allen-acero-av-bohrcraft | ~ |
| jgo-brocas-metrica | juego-brocas-av-metricas-25-pzas, juego-brocas-acero-av-25-pzas-bohrcraft | ✓ |
| jgo-brocas-fraccional | juego-brocas-acero-av-fraccionales, jgo-brocas-acer-av-std-numericas-alfabetica-115-pzas-weston, jgo-brocas-av-alfabeticas-26-pzas-weston, jgo-brocas-av-numericas-60-pzas-weston | ✓/~ |
| jgo-brocas-cobalto | juego-brocas-cobalto-metricas-25-pzas, juego-brocas-cobalto-fraccionales-weston | ✓ |
| broca-zanco-media-pulgada | broca-av-zanco-weston-inches, broca-av-zanco-weston-metric, broca-zanco-1-2-cobalto-weston | ✓ |
| broca-zanco-conico | broca-zco-conico-inches-number-weston | ✓ |
| broca-vidrio | broca-punta-carburo-tungsteno-weston | ? |
| broca-larga | broca-larga-acero-av-bohrcraft, broca-extra-larga-acero-av-bohrcraft, broca-larga-tl-weston, broca-larga-av-weston, broca-larga-tl-inches-weston, broca-larga-aav-wp-black-silver-weston | ~ |
| jgo-broca-zanco-media, broca-multiusos | — | no product |

### roscado-herramientas-roscas (products split across `herramientas-corte-conformado` and `roscado-herramientas-roscas`)
| image | customId | conf |
|---|---|---|
| machuelo-nps-volkel | machuelo-nps-aav-volkel | ✓ |
| machuelo-npt-volkel | machuelo-npt-aav-volkel | ✓ |
| machuelo-npt-weston | machuelo-npt-aav-weston, machuelo-npt-ac-weston | ✓ |
| machuelo-maquina-volkel | machuelo-maquina-mm-aav-volkel, machuelo-maquina-fraccional-aav-volkel, machuelo-maquina-acero-inox-agujeros-pasados-mm-volkel, machuelo-maquina-acero-inox-agujeros-pasados-fracc-volkel, machuelo-maquina-acero-inox-agujeros-ciegos-mm-volkel, machuelo-maquina-acero-inox-agujeros-ciegos-fracc-volkel | ~ |
| machuelo-helicoidal-banda-blanca | machuelo-maquina-helice-35-volkel | ? |
| machuelo-l-coil-volkel | machuelo-l-coil-fraccional-aav-volkel, machuelo-l-coil-aav-milimetrico-volkel, machuelo-fino-l-coil-fraccional-aav-volkel | ✓ |
| machuelo-bsp-volkel | machuelo-bsp-aav-volkel, machelo-bsp-aav-conico-volkel, machelo-bsp-aav-recto-volkel | ✓ |
| machuelo-semiconico-volkel | machuelo-milimetrico-aav-semiconico-volkel, machuelo-fraccional-aav-semiconico-volkel, machuelos-izq-semiconicos-aav-volkel, machuelos-izq-fraccionales-semiconicos-aav-volkel | ✓ |
| machuelo-semiconico-weston | machuelo-plug-ac-weston | ✓ |
| kit-reparador-rosca | kit-reparador-roscas-bohrcraft, kit-reparador-roscas-fracc-volkel, kit-reparador-roscas-milim-volkel, kit-reparador-roscas-taller-volkel, kit-reparador-roscas-milim-weston | ~ |
| jgo-machuelo-weston | jgo-machuelo-ac-weston, juego-machuelos-ac-3-piezas-weston | ✓ |
| jgo-machuelo-fino-2-pasos-volkel | juego-machuelos-fraccionales-aav-2-piezas-volkel, juego-machuelos-milimetrico-aav-2-piezas-finos-volkel, juego-machuelos-izq-fraccionales-aav-2-piezas-volkel | ✓ |
| jgo-3-machuelo-volkel | juego-machuelos-fraccionales-aav-3-piezas-volkel, juego-machuelos-izq-fraccionales-aav-3-piezas-volkel, juego-machuelos-izq-milimetricos-aav-3-piezas-volkel, juego-machuelos-aav-milimetricos-tipo-europeo-volkel | ✓ |
| jgo-2-machuelo-volkel | juego-machuelos-otros-volkel | ? |
| jgo-2-machuelo-bsp-volkel | juego-machuelos-bsp-aav-2-piezas-volkel, juego-machuelos-bsp-av-2-piezas-bohrcraft | ✓/~ |
| extractor-tornillos | extractor-tornillos-diager-saravia | ✓ |
| dado-tarraja-volkel | dado-tarraja-ajustable-fracc-aav-fino-volkel, dado-tarraja-ajustable-fracc-aav-volkel, dado-tarraja-ajustable-milim-aav-fino-volkel, dado-tarraja-ajustable-milim-aav-volkel, dado-tarraja-izquierdo-aav-volkel, dado-tarraja-izquierdo-milim-aav-volkel, dado-tarraja-mm-aav-volkel, dado-tarraja-ajustable-bohrcraft, dado-tarraja-izquierdo-aav-bohrcraft | ~ |
| dado-npt-volkel | dado-tarraja-npt-aav-volkel | ✓ |
| dado-bsp-volkel | dado-tarraja-bsp-aav-volkel, dado-tarraja-bsp-aav-bohrcraft | ✓/~ |
| punzo-rompe-arrastre-volkel-1 | punzon-rompe-arrastre-volkel | ✓ (-7 unused) |
| maneral-tipo-garrote-volkel | manerales-para-machuelos-volkel | ~ (also maneral-machuelo-T-volkel; one product, pick one) |
| maneral-extractor-volkel | maneral-extractor-volkel | ✓ |
| maneral-dado-tarraja-volkel | maneral-para-insertar-volkel | ? (check variants; "insertar" may be the helicoil tool, not a die holder) |
| machuelo-maquina-volkel (fallback) | machelo-conico-milimetricos-av-tipo-europeo-volkel, machelo-conico-milimetricos-av-fino-volkel, machelo-recto-milimetricos-av-tipo-europeo-volkel, machelo-recto-milimetricos-aav-fino-volkel, machuelo-fraccional-aav-conico-volkel, machuelo-fraccional-aav-conico-fino-volkel, machuelo-fraccional-aav-recto-volkel, machuelo-fraccional-aav-recto-fino-volkel, machuelos-izq-* (7), machuelo-izq-conicos-aav-volkel | ? (no cónico/recto image exists; decide fallback or leave empty) |
| jgo-extractor-tornillos, maneral-tipo-garrote, maneral-tipo-garrote-surtek, maneral-machuelo-t-weston, maneral-dado-tarraja, maneral-dado-tarraja-weston, punzo-rompe-arrastre-volkel-7 | — | no product |

### sujecion
| image | customId | conf |
|---|---|---|
| nudo-galvanizado | nudo-para-cable-maleable-weston | ✓ |
| remache-ancha-inox | remache-pop-ancha-acero-inoxidable-304 | ✓ |
| remache-corta-inox | remache-pop-corta-acero-inoxidable-304 | ✓ |
| clamp-accion-vertical | clamp-accion-vertical-manija-recta-barra-u-weston | ✓ |
| clamp-accion-horizontal | clamp-accion-horizontal-barra-u-weston | ✓ |
| clamp-accion-lineal | clamp-accion-lineal-weston | ✓ |
| clamp-accion-jalar | clamp-accion-jalar-weston | ✓ |
| abrazadera-sin-fin | abrazadera-weston | ✓ |
| argolla-carga | tornillo-ojo-forjado-weston | ? |
| taquete-z, taquete-tx, taquete-plastico, taquete-arpon, sujetador-mariposa, armellas, abrazadera-alta-presion | — | no product |

### suministros-maquinado
| rayador-carburo | rayador-carburo-saravia | ✓ |
|---|---|---|

### tornilleria
| image | customId | conf |
|---|---|---|
| taquete-arpon-inox | taquete-arpon-acero-inoxidable-304 | ✓ |
| varilla-inoxidable | varilla-rosc-acer-inox-304-3ft, varilla-rosc-din-975-acer-inox-304-1mt | ✓ |
| accesorio-neopreno | accesorios-epdm-pija-punta-de-broca, accesorios-epdm-calidad-plus-pija-punta-de-broca | ✓ |
| opresor-allen-inox | opresor-hexagono-interior-punta-copa-acero-inoxidable-304, opresor-hexagono-interior-punta-copa-din-916-acero-inoxidable | ✓ |
| opresores/opresor-allen | opresor-hexagono-interior-punta-copa-std, opresor-punta-copa-mm-din-916-std | ✓ |
| pernos/perno-solido | perno-solido-rectificado-mm, perno-solido-rectificado-inches | ✓ |
| pija-multiusos-negra | pija-multiusos-phillips-negra | ✓ |
| pija-lamina | pija-cabeza-plana-phillips-lamina-galvanizada, pija-cabeza-hexagonal-para-lamina | ~ |
| pija-k-lath-punta-broca | pija-k-lath-punta-broca-galvanizado-galaxy | ✓ |
| pija-k-lath-ab-galv | pija-k-lath-punta-aguda-galvanizada | ✓ |
| pija-hexagonal-punta-broca | pija-galvanizada-galaxy-cabeza-hexagonal-punta-broca, pija-galvanizada-cabeza-hexagonal-punta-broca-calidad | ✓ |
| pija-cabeza-hexagonal-punta-broca | pija-410-punta-broca-cabeza-hexagonal-acero-inoxidable | ? |
| pija-hexagonal-madera | pija-galvanizada-cabeza-hexagonal-madera | ✓ |
| pija-hexagonal-acc | juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-calidad-plus, juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-galaxy | ✓ |
| pija-fijadora | pija-galvanizada-punta-fijadora-combinada, pija-cabeza-fijadora-combi-latonada | ✓ |
| pija-cabeza-plana-inox | pija-304-cabeza-plana-phillips-acero-inoxidable | ✓ |
| pija-cabeza-fijadora-inox | pija-304-cabeza-fijadora-phillips-acero-inoxidable | ✓ |
| rondana-presion-negra | rondana-de-presion-negra, rondana-de-presion-metrica-negra-din-127 | ✓ |
| rondana-presion-inox | rondana-de-presion-acero-inoxidable-304-std, rondana-de-presion-din-127-acero-inoxidable-304 | ✓ |
| rondana-presion-galvanizada | rondana-de-presion-galvanizada | ✓ |
| rondana-plana-inox | rondana-plana-acero-inoxidable-304, rondana-plana-din-125-acero-inoxidable-304 | ✓ |
| rondana-f-36 | rondana-f-436-negra | ✓ |
| tornillo-cabeza-plana-ranurado-inox | tornillo-cabeza-plana-ranurado-din-963-acero-inoxidable-304-metrico | ✓ |
| tornillo-cabeza-plana-phillips-inox | tornillo-cabeza-plana-ranurado-phillips-acero-inoxidable-304 | ✓ |
| tornillo-cabeza-plana-phillips-galvanizado | tornillo-cabeza-plana-phillips-galvanizado, tornillo-cabeza-plana-phillips-metrico-din-965 | ✓ |
| tornillo-cabeza-gota-inox | tornillo-cabeza-gota-ranurado-combinado-acero-inoxidable-304 | ✓ |
| tornillo-cabeza-gota-combinado-galvanizado | tornillo-cabeza-gota-combinado-galvanizado | ✓ |
| tornillo-cabeza-coche-galvanizado | tornillo-cabeza-coche-grado-2-galvanizado | ✓ |
| tornillo-coche-inox | tornillo-cabeza-coche-acero-inoxidable-304 | ✓ |
| tornillo-allen-milimetrico | tornillo-hexagono-interior-cabeza-baja-metrico | ~ |
| tornillo-allen-guia | tornillo-hexagono-interior-guia-std, tornillo-hexagono-interior-guia | ✓ |
| tornillo-allen-cilindrico | tornillo-hexagono-interior-cabeza-cilindrica, tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912, tornillo-hexagono-interior-cabeza-baja-cilindrica | ✓ |
| tornillo-alen-cilindrico-inox | tornillo-hex-int-cab-cil-din-912-acer-inox-304-mm, tornillo-hex-int-cab-cil-acer-inox-304 | ✓ |
| tornillo-allen-cabeza-plana | tornillo-hexagono-interior-cabeza-plana-metrico-din-7991, tornillo-hexagono-interior-cabeza-plana-std | ✓ |
| tornillo-allen-cabeza-plana-inox | tornillo-hex-int-cab-plana-acer-inox-304, tornillo-hex-int-cab-plana-din-7991-acer-inox-304-mm | ✓ |
| tornillo-allen-cabeza-boton | tornillo-hexagono-interior-cabeza-boton-std, tornillo-hexagono-interior-cabeza-boton | ✓ |
| tornillo-allen-boton-inox | tornillo-hex-int-cab-bot-acer-inox-304-metrico, tornillo-hex-int-cab-bot-acer-inox-304 | ✓ |
| tapon-dry | tapon-dry-seal | ✓ (category `sellado-taponado`) |
| tornillo-hexagonal-milimetrico | tornillo-cabeza-hexagonal-cl-8-8-din-933-931, tornillo-cabeza-hexagonal-cl-8-8-fino-din-960-96 | ✓ |
| tornillo-hexagonal-inox | tornillo-cabeza-hexagonal-din-933-931-acero-inoxidable-304, tornillo-cabeza-hexagonal-cuerda-corrida-acero-inoxidable-304 | ✓ |
| tornillo-hexagonal-grado-5 | tornillo-cabeza-hexagonal-grado-5-negro-fino, tornillo-cabeza-hexagonal-grado-5-negro-unc, tornillo-cabeza-hexagonal-grado-8-negro-fino, tornillo-cabeza-hexagonal-grado-8-negro-std | ✓/~ (grade 8 shares it) |
| tornillo-hexagonal-galvanizado | tornillo-maquina-cabeza-hexagonal-grado-2-cda-corrida-galvanizado | ✓ |
| tornillo-fijador-inox | tornillo-cabeza-fijadora-ranurado-din-85-acero-inoxidable-304-metrico | ✓ |
| tornillo-cabeza-queso-inoxidable | tornillo-cabeza-queso-din-84-acero-inoxidable-304-metrico | ✓ |
| tornillo-cabeza-queso | tornillo-cabeza-queso-ranurado-din-84-metrico | ✓ |
| tuerca-tino | tuerca-tino-4-puntas-galv-nc-nf | ✓ |
| tuerca-nylon | tuerca-inserto-nylon-galvanizada-nf, tuerca-inserto-nylon-galv-nc, tuerca-inserto-nylon-din-985-galv | ✓ |
| tuerca-inserto-inox | tuerca-hexagonal-inserto-nylon-acero-inoxidable-304-std, tuerca-hexagonal-inserto-nylon-fina-acero-inoxidable-304, tuerca-hexagonal-inserto-nylon-inoxidable-304-milimetrica | ✓ |
| tuerca-metrica | tuerca-hexagonal-metrica-din-934-negra | ✓ |
| tuerca-mariposa | tuerca-mariposa-forjada-galvanizada | ✓ |
| tuerca-mariposa-inox | tuerca-mariposa-acer-inox-304 | ✓ |
| tuerca-hexagonal-inox | tuerca-hexagonal-din-934-acer-inox-304, tuerca-hexagonal-nc-nf-acer-inox-304 | ✓ |
| tuerca-hexagonal-grado-5 | tuerca-hexagonal-grado-5-nc-pav, tuerca-hexagonal-grado-5-nf-pav, tuerca-hexagonal-grado-8-nc-pav | ✓/~ |
| tuerca-hexagonal-grado-2-negra | tuerca-hexagonal-liviana-grado-2-nc-negra | ✓ |
| tuerca-galvanizada | tuerca-hexagonal-liviana-grado-2-nc-galv | ✓ |
| tuerca-gripco | tuerca-gripco-grado-c-galv-nc-nf | ✓ |
| tuerca-flange | tuerca-flange-aserra-galv-metr, tuerca-flange-aserra-galv-estandar | ✓ |
| tuerca-cople | tuerca-cople-galvanizada | ✓ |
| tuerca-bellota | tuerca-bellota-niquelada-nc-nf | ✓ |
| tuerca-bellota-inox | tuerca-bellota-acer-inox-304 | ✓ |
| tuerca-2h | tuerca-2h-negra | ✓ |
| tuerca-acme-1 | tuerca-hexagonal-rosca-acme-grado-2-negra-forjada | ~ |
| tuerca-acme-2 | tuerca-hexagonal-rosca-acme-gdo-2-negr-maquinada | ~ |
| varilla-acme | varilla-acme-1mt | ✓ |
| varilla-87 | varilla-negra-b7-1mt | ✓ (B7) |
| varilla-grado-5 | varilla-grad-5-1mt-neg | ✓ |
| varilla-galvanizada-1m-3m | varilla-grad-2-galv-1mt, varilla-grad-2-galv-3mt | ✓ |
| opresor-ranurado-pivote, opresor-ranurado-balin, opresor-allen-resorte, opresor-allen-pivote, opresor-allen-balin, perno-roscado, pija-hexagonal-punta-aguda, pija-durock, accesorio-pija-inox, rondana-seguridad, rondana-plana-metrica, rondana-plana-galvanizada, tuerca-resorte | — | no product |

## 3. Products with no image (need a photo or an explicit fallback)

Format: `customId` — brand.

### adhesivos-selladores (whole category)
- loctite-243-fijador-de-roscas-resistencia-removible-50-ml — weston
- loctite-495-adhesivo-instantaneo-super-bonder-20-gr — weston

### calibrador (whole category)
- calibrador-gage-angulo-corte-rosca-acero-inoxidable-weston — weston
- calibrador-gage-cuerda-60-weston — weston
- calibrador-gage-cuerdas-acme-weston — weston
- contador-hilos-weston — weston
- cuenta-hilos-metrico-weston — weston

### carburo
- punta-montada-rosa-weston — weston
- juego-puntas-diamante-weston — weston
- juego-limas-diamantadas-weston — weston
- cortador-anular-titanio-weston — weston
- cortador-desbaste-cobalto-4f-weston — weston
- cortador-vertical-av-2f-weston — weston
- cortador-vertical-av-4f-weston — weston
- cortador-vertical-av-4f-lgo-weston — weston
- cortador-vertical-av-milimetrico-weston — weston
- cortador-vertical-bola-av-2f-weston — weston
- cortador-vertical-carburo-4f-weston — weston
- cortador-vertical-carburo-milimetrico-weston — weston
- cortador-vertical-cobalto-4f-weston — weston
- cortador-vertical-ext-lgo-4f-weston — weston
- cortador-vertical-radial-carburo-4f-weston — weston

### equipo-seguridad (whole category)
- lente-general-tricolor-ansi-weston — weston

### herramientas-corte-conformado
- discos-corte-weston — weston
- machuelo-ac-weston — weston
- machuelo-bsp-av-weston — weston
- rima-perno-conico-weston — weston
- buriles-incor-k-42 — cleveland
- juego-machuelos-aac-cleveland — cleveland
- juego-machuelos-aav-cleveland — cleveland
- machuelo-aav-npt-cleveland — cleveland
- extension-machuelos-bohrcraft — bohrcraft
- juego-machuelos-av-bohrcraft — bohrcraft
- machuelo-npt-av-bohrcraft — bohrcraft
- machuelo-sti-av-bohrcraft — bohrcraft
- extension-machuelos-volkel — volkel
- Volkel cónico/recto/izquierdo machuelos (flagged `?` in section 2, no matching image):
  - machelo-conico-milimetricos-av-fino-volkel — volkel
  - machelo-conico-milimetricos-av-tipo-europeo-volkel — volkel
  - machelo-recto-milimetricos-aav-fino-volkel — volkel
  - machelo-recto-milimetricos-av-tipo-europeo-volkel — volkel
  - machuelo-fraccional-aav-conico-volkel — volkel
  - machuelo-fraccional-aav-conico-fino-volkel — volkel
  - machuelo-fraccional-aav-recto-volkel — volkel
  - machuelo-fraccional-aav-recto-fino-volkel — volkel
  - machuelo-izq-conicos-aav-volkel — volkel
  - machuelos-izq-con-finos-volkel — volkel
  - machuelos-izq-fracc-rectos-aav-volkel — volkel
  - machuelos-izq-fraccionales-conicos-aav-volkel — volkel
  - machuelos-izq-rectos-aav-volkel — volkel
  - machuelos-izq-rectos-finos-volkel — volkel

### herramientas-diagnostico-electricidad (whole category)
- probador-circuito-6-24v — king-tony

### herramientas-impacto-forja (whole category)
- martillo-estilo-aleman — king-tony
- martillo-reparacion-hojalateria — king-tony

### herramientas-marcado (whole category)
- marcador-hp-proline — weston
- marcador-valve-action — weston

### llaves-herramientas-apriete
- 1-2-dr-dado-punta-spline — king-tony
- 1-2-punta-bristol-cromado — king-tony
- dado-cuadro-1-2-corto-estrella — king-tony
- dado-cuadro-1-2-de-cuadro — king-tony
- dado-cuadro-1-2-estrella-largo — king-tony
- dado-cuadro-1-2-punta-bristol-60mm — king-tony
- dado-cuadro-1-2-punta-bristol-80mm — king-tony
- dado-cuadro-1-2-punta-bristol-de-seguridad — king-tony
- dado-cuadro-1-2-punta-bristol-m-measure — king-tony
- dado-cuadro-1-2-punta-ribe — king-tony
- dado-cuadro-1-2-punta-torx-larga — king-tony
- dado-cuadro-1-2-punta-torx-segmento-corto — king-tony
- dado-cuadro-1-llanta-trasera-capuchon — king-tony
- dado-impacto-cuadro-1-2-17mm-6-puntas — king-tony
- llave-banda-60x140 — king-tony
- llave-estrias-golpe — king-tony
- llave-gancho-ajustable-13-35mm — king-tony
- llaves-combinadas-matraca-cambio — king-tony
- matraca-cuadro-1-2-cabeza-articulado — king-tony
- pinza-presion-c-6 — king-tony
- pinza-presion-curva-cromada — king-tony
- punta-cinco-estrellas-cuadro — king-tony

### lubricantes-multifuncionales (whole category)
- wd-40-aerosol — weston

### perforacion-accesorios-taladro
- arbol-para-broquero-weston — weston
- boquilla-cono-morse-weston — weston
- broquero-ajustable-weston — weston
- broquero-con-llave-y-montaje-weston — weston
- broquero-jacobs-con-llave-weston — weston
- broquero-jacobs-weston — weston
- llave-jacobs-weston — weston
- moleteador-weston — weston
- super-broquero-embalado-con-llave-weston — weston

### roscado-herramientas-roscas
- maneral-para-insertar-volkel — volkel (only if the `maneral-dado-tarraja-volkel` `?` guess is wrong)

### sujecion
- clamp-accion-pestillo-weston — weston
- clamp-pestillo-weston — weston

### tornilleria
- tornillo-ojo-forjado-weston — weston (only if the `argolla-carga` `?` guess is wrong)
- varilla-rosc-cl-4.8-neg-1mt-mm — libre (fallback: varilla-87)
- varilla-rosc-cl-8.8-neg-1mt-mm — libre (fallback: varilla-87)

Rough count: ~215 products mapped (≈95 `✓`, rest shared/guessed), ~115 without an image.

## 4. Steps

1. Review every `?` and `~` row; fix the map in this file.
2. Generate `data/product-images.json` from sections 2 (one node one-liner over this table, or by hand — ~215 lines).
3. Add `imageUrl` to the product schema; `npm run build`.
4. Write `scripts/set-product-images.js`, add `images:products` to `package.json`, run it, check the count of updated vs. missing.
5. Update `AGENTS.md` / `REPO_CONTEXT.md` / `CLAUDE.md` script list and field table.
6. `npm run transfer:prod`.
7. Shoot / source photos for section 3 (category placeholders in the frontend meanwhile).
