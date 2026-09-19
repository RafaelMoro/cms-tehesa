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

Confidence: ✓ exact match, ~ same product type (shared image), ? guess — verify before shipping. `✓ confirmed` = reviewed by Tehesa. `not registered` = image exists but the product is not in the catalog.

### carburo
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| lima-sc | lima-rotativa-weston | ST-2-200-003, ST-2-200-005, ST-2-200-007… | ✓ confirmed |
| lima-sd | lima-rotativa-doble-corte-weston | ST-1-199-003, ST-1-199-004, ST-1-199-025… | ✓ confirmed |

### extraccion-reparacion-fijaciones
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| insertos-helicoil | insertos-elicoil-std-volkel, insertos-elicoil-milim-weston | TEV-08302, TEV-08304, TEV-08205… / SB-200-020 | ✓ |
| insertos-roscado-con-ranura | inserto-roscado-bohrcraft | BC-4601-300, BC-4601-400, BC-4601-500… | ✓ |

### herramientas-corte-conformado
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| avellanador-3-filos | avellanador-weston | ST-5-660-6015, ST-5-660-6020, ST-5-660-6035… | ✓ |
| avellanador-3-filos | avellanador-juego-6f-weston | ST-5-660-6088, ST-5-660-8288, ST-5-660-9088 | ✓ confirmed |
| rima-recta-maquina | rima-recta-maquina-h8-weston, rima-maquina-h8-weston, rima-flauta-recta-aav-h7-weston | ST-8-015-005, ST-8-015-010, ST-8-015-015… / ST-8-019-040, ST-8-019-055, ST-8-019-065… / ST-8-015-403, ST-8-015-406, ST-8-015-409… | ✓ confirmed |
| laina-metrica-inoxidable | laina-acero-inoxidable-150mm-1-25m-precision, laina-acero-inoxidable-6pul-50pul-precision | PB-22971, PB-22972, PB-22973… / PB-22125, PB-22L2, PB-22195… | ✓ confirmed |
| laina-fraccional-metrica | laina-acero-6pul-100pul-precision, laina-acero-150mm-2-5m-precision | PB-16130, PB-16195, PB-16245… / PB-16971, PB-16972, PB-16973… | ✓ confirmed |
| laina-azul-templado | laina-acero-azul-templado-precision, laina-acero-azul-templado-5pul-precision | PB-07000, PB-09000, PB-10000 / PB-23130 | ✓ |
| escariador-caja | escareador-tornillo-allen-acero-av-bohrcraft | BC-1707-300, BC-1707-400, BC-1707-500… | ✓ confirmed |
| cortador-vertical-tin | cortador-vertical-4f-titanio-weston, cortador-vertical-carburo-ctian-weston, cortador-vertical-radial-carburo-altin-weston | ST-3-306-005, ST-3-306-015, ST-3-306-025… / ST-2-306-5015, ST-2-306-5025, ST-2-306-5035… / ST-1-222-004, ST-1-222-005, ST-1-222-006… | ✓ confirmed |
| buril-redondo | buriles-redondo-av-weston | ST-5-091-002, ST-5-091-008, ST-5-091-013… | ✓ |
| buril-momax-cobalto | buriles-cuadrados-cobalto-cleveland | CC44540, CC44544, CC44545… | ✓ confirmed |
| buril-cobalto-8-porciento | buriles-cobalto-co8-weston | ST-5-095-007, ST-5-095-012, ST-5-095-017… | ✓ |
| buril-calzado-punta-60, buril-calzado-punta-80, buril-calzado-punta-cuadrada, buril-corte-izquierdo, buril-corte-derecho, sierra-cinta, rima-ajustable | — | — | not registered |

### llaves-herramientas-torque (category `llaves-herramientas-apriete`)
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| llave-torx-larga | llave-tipo-torx-larga-bondhus | B421-32806, B421-32807, B421-32808… | ✓ |
| llave-torx | llave-tipo-torx-corta-bondhus | B411-32705, B411-32706, B411-32707… | ✓ |
| llave-allen-punta-bola-metrica-fraccional | llave-hexagonal-std-punta-de-bola-bondhus, llave-hexagonal-mm-punta-de-bola-bondhus | B121-15702, B121-15703, B121-15704… / B122-15749, B122-15750, B122-15752… | ✓ |
| llave-allen-brazo-largo | llave-hexagonal-mm-larga-recta-bondhus, llave-hexagonal-std-larga-recta-bondhus | B132-15947, B132-15948, B132-15949… / B131-15900, B131-15901, B131-15902… | ✓ |
| llave-allen | llave-hexagonal-mm-corta-recta-bondhus, llave-hexagonal-std-corta-bondhus | B112-15847, B112-15848, B112-15849… / B111-15800, B111-15801, B111-15802… | ✓ |
| jgo-llave-torx | juego-llaves-torx | B412-31732, B412-31734, B422-31832… | ✓ confirmed |
| jgo-llave-allen-brazo-largo-metrico | juego-llaves-allen-std-mm | B123-10945, B123-10932, B123-10938… | ✓ confirmed |
| jgo-llave-torx-larga | — | — | not found or related |
| jgo-llave-punta-bola-fraccional, jgo-llave-allen-punta-bola-metrica, llave-allen-t-metrica, llave-allen-t-fraccional, llave-torx-t, goldguard, colorguard | — | — | not found or related |
| plateado, extra-largas | — | — | pending: image needs a more descriptive name |

### perforacion-accesorios-taladro
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| broca-fraccional-zanco-recto | broca-zco-recto-acero-av-weston-inches, broca-zco-recto-acero-av-weston, broca-zco-recto-acero-av-weston-number, broca-zanco-recto-acero-av-weston-abc, broca-zco-recto-acero-av-mims-weston, broca-zco-recto-acero-av-bohrcraft, broca-aav-135-split-point, broca-aav-135-split-point-thunderbit | ST-5-160-005, ST-5-160-010, ST-5-160-015… / ST-5-163-010, ST-5-163-017, ST-5-163-022… / ST-5-170-005, ST-5-170-010, ST-5-170-015… / ST-5-180-005, ST-5-180-010, ST-5-180-015… / ST-5-154-020, ST-5-154-025, ST-5-154-030… / BC-1100-100, BC-1100-130, BC-1100-150… / M111-11201, M111-11202, M111-11203… / M211-12504, M211-12505, M211-12506… | ✓ confirmed |
| broca-concreto-sds | broca-concreto-sds-weston, broca-wp-zanco-sds-plus-weston | ST-5-151-100, ST-5-151-150, ST-5-151-200… / ST-5-148-350, ST-5-148-370, ST-5-148-410 | ✓ |
| broca-concreto | broca-concreto-weston, broca-para-concreto-diager | ST-5-150-10000, ST-5-150-10002, ST-5-150-10004… / D282-03076, D282-04076, D282-05102… | ✓ confirmed |
| broca-concreto-booster | broca-wp-concreto-weston | ST-5-148-020, ST-5-148-030, ST-5-148-050… | ✓ confirmed |
| broca-cobalto | broca-zco-recto-cobalto-bohrcraft, broca-zco-recto-cobalto-weston-inches, broca-zco-recto-cobalto-weston-m-measure | BC-1141-100, BC-1141-150, BC-1141-200… / ST-5-162-010, ST-5-162-025, ST-5-162-035… / ST-5-162-300, ST-5-162-305, ST-5-162-310… | ✓ |
| broca-centro | broca-centro-acero-av-weston | ST-8-600-010, ST-8-600-015, ST-8-600-020… | ✓ |
| broca-carburo-TiAlN | broca-carburo-solido-m13-tialn-bohrcraft | BC-1502-300, BC-1502-350, BC-1502-400… | ✓ |
| broca-carburo-solido | broca-carburo-solido-weston | ST-1-160-040, ST-1-160-045, ST-1-160-050… | ✓ |
| jgo-escariadores-metrico | insertos-elicoil-std-juego-6-escareadores-tornillo-allen-acero-av-bohrcraft | — | ✓ confirmed |
| jgo-brocas-metrica | juego-brocas-av-metricas-25-pzas, juego-brocas-acero-av-25-pzas-bohrcraft | ST-5-159-008 / BC-1100-30019, BC-1100-30025 | ✓ |
| jgo-brocas-fraccional | juego-brocas-acero-av-fraccionales, jgo-brocas-acer-av-std-numericas-alfabetica-115-pzas-weston, jgo-brocas-av-alfabeticas-26-pzas-weston, jgo-brocas-av-numericas-60-pzas-weston | ST-5-159-003, ST-5-159-004, ST-5-159-010 / ST-5-159-001 / ST-5-180-500 / ST-5-170-525 | ✓/~ |
| jgo-brocas-cobalto | juego-brocas-cobalto-metricas-25-pzas, juego-brocas-cobalto-fraccionales-weston | ST-5-159-009 / ST-5-159-006 | ✓ |
| broca-zanco-media-pulgada | broca-av-zanco-weston-inches, broca-av-zanco-weston-metric, broca-zanco-1-2-cobalto-weston | ST-5-166-010, ST-5-166-015, ST-5-166-020… / ST-5-166-260, ST-5-166-265, ST-5-166-270… / ST-5-167-320, ST-5-167-360, ST-5-167-440 | ✓ |
| broca-zanco-conico | broca-zco-conico-inches-number-weston | ST-5-190-225, ST-5-190-240, ST-5-190-260… | ✓ |
| broca-vidrio | broca-punta-carburo-tungsteno-weston | ST-5-149-10200, ST-5-149-10210, ST-5-149-10220… | ? |
| broca-larga | broca-larga-acero-av-bohrcraft, broca-extra-larga-acero-av-bohrcraft, broca-larga-tl-weston, broca-larga-av-weston, broca-larga-tl-inches-weston, broca-larga-aav-wp-black-silver-weston | BC-1350-100, BC-1350-150, BC-1350-200… / BC-1400-10200, BC-1400-10250, BC-1400-10300… / NB-5-164-015, NB-5-164-035, NB-5-164-050… / ST-5-165-005, ST-5-165-010 / ST-5-164-005, ST-5-164-010, ST-5-164-055… / NB-5-165-005, NB-5-165-010, NB-5-165-015… | ✓ confirmed |
| jgo-broca-zanco-media, broca-multiusos | — | — | not found or related |

### roscado-herramientas-roscas (products split across `herramientas-corte-conformado` and `roscado-herramientas-roscas`)
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| machuelo-nps-volkel | machuelo-nps-aav-volkel | 99402, 99406, 99414… | ✓ |
| machuelo-npt-volkel | machuelo-npt-aav-volkel | 63510, 63512, 63514… | ✓ |
| machuelo-npt-weston | machuelo-npt-aav-weston, machuelo-npt-ac-weston | ST-5-764-001, ST-5-764-002, ST-5-764-003… / ST-5-778-500, ST-5-778-510, ST-5-778-515… | ✓ |
| machuelo-maquina-volkel | machuelo-maquina-mm-aav-volkel, machuelo-maquina-fraccional-aav-volkel, machuelo-maquina-acero-inox-agujeros-pasados-mm-volkel, machuelo-maquina-acero-inox-agujeros-pasados-fracc-volkel, machuelo-maquina-acero-inox-agujeros-ciegos-mm-volkel, machuelo-maquina-acero-inox-agujeros-ciegos-fracc-volkel | 38526, 38530, 38534… / 75505, 75508, 75510… / 35226, 35230, 35234… / 35945, 35946, 35947… / 36226, 36230, 36234… / 36945, 36946, 36947… | ~ |
| machuelo-helicoidal-banda-blanca | machuelo-maquina-helice-35-volkel | 38726, 38730, 38734… | ? |
| machuelo-l-coil-volkel | machuelo-l-coil-fraccional-aav-volkel, machuelo-l-coil-aav-milimetrico-volkel, machuelo-fino-l-coil-fraccional-aav-volkel | TEV-03102, TEV-03104, TEV-03105… / TEV-03005, TEV-03006, TEV-03007… / TEV-03154, TEV-03155, TEV-03156… | ✓ |
| machuelo-bsp-volkel | machuelo-bsp-aav-volkel, machelo-bsp-aav-conico-volkel, machelo-bsp-aav-recto-volkel | 65312, 65314, 65316… / 25312-1, 25314-1, 25316-1… / 25312-2, 25314-2, 25316-2… | ✓ |
| machuelo-semiconico-volkel | machuelo-milimetrico-aav-semiconico-volkel, machuelo-fraccional-aav-semiconico-volkel, machuelos-izq-semiconicos-aav-volkel, machuelos-izq-fraccionales-semiconicos-aav-volkel | 27322-2, 27326-2, 27330-2… / 23305-2, 23308-2, 23310-2… / 27026-2, 27030-2, 27034-2… / 23008-2, 23010-2, 23014-2… | ✓ |
| machuelo-semiconico-weston | machuelo-plug-ac-weston | ST-5-778-009, ST-5-778-010, ST-5-778-015… | ✓ |
| kit-reparador-rosca | kit-reparador-roscas-bohrcraft, kit-reparador-roscas-fracc-volkel, kit-reparador-roscas-milim-volkel, kit-reparador-roscas-taller-volkel, kit-reparador-roscas-milim-weston | BC-4601-30300, BC-4601-30400, BC-4601-30500… / TEV-04101, TEV-04103, TEV-04104… / TEV-04005, TEV-04007, TEV-04009… / TEV-04085 / SB-100-100, SB-100-105, SB-100-110… | ~ |
| jgo-machuelo-weston | jgo-machuelo-ac-weston, juego-machuelos-ac-3-piezas-weston | ST-5-780-044, ST-5-780-059, ST-5-780-067… / ST-5-779-001, ST-5-779-010, ST-5-779-013… | ✓ |
| jgo-machuelo-fino-2-pasos-volkel | juego-machuelos-fraccionales-aav-2-piezas-volkel, juego-machuelos-milimetrico-aav-2-piezas-finos-volkel, juego-machuelos-izq-fraccionales-aav-2-piezas-volkel | 24305, 24310, 24314… / 26326, 26336, 26338… / 24010, 24014, 24016… | ✓ |
| jgo-3-machuelo-volkel | juego-machuelos-fraccionales-aav-3-piezas-volkel, juego-machuelos-izq-fraccionales-aav-3-piezas-volkel, juego-machuelos-izq-milimetricos-aav-3-piezas-volkel, juego-machuelos-aav-milimetricos-tipo-europeo-volkel | 23305, 23308, 23310… / 23008, 23010, 23014… / 27026, 27030, 27034… / 27316, 27322, 27326… | ✓ |
| jgo-2-machuelo-volkel | juego-machuelos-otros-volkel | 49510, 47001, 47033… | ? |
| jgo-2-machuelo-bsp-volkel | juego-machuelos-bsp-aav-2-piezas-volkel, juego-machuelos-bsp-av-2-piezas-bohrcraft | 25312, 25314, 25316… / — | ✓/~ |
| extractor-tornillos | extractor-tornillos-diager-saravia | D634-00010, D634-00020, D634-00030… | ✓ |
| dado-tarraja-volkel | dado-tarraja-ajustable-fracc-aav-fino-volkel, dado-tarraja-ajustable-fracc-aav-volkel, dado-tarraja-ajustable-milim-aav-fino-volkel, dado-tarraja-ajustable-milim-aav-volkel, dado-tarraja-izquierdo-aav-volkel, dado-tarraja-izquierdo-milim-aav-volkel, dado-tarraja-mm-aav-volkel, dado-tarraja-ajustable-bohrcraft, dado-tarraja-izquierdo-aav-bohrcraft | 24403, 24410, 24414… / 23405, 23408, 22408… / 26426, 26436, 26438… / 27926, 27930, 27934… / 22206, 23210, 23214… / 27226, 27230, 27234… / 27416, 27422, 27440… / — / — | ~ |
| dado-npt-volkel | dado-tarraja-npt-aav-volkel | 23612, 23614, 23616… | ✓ |
| dado-bsp-volkel | dado-tarraja-bsp-aav-volkel, dado-tarraja-bsp-aav-bohrcraft | 25412, 25414, 25416… / — | ✓/~ |
| punzo-rompe-arrastre-volkel-1 | punzon-rompe-arrastre-volkel | TEV-07006, TEV-07008, TEV-07009… | ✓ (-7 unused) |
| maneral-tipo-garrote-volkel | manerales-para-machuelos-volkel | 10001, 10002, 10010… | ~ (also maneral-machuelo-T-volkel; one product, pick one) |
| maneral-extractor-volkel | maneral-extractor-volkel | TEV-07052, TEV-07053 | ✓ |
| maneral-dado-tarraja-volkel | maneral-para-insertar-volkel | TEV-08004, TEV-08006, TEV-08008… | ? (check variants; "insertar" may be the helicoil tool, not a die holder) |
| machuelo-maquina-volkel (fallback) | machelo-conico-milimetricos-av-tipo-europeo-volkel, machelo-conico-milimetricos-av-fino-volkel, machelo-recto-milimetricos-av-tipo-europeo-volkel, machelo-recto-milimetricos-aav-fino-volkel, machuelo-fraccional-aav-conico-volkel, machuelo-fraccional-aav-conico-fino-volkel, machuelo-fraccional-aav-recto-volkel, machuelo-fraccional-aav-recto-fino-volkel, machuelos-izq-* (7), machuelo-izq-conicos-aav-volkel | 27316-1, 27322-1, 27326-1… / 26326-1, 26336-1, 26338-1… / 27316-3, 27322-3, 27326-3… / 26326-2, 26336-2, 26338-2… / 23305-1, 23308-1, 23310-1… / 24305-1, 24310-1, 24314-1… / 23305-3, 23308-3, 23310-3… / 24305-3, 24310-3, 24314-3… / 27026-1, 27030-1, 27034-1… | ? (no cónico/recto image exists; decide fallback or leave empty) |
| jgo-extractor-tornillos, maneral-tipo-garrote, maneral-tipo-garrote-surtek, maneral-machuelo-t-weston, maneral-dado-tarraja, maneral-dado-tarraja-weston, punzo-rompe-arrastre-volkel-7 | — | — | no product |

### sujecion
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| nudo-galvanizado | nudo-para-cable-maleable-weston | WT-00100, WT-00120, WT-00140… | ✓ |
| remache-ancha-inox | remache-pop-ancha-acero-inoxidable-304 | — | ✓ |
| remache-corta-inox | remache-pop-corta-acero-inoxidable-304 | — | ✓ |
| clamp-accion-vertical | clamp-accion-vertical-manija-recta-barra-u-weston | CH-101-A, CH-10247, CH-12050… | ✓ |
| clamp-accion-horizontal | clamp-accion-horizontal-barra-u-weston | CH-201, CH-201-B, CH-20235… | ✓ |
| clamp-accion-lineal | clamp-accion-lineal-weston | CH-301-A, CH-304-C, CH-304-E… | ✓ |
| clamp-accion-jalar | clamp-accion-jalar-weston | CH-40323, CH-40334, CH-40341… | ✓ |
| abrazadera-sin-fin | abrazadera-weston | ZH-00309, ZH-00310, ZH-00315… | ✓ |
| argolla-carga | tornillo-ojo-forjado-weston | C-00600, C-00605, C-00610… | ? |
| taquete-z, taquete-tx, taquete-plastico, taquete-arpon, sujetador-mariposa, armellas, abrazadera-alta-presion | — | — | no product |

### suministros-maquinado
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| rayador-carburo | rayador-carburo-saravia | D600-94338 | ✓ |

### tornilleria
| image | customId | internalIds (first 3) | conf |
|---|---|---|---|
| taquete-arpon-inox | taquete-arpon-acero-inoxidable-304 | — | ✓ |
| varilla-inoxidable | varilla-rosc-acer-inox-304-3ft, varilla-rosc-din-975-acer-inox-304-1mt | — / — | ✓ |
| accesorio-neopreno | accesorios-epdm-pija-punta-de-broca, accesorios-epdm-calidad-plus-pija-punta-de-broca | — / — | ✓ |
| opresor-allen-inox | opresor-hexagono-interior-punta-copa-acero-inoxidable-304, opresor-hexagono-interior-punta-copa-din-916-acero-inoxidable | — / — | ✓ |
| opresores/opresor-allen | opresor-hexagono-interior-punta-copa-std, opresor-punta-copa-mm-din-916-std | — / — | ✓ |
| pernos/perno-solido | perno-solido-rectificado-mm, perno-solido-rectificado-inches | — / — | ✓ |
| pija-multiusos-negra | pija-multiusos-phillips-negra | — | ✓ |
| pija-lamina | pija-cabeza-plana-phillips-lamina-galvanizada, pija-cabeza-hexagonal-para-lamina | — / — | ~ |
| pija-k-lath-punta-broca | pija-k-lath-punta-broca-galvanizado-galaxy | — | ✓ |
| pija-k-lath-ab-galv | pija-k-lath-punta-aguda-galvanizada | — | ✓ |
| pija-hexagonal-punta-broca | pija-galvanizada-galaxy-cabeza-hexagonal-punta-broca, pija-galvanizada-cabeza-hexagonal-punta-broca-calidad | — / — | ✓ |
| pija-cabeza-hexagonal-punta-broca | pija-410-punta-broca-cabeza-hexagonal-acero-inoxidable | — | ? |
| pija-hexagonal-madera | pija-galvanizada-cabeza-hexagonal-madera | — | ✓ |
| pija-hexagonal-acc | juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-calidad-plus, juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-galaxy | — / — | ✓ |
| pija-fijadora | pija-galvanizada-punta-fijadora-combinada, pija-cabeza-fijadora-combi-latonada | — / — | ✓ |
| pija-cabeza-plana-inox | pija-304-cabeza-plana-phillips-acero-inoxidable | — | ✓ |
| pija-cabeza-fijadora-inox | pija-304-cabeza-fijadora-phillips-acero-inoxidable | — | ✓ |
| rondana-presion-negra | rondana-de-presion-negra, rondana-de-presion-metrica-negra-din-127 | — / — | ✓ |
| rondana-presion-inox | rondana-de-presion-acero-inoxidable-304-std, rondana-de-presion-din-127-acero-inoxidable-304 | — / — | ✓ |
| rondana-presion-galvanizada | rondana-de-presion-galvanizada | — | ✓ |
| rondana-plana-inox | rondana-plana-acero-inoxidable-304, rondana-plana-din-125-acero-inoxidable-304 | — / — | ✓ |
| rondana-f-36 | rondana-f-436-negra | — | ✓ |
| tornillo-cabeza-plana-ranurado-inox | tornillo-cabeza-plana-ranurado-din-963-acero-inoxidable-304-metrico | — | ✓ |
| tornillo-cabeza-plana-phillips-inox | tornillo-cabeza-plana-ranurado-phillips-acero-inoxidable-304 | — | ✓ |
| tornillo-cabeza-plana-phillips-galvanizado | tornillo-cabeza-plana-phillips-galvanizado, tornillo-cabeza-plana-phillips-metrico-din-965 | — / — | ✓ |
| tornillo-cabeza-gota-inox | tornillo-cabeza-gota-ranurado-combinado-acero-inoxidable-304 | — | ✓ |
| tornillo-cabeza-gota-combinado-galvanizado | tornillo-cabeza-gota-combinado-galvanizado | — | ✓ |
| tornillo-cabeza-coche-galvanizado | tornillo-cabeza-coche-grado-2-galvanizado | — | ✓ |
| tornillo-coche-inox | tornillo-cabeza-coche-acero-inoxidable-304 | — | ✓ |
| tornillo-allen-milimetrico | tornillo-hexagono-interior-cabeza-baja-metrico | — | ~ |
| tornillo-allen-guia | tornillo-hexagono-interior-guia-std, tornillo-hexagono-interior-guia | — / — | ✓ |
| tornillo-allen-cilindrico | tornillo-hexagono-interior-cabeza-cilindrica, tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912, tornillo-hexagono-interior-cabeza-baja-cilindrica | — / — / — | ✓ |
| tornillo-alen-cilindrico-inox | tornillo-hex-int-cab-cil-din-912-acer-inox-304-mm, tornillo-hex-int-cab-cil-acer-inox-304 | — / — | ✓ |
| tornillo-allen-cabeza-plana | tornillo-hexagono-interior-cabeza-plana-metrico-din-7991, tornillo-hexagono-interior-cabeza-plana-std | — / — | ✓ |
| tornillo-allen-cabeza-plana-inox | tornillo-hex-int-cab-plana-acer-inox-304, tornillo-hex-int-cab-plana-din-7991-acer-inox-304-mm | — / — | ✓ |
| tornillo-allen-cabeza-boton | tornillo-hexagono-interior-cabeza-boton-std, tornillo-hexagono-interior-cabeza-boton | — / — | ✓ |
| tornillo-allen-boton-inox | tornillo-hex-int-cab-bot-acer-inox-304-metrico, tornillo-hex-int-cab-bot-acer-inox-304 | — / — | ✓ |
| tapon-dry | tapon-dry-seal | — | ✓ (category `sellado-taponado`) |
| tornillo-hexagonal-milimetrico | tornillo-cabeza-hexagonal-cl-8-8-din-933-931, tornillo-cabeza-hexagonal-cl-8-8-fino-din-960-96 | — / — | ✓ |
| tornillo-hexagonal-inox | tornillo-cabeza-hexagonal-din-933-931-acero-inoxidable-304, tornillo-cabeza-hexagonal-cuerda-corrida-acero-inoxidable-304 | — / — | ✓ |
| tornillo-hexagonal-grado-5 | tornillo-cabeza-hexagonal-grado-5-negro-fino, tornillo-cabeza-hexagonal-grado-5-negro-unc, tornillo-cabeza-hexagonal-grado-8-negro-fino, tornillo-cabeza-hexagonal-grado-8-negro-std | — / — / — / — | ✓/~ (grade 8 shares it) |
| tornillo-hexagonal-galvanizado | tornillo-maquina-cabeza-hexagonal-grado-2-cda-corrida-galvanizado | — | ✓ |
| tornillo-fijador-inox | tornillo-cabeza-fijadora-ranurado-din-85-acero-inoxidable-304-metrico | — | ✓ |
| tornillo-cabeza-queso-inoxidable | tornillo-cabeza-queso-din-84-acero-inoxidable-304-metrico | — | ✓ |
| tornillo-cabeza-queso | tornillo-cabeza-queso-ranurado-din-84-metrico | — | ✓ |
| tuerca-tino | tuerca-tino-4-puntas-galv-nc-nf | — | ✓ |
| tuerca-nylon | tuerca-inserto-nylon-galvanizada-nf, tuerca-inserto-nylon-galv-nc, tuerca-inserto-nylon-din-985-galv | — / — / — | ✓ |
| tuerca-inserto-inox | tuerca-hexagonal-inserto-nylon-acero-inoxidable-304-std, tuerca-hexagonal-inserto-nylon-fina-acero-inoxidable-304, tuerca-hexagonal-inserto-nylon-inoxidable-304-milimetrica | — / — / — | ✓ |
| tuerca-metrica | tuerca-hexagonal-metrica-din-934-negra | — | ✓ |
| tuerca-mariposa | tuerca-mariposa-forjada-galvanizada | — | ✓ |
| tuerca-mariposa-inox | tuerca-mariposa-acer-inox-304 | — | ✓ |
| tuerca-hexagonal-inox | tuerca-hexagonal-din-934-acer-inox-304, tuerca-hexagonal-nc-nf-acer-inox-304 | — / — | ✓ |
| tuerca-hexagonal-grado-5 | tuerca-hexagonal-grado-5-nc-pav, tuerca-hexagonal-grado-5-nf-pav, tuerca-hexagonal-grado-8-nc-pav | — / — / — | ✓/~ |
| tuerca-hexagonal-grado-2-negra | tuerca-hexagonal-liviana-grado-2-nc-negra | — | ✓ |
| tuerca-galvanizada | tuerca-hexagonal-liviana-grado-2-nc-galv | — | ✓ |
| tuerca-gripco | tuerca-gripco-grado-c-galv-nc-nf | — | ✓ |
| tuerca-flange | tuerca-flange-aserra-galv-metr, tuerca-flange-aserra-galv-estandar | — / — | ✓ |
| tuerca-cople | tuerca-cople-galvanizada | — | ✓ |
| tuerca-bellota | tuerca-bellota-niquelada-nc-nf | — | ✓ |
| tuerca-bellota-inox | tuerca-bellota-acer-inox-304 | — | ✓ |
| tuerca-2h | tuerca-2h-negra | — | ✓ |
| tuerca-acme-1 | tuerca-hexagonal-rosca-acme-grado-2-negra-forjada | — | ~ |
| tuerca-acme-2 | tuerca-hexagonal-rosca-acme-gdo-2-negr-maquinada | — | ~ |
| varilla-acme | varilla-acme-1mt | — | ✓ |
| varilla-87 | varilla-negra-b7-1mt | — | ✓ (B7) |
| varilla-grado-5 | varilla-grad-5-1mt-neg | — | ✓ |
| varilla-galvanizada-1m-3m | varilla-grad-2-galv-1mt, varilla-grad-2-galv-3mt | — / — | ✓ |
| opresor-ranurado-pivote, opresor-ranurado-balin, opresor-allen-resorte, opresor-allen-pivote, opresor-allen-balin, perno-roscado, pija-hexagonal-punta-aguda, pija-durock, accesorio-pija-inox, rondana-seguridad, rondana-plana-metrica, rondana-plana-galvanizada, tuerca-resorte | — | — | no product |

## 3. Products with no image (need a photo or an explicit fallback)

Format: `customId | internalId(s) of its variants | brand`.

### adhesivos-selladores (whole category)
- loctite-243-fijador-de-roscas-resistencia-removible-50-ml | LT-1329467 | weston
- loctite-495-adhesivo-instantaneo-super-bonder-20-gr | LT-270821 | weston

### calibrador (whole category)
- calibrador-gage-angulo-corte-rosca-acero-inoxidable-weston | STW-9047 | weston
- calibrador-gage-cuerda-60-weston | STW-9050 | weston
- calibrador-gage-cuerdas-acme-weston | STW-9045 | weston
- contador-hilos-weston | STW-4823-31, STW-4823-52, STW-4823-55, STW-4823-60, STW-4823-65 | weston
- cuenta-hilos-metrico-weston | STW-4821-52 | weston

### carburo
- punta-montada-rosa-weston | Z-50600, Z-50615, Z-50620, Z-50630, Z-50632, Z-50640, Z-50660, Z-50662, Z-50665, Z-50670, Z-50680, Z-50690, Z-50700, Z-50710, Z-50720, Z-50721, Z-50722, Z-50725, Z-50725-A, Z-50727, Z-50728, Z-50729-A, Z-50730, Z-50740, Z-50750, Z-50765 | weston
- juego-puntas-diamante-weston | SA-290-0010, SA-290-0020, SA-290-0030 | weston
- juego-limas-diamantadas-weston | SA-290-0040, SA-290-0050, SA-290-0060, SA-290-0070, SA-290-0080 | weston
- cortador-anular-titanio-weston | ST-5-530-121-T, ST-5-530-133-T, ST-5-530-136-T, ST-5-530-138-T, ST-5-530-151-T | weston
- cortador-desbaste-cobalto-4f-weston | ST-5-431-005, ST-5-431-010, ST-5-431-015, ST-5-431-020, ST-5-431-030, ST-5-431-040 | weston
- cortador-vertical-av-2f-weston | ST-5-300-005, ST-5-300-010, ST-5-300-015, ST-5-300-025, ST-5-300-035, ST-5-300-045, ST-5-300-055, ST-5-300-070, ST-5-300-092, ST-5-300-115, ST-5-300-210, ST-5-300-235 | weston
- cortador-vertical-av-4f-weston | ST-5-305-005, ST-5-305-010, ST-5-305-015, ST-5-305-020, ST-5-305-025, ST-5-305-035, ST-5-305-045, ST-5-305-055, ST-5-305-065, ST-5-305-070, ST-5-305-080, ST-5-305-085, ST-5-305-095, ST-5-305-125, ST-5-305-170, ST-5-305-200, ST-5-305-236, ST-5-305-265, ST-5-305-270, ST-5-305-273, ST-5-305-275, ST-5-305-280, ST-5-305-310 | weston
- cortador-vertical-av-4f-lgo-weston | ST-5-315-005, ST-5-315-010, ST-5-315-015, ST-5-315-025, ST-5-315-035, ST-5-315-040, ST-5-315-060, ST-5-315-065 | weston
- cortador-vertical-av-milimetrico-weston | ST-5-307-003, ST-5-307-004, ST-5-307-005, ST-5-307-006, ST-5-307-008, ST-5-307-010, ST-5-307-012, ST-5-307-014, ST-5-307-016, ST-5-307-018, ST-5-307-020 | weston
- cortador-vertical-bola-av-2f-weston | ST-5-220-005, ST-5-220-010, ST-5-220-015, ST-5-220-020, ST-5-220-025, ST-5-220-035, ST-5-220-050, ST-5-220-055 | weston
- cortador-vertical-carburo-4f-weston | ST-2-305-5005, ST-2-305-5010, ST-2-305-5015, ST-2-305-5025, ST-2-305-5035, ST-2-305-5045, ST-2-305-5055, ST-2-305-5070, ST-2-305-5125, ST-2-305-5170 | weston
- cortador-vertical-carburo-milimetrico-weston | ST-2-307-003, ST-2-307-004, ST-2-307-005, ST-2-307-006, ST-2-307-008, ST-2-307-010, ST-2-307-012, ST-2-307-014, ST-2-307-016 | weston
- cortador-vertical-cobalto-4f-weston | ST-5-304-005, ST-5-304-015, ST-5-304-025, ST-5-304-035, ST-5-304-045, ST-5-304-055, ST-5-304-070, ST-5-304-125, ST-5-304-170 | weston
- cortador-vertical-ext-lgo-4f-weston | ST-5-425-015, ST-5-425-020, ST-5-425-035, ST-5-425-040, ST-5-425-045, ST-5-425-050 | weston
- cortador-vertical-radial-carburo-4f-weston | ST-2-220-5005, ST-2-220-5010, ST-2-220-5015, ST-2-220-5020, ST-2-220-5025, ST-2-220-5030, ST-2-220-5035, ST-2-220-5050 | weston

### equipo-seguridad (whole category)
- lente-general-tricolor-ansi-weston | ST-6-500-065, ST-6-500-066 | weston

### herramientas-corte-conformado
- discos-corte-weston | Z-20185, Z-20190, Z-20197, Z-20198, Z-20215 | weston
- machuelo-ac-weston | ST-5-778-140 | weston
- machuelo-bsp-av-weston | ST-5-764-002-1, ST-5-764-003-1, ST-5-764-004-1, ST-5-764-005-1, ST-5-764-006-1, ST-5-764-007-1 | weston
- rima-perno-conico-weston | ST-5-100-003, ST-5-100-005, ST-5-100-007, ST-5-100-008 | weston
- buriles-incor-k-42 | I01-001, I01-002, I01-003, I01-005, I01-006, I01-007, I01-008, I01-009, I01-010, I01-011, I01-013, I01-014, I01-015, I01-016, I01-033, I01-034, I01-035, I01-037, I01-038, I01-039, I01-040, I01-041, I01-042, I01-043, I01-045, I01-046, I01-047, I01-048, I01-049, I01-050, I01-051, I01-053, I01-054, I01-055, I01-056 | cleveland
- juego-machuelos-aac-cleveland | GGG107883, GGG107943, GGG108003, GGG108033, GGG108113, GGG108143, GGG108173, GGG108203, GGG108233, GGG108263, GGG108293, GGG108323, GGG108353, GGG108383, GGG108413, GGG108443, GGG108473, GGG108503, GGG108533, GGG108563, GGG108593, GGG108623, GGG108663, GGG300076603, GGG300076923, GGG300077253, GGG300077563, GGG300078003, GGG300078293, GGG300078403, GGG300078483, GGG300078683, GGG300078753, GGG300078783, GGG300078883, GGG300079153, GGG300079183, GGG300079283, GGG300079753, GGG300080783, GGG300081113, GGG300081183, GGG300081513, GGG300081583 | cleveland
- juego-machuelos-aav-cleveland | CC1123-05323, CC1123-06243, CC1123-06323, CC54460, CC54476, CC54511, CC54523, CC54587, CC54600, CC54656, CC54665, CC54731, CC54741, CC54762, CC54768, CC54782, CC54790, CC54841, CC54849, CC54887, CC54893, CC54926, CC1123-030503M, CC1123-040704M, CC1123-050804M, CC1123-061005M, CC1123-081005M, CC1123-081255M, CC1123-101005M, CC1123-101255M, CC1123-101506M, CC1123-121006M, CC1123-121255M, CC1123-121506M, CC1123-121756M, CC1123-141006M, CC1123-141256M, CC1123-141506M, CC1123-142007M, CC1123-161006M, CC1123-161506M, CC1123-162007M, CC1123-201506M, CC1123-202507M, CC1123-221506M | cleveland
- machuelo-aav-npt-cleveland | CC64038, CC64039, CC64040, CC64041, CC64042 | cleveland
- extension-machuelos-bohrcraft | BC-4500-270, BC-4500-340, BC-4500-700 | bohrcraft
- juego-machuelos-av-bohrcraft | — | bohrcraft
- machuelo-npt-av-bohrcraft | — | bohrcraft
- machuelo-sti-av-bohrcraft | BC-4800-300, BC-4800-400, BC-4800-500, BC-4800-600, BC-4800-800, BC-4800-1000, BC-4800-1200, BC-4800-1400, BC-4800-1600, BC-4800-1800, BC-4800-2000 | bohrcraft
- extension-machuelos-volkel | 14527, 14534, 14549, 14555, 14570, 14590, 14612, 14614 | volkel
- Volkel cónico/recto/izquierdo machuelos (flagged `?` in section 2, no matching image):
  - machelo-conico-milimetricos-av-fino-volkel | 26326-1, 26336-1, 26338-1, 26344-1, 26346-1, 26348-1, 26354-1, 26356-1, 26362-1, 26364-1, 26366-1, 26372-1, 26374-1, 26377-1, 26384-1, 26386-1, 26394-1, 26396-1, 26504-1, 26506-1, 26508-1, 26512-1, 26530-1, 26532-1, 26538-1, 26550-1, 26554-1 | volkel
  - machelo-conico-milimetricos-av-tipo-europeo-volkel | 27316-1, 27322-1, 27326-1, 27330-1, 27334-1, 27338-1, 27342-1, 27346-1, 27350-1, 27354-1, 27358-1, 27362-1, 27366-1, 27370-1, 27374-1, 27376-1, 27378-1, 27382-1, 27386-1, 27390-1 | volkel
  - machelo-recto-milimetricos-aav-fino-volkel | 26326-2, 26336-2, 26338-2, 26344-2, 26346-2, 26348-2, 26354-2, 26356-2, 26362-2, 26364-2, 26366-2, 26372-2, 26374-2, 26377-2, 26384-2, 26386-2, 26394-2, 26396-2, 26504-2, 26506-2, 26508-2, 26512-2, 26530-2, 26532-2, 26538-2, 26550-2, 26554-2 | volkel
  - machelo-recto-milimetricos-av-tipo-europeo-volkel | 27316-3, 27322-3, 27326-3, 27330-3, 27334-3, 27338-3, 27342-3, 27346-3, 27350-3, 27354-3, 27358-3, 27362-3, 27366-3, 27370-3, 27374-3, 27376-3, 27378-3, 27382-3, 27386-3, 27390-3 | volkel
  - machuelo-fraccional-aav-conico-volkel | 23305-1, 23308-1, 23310-1, 23314-1, 23316-1, 23318-1, 23320-1, 23322-1, 23324-1, 23326-1, 23330-1, 23334-1, 23338-1, 23342-1, 23346-1, 23350-1, 23354-1 | volkel
  - machuelo-fraccional-aav-conico-fino-volkel | 24305-1, 24310-1, 24314-1, 24316-1, 24318-1, 24320-1, 24322-1, 24324-1, 24326-1, 24330-1, 24334-1, 24340-1, 24342-1, 24346-1 | volkel
  - machuelo-fraccional-aav-recto-volkel | 23305-3, 23308-3, 23310-3, 23314-3, 23316-3, 23318-3, 23320-3, 23322-3, 23324-3, 23326-3, 23330-3, 23334-3, 23338-3, 23342-3, 23346-3, 23350-3, 23354-3, 23362-3 | volkel
  - machuelo-fraccional-aav-recto-fino-volkel | 24305-3, 24310-3, 24314-3, 24316-3, 24318-3, 24320-3, 24322-3, 24324-3, 24326-3, 24330-3, 24334-3, 24340-3, 24342-3, 24346-3 | volkel
  - machuelo-izq-conicos-aav-volkel | 27026-1, 27030-1, 27034-1, 27038-1, 27042-1, 27046-1, 27050-1, 27054-1, 27058-1 | volkel
  - machuelos-izq-con-finos-volkel | 24010-1, 24014-1, 24016-1, 24018-1, 24020-1, 24022-1, 24024-1, 24026-1 | volkel
  - machuelos-izq-fracc-rectos-aav-volkel | 23008-3, 23010-3, 23014-3, 23016-3, 23018-3, 23020-3, 23022-3, 23026-3 | volkel
  - machuelos-izq-fraccionales-conicos-aav-volkel | 23008-1, 23010-1, 23014-1, 23016-1, 23018-1, 23020-1, 23022-1, 23026-1 | volkel
  - machuelos-izq-rectos-aav-volkel | 27026-3, 27030-3, 27034-3, 27038-3, 27042-3, 27046-3, 27050-3, 27054-3, 27058-3 | volkel
  - machuelos-izq-rectos-finos-volkel | 24010-3, 24014-3, 24016-3, 24018-3, 24020-3, 24022-3, 24024-3, 24026-3 | volkel

### herramientas-diagnostico-electricidad (whole category)
- probador-circuito-6-24v | KT-9DC22 | king-tony

### herramientas-impacto-forja (whole category)
- martillo-estilo-aleman | KT-7821-50 | king-tony
- martillo-reparacion-hojalateria | KT-9CF131 | king-tony

### herramientas-marcado (whole category)
- marcador-hp-proline | STM-096960, STM-096961, STM-096964, STM-096966 | weston
- marcador-valve-action | STM-096809, STM-096820, STM-096821, STM-096822, STM-096823, STM-096825, STM-096826 | weston

### llaves-herramientas-apriete
- 1-2-dr-dado-punta-spline | KT-406610, KT-406612 | king-tony
- 1-2-punta-bristol-cromado | KT-406614 | king-tony
- dado-cuadro-1-2-corto-estrella | KT-437510M, KT-437512M, KT-437514M, KT-437516M, KT-437518M, KT-437520M, KT-437522M, KT-437524M | king-tony
- dado-cuadro-1-2-de-cuadro | KT-401411 | king-tony
- dado-cuadro-1-2-estrella-largo | KT-427512M, KT-427514M, KT-427516M, KT-427518M, KT-427520M, KT-427522M, KT-427524M | king-tony
- dado-cuadro-1-2-punta-bristol-60mm | KT-402605, KT-402606, KT-402608, KT-402610, KT-402612, KT-402614, KT-402616 | king-tony
- dado-cuadro-1-2-punta-bristol-80mm | KT-403606, KT-403608, KT-403610, KT-403612 | king-tony
- dado-cuadro-1-2-punta-bristol-de-seguridad | KT-402B16, KT-402B18 | king-tony
- dado-cuadro-1-2-punta-bristol-m-measure | KT-406616 | king-tony
- dado-cuadro-1-2-punta-ribe | KT-404904, KT-404905, KT-404906, KT-404907, KT-404908, KT-404909, KT-404910, KT-404912, KT-404913, KT-404914, KT-404916, KT-404925 | king-tony
- dado-cuadro-1-2-punta-torx-larga | KT-403320, KT-403325, KT-403330, KT-403340, KT-403345, KT-403350, KT-403355, KT-403360, KT-403370 | king-tony
- dado-cuadro-1-2-punta-torx-segmento-corto | KT-402720, KT-402725, KT-402727, KT-402730, KT-402745, KT-402750, KT-402755, KT-402760 | king-tony
- dado-cuadro-1-llanta-trasera-capuchon | KT-851426S | king-tony
- dado-impacto-cuadro-1-2-17mm-6-puntas | KT-453517M | king-tony
- llave-banda-60x140 | KT-3203 | king-tony
- llave-estrias-golpe | KT-10B0-41 | king-tony
- llave-gancho-ajustable-13-35mm | KT-3641-35 | king-tony
- llaves-combinadas-matraca-cambio | KT-373208M, KT-373212M, KT-373217M, KT-373219M | king-tony
- matraca-cuadro-1-2-cabeza-articulado | KT-4789-12 | king-tony
- pinza-presion-c-6 | KT-6625-06 | king-tony
- pinza-presion-curva-cromada | KT-6011-07 | king-tony
- punta-cinco-estrellas-cuadro | KT-302D08, KT-302D09, KT-302D10, KT-302D15, KT-302D20, KT-302D25, KT-302D27, KT-302D30, KT-302D40, KT-302D45, KT-302D50, KT-302D55, KT-302D60 | king-tony

### lubricantes-multifuncionales (whole category)
- wd-40-aerosol | WD-52203, WD-52208, WD-52211 | weston

### perforacion-accesorios-taladro
- arbol-para-broquero-weston | SA-015-0290, SA-015-0310, SA-015-0340, SA-015-0350, SA-015-0360, SA-015-0370, SA-015-0400, SA-015-0410, SA-015-0420, SA-015-0430, SA-015-0440, SA-015-0480 | weston
- boquilla-cono-morse-weston | SA-015-0620, SA-015-0640, SA-015-0670, SA-015-0710, SA-015-0730 | weston
- broquero-ajustable-weston | SA-010-0340, SA-010-0360, SA-010-0370, SA-010-0380 | weston
- broquero-con-llave-y-montaje-weston | SA-010-0100, SA-010-0120, SA-010-0130, SA-010-0140, SA-010-0150, SA-010-0160, SA-010-0170 | weston
- broquero-jacobs-con-llave-weston | SA-012-0060, SA-012-0080, SA-012-0200, SA-012-0230 | weston
- broquero-jacobs-weston | SA-012-0110 | weston
- llave-jacobs-weston | SA-012-0010, SA-012-0020, SA-012-0120, SA-012-0130, SA-012-0140, SA-012-0150, SA-012-0160, SA-012-0170 | weston
- moleteador-weston | SA-100-0080, SA-100-0090, SA-100-0100 | weston
- super-broquero-embalado-con-llave-weston | SA-010-0190, SA-010-0200, SA-010-0210 | weston

### roscado-herramientas-roscas
- maneral-para-insertar-volkel | TEV-08004, TEV-08006, TEV-08008, TEV-08009, TEV-08010, TEV-08011, TEV-08013, TEV-08014, TEV-08015, TEV-08016, TEV-08018, TEV-08021, TEV-08022, TEV-08023 | volkel (only if the `maneral-dado-tarraja-volkel` `?` guess is wrong)

### sujecion
- clamp-accion-pestillo-weston | CH-40324, CH-40371 | weston
- clamp-pestillo-weston | CH-40344 | weston

### tornilleria
- tornillo-ojo-forjado-weston | C-00600, C-00605, C-00610, C-00615, C-00620, C-00625, C-00630, C-00635, C-00640, C-00645, C-00650, C-00655, C-00660, C-00665, C-00670 | weston (only if the `argolla-carga` `?` guess is wrong)
- varilla-rosc-cl-4.8-neg-1mt-mm | — | libre (fallback: varilla-87)
- varilla-rosc-cl-8.8-neg-1mt-mm | — | libre (fallback: varilla-87)

Rough count: ~215 products mapped (≈95 `✓`, rest shared/guessed), ~115 without an image.

## 4. Steps

1. Review every `?` and `~` row; fix the map in this file.
2. Generate `data/product-images.json` from sections 2 (one node one-liner over this table, or by hand — ~215 lines).
3. Add `imageUrl` to the product schema; `npm run build`.
4. Write `scripts/set-product-images.js`, add `images:products` to `package.json`, run it, check the count of updated vs. missing.
5. Update `AGENTS.md` / `REPO_CONTEXT.md` / `CLAUDE.md` script list and field table.
6. `npm run transfer:prod`.
7. Shoot / source photos for section 3 (category placeholders in the frontend meanwhile).

## Appendix A. Commercial use of brand images in Mexico

Not legal advice — checklist to clear with the brands and, if in doubt, a lawyer. Context: Tehesa is an authorized commercial supplier of these brands and the images come from the brands themselves.

### What applies
- **Copyright (Ley Federal del Derecho de Autor):** product photos and renders are protected works; the photographer/brand holds the economic rights. Using them on a store needs a license (written, even a simple email/PDF counts). Being a distributor does not by itself grant a license to the brand's photos.
- **Trademarks (Ley Federal de Protección a la Propiedad Industrial):** showing a brand's name/logo to identify genuine goods you legitimately sell is allowed (nominative use). Don't use the logo as if Tehesa were the brand, don't alter it, don't imply exclusivity or official-store status unless the brand agrees.
- **Consumer protection (Ley Federal de Protección al Consumidor, PROFECO):** the image must not mislead — it has to match what is actually sold (e.g. shared "type" images from section 2 should be labeled "imagen ilustrativa" when the variant/finish differs).
- **Third-party content inside the image:** stock photos, models, or other brands' products in a manufacturer image are not covered by the manufacturer's permission — avoid those images.

### What Tehesa needs per brand
1. **Written authorization** to reproduce the brand's product images on `tehesa` web/store and social media. Ask for: scope (web, social, print), territory (Mexico), duration (while distributor), whether Tehesa may crop/resize/convert (we serve webp on Cloudinary), and whether attribution is required.
2. **Official source**: dealer/partner media portal or an email from the brand's marketing contact with the files. Prefer that over saving images from their website or from other resellers.
3. **Brand guidelines** if they have them (logo use, minimum size, "distribuidor autorizado" wording).
4. **Proof of distributor status** (invoice/contract) — not for the images, but it is what makes the trademark use clearly legitimate.

Brands to cover (from the seed): weston, volkel, bohrcraft, bondhus, cleveland, precision, king-tony, plus Loctite (Henkel), WD-40, Diager, Saravia, Surtek where their products/images appear. Products with brand `libre` have no brand owner — those images must be Tehesa's own or licensed stock.

### Record keeping
Keep one row per brand in a small table (here or `docs/image-licenses.md`): brand · contact · date · what was authorized · where the authorization file is. Add a `source` note per brand in `data/product-images.json` only if the map ever mixes brand images with Tehesa's own photos; today all URLs are one Cloudinary folder, so a per-brand table is enough.

| brand | authorization | date | contact / file |
|---|---|---|---|
| weston | pending | | |
| volkel | pending | | |
| bohrcraft | pending | | |
| bondhus | pending | | |
| cleveland | pending | | |
| precision | pending | | |
| king-tony | pending | | |
| henkel (loctite) | pending | | |
| wd-40 | pending | | |
| diager | pending | | |

### Cleanup before launch
- Remove any image whose origin you can't name (unknown reseller, Google Images).
- Show `imagen ilustrativa` on products mapped with `~` / `?` in section 2.
- Don't hotlink from brand sites — keep serving from Tehesa's Cloudinary (already the case).
