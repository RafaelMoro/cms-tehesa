# Product images plan

Date: 2026-09-20 (first draft 2026-09-19). Products: 332 in `../products-tehesa/data` @ current HEAD. Images live on Cloudinary (`https://res.cloudinary.com/dov7g4avx/image/upload/`).

Images are now named **by product `customId`**, one image per product. The earlier attempt to map generic product-type images onto many products is abandoned; it is kept in Appendix B for reference only.

## 1. How the image gets into Strapi

Images already live on Cloudinary — no upload step. Store the URL as a string.

1. Schema: add `"imageUrl": { "type": "string" }` to `src/api/product/content-types/product/schema.json` (and `AGENTS.md`/`REPO_CONTEXT.md` field tables). No media-library field, no Cloudinary provider: nothing to sync, nothing to back up, no extra RAM on the 512 MB box.
2. Mapping file: `data/product-images.json` — `{ "<customId>": "<full URL>" }`, one line per product, built from section 2. Same shape as `data/data.json`, keyed by `customId` like every other script.
3. Script: `scripts/set-product-images.js` (`npm run images:products`) — loads the map, `strapi.documents('api::product.product').findMany({ filters: { customId: { $in: ids } } })`, then `update({ documentId, data: { imageUrl }, status: 'published' })` per product. Idempotent; logs customIds missing in DB and DB products without a URL. Reuse the bootstrap pattern of `scripts/update-price-variant-count-products.js`.
4. Prod: run `npm run build` (schema change), `npm run images:products` locally, then `npm run transfer:prod`. Do **not** reseed.
5. Optional later: put `imageUrl` in the products-tehesa `products.*.json` so a full reseed carries it. Skipped now — the map lives here and the seed is create-only anyway.

Frontend fallback: products without `imageUrl` should render a category placeholder; don't invent a fallback in the API.

## 2. Product → image map (by customId)

Source of truth for `data/product-images.json`. Notes in parentheses come from the review. `tornilleria` is now mostly mapped (see below).

### herramientas-marcado

- marcador-valve-action
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913701/marcador-valve-action_ffhui1.webp
- marcador-hp-proline
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913699/marcador-hp-proline_unmrrx.webp

### lubricantes-multifuncionales

- wd-40-aerosol
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914049/wd-40-aerosol_nbapge.webp

### herrajes-accesorios-cable

- nudo-para-cable-maleable-weston — not found

### equipo-seguridad

- lente-general-tricolor-ansi-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913186/lente-general-tricolor-ansi-weston_kclful.webp

### calibrador

- calibrador-gage-cuerda-60-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912663/calibrador-gage-cuerda-60-weston_lki799.webp
- calibrador-gage-cuerdas-acme-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912664/calibrador-gage-cuerdas-acme-weston_qnwlrx.webp
- calibrador-gage-angulo-corte-rosca-acero-inoxidable-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912682/calibrador-gage-angulo-corte-rosca-acero-inoxidable-weston_daesod.webp
- contador-hilos-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912664/contador-hilos-weston_oxwzb2.webp
- cuenta-hilos-metrico-weston (mala calidad)
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912664/cuenta-hilos-metrico-weston_ebvmv8.webp

### carburo

- cortador-vertical-av-2f-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912824/cortador-vertical-av-2f-weston_jcrrsb.webp
- cortador-vertical-cobalto-4f-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912828/cortador-vertical-cobalto-4f-weston_ve8m0q.webp
- juego-limas-diamantadas-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912830/juego-limas-diamantadas-weston_pi71go.webp
- lima-rotativa-doble-corte-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912832/lima-rotativa-doble-corte-weston_ln3b17.webp
- cortador-vertical-bola-av-2f-weston (mala calidad)
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912826/cortador-vertical-bola-av-2f-weston_nkxao2.webp
- cortador-anular-titanio-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912823/cortador-anular-titanio-weston_cdhxzs.webp
- cortador-desbaste-cobalto-4f-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912823/cortador-desbaste-cobalto-4f-weston_sb8r8r.webp
- cortador-vertical-av-milimetrico-weston (mc)
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912826/cortador-vertical-av-milimetrico-weston_gsizwr.webp
- cortador-vertical-4f-titanio-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912823/cortador-vertical-4f-titanio-weston_by4lub.webp
- cortador-vertical-av-4f-lgo-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912825/cortador-vertical-av-4f-lgo-weston_jwgqq4.webp
- lima-rotativa-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912832/lima-rotativa-weston_rvfahp.webp
- cortador-vertical-radial-carburo-4f-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912829/cortador-vertical-radial-carburo-4f-weston_wi7mma.webp
- cortador-vertical-ext-lgo-4f-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912829/cortador-vertical-ext-lgo-4f-weston_puhns1.webp
- cortador-vertical-radial-carburo-altin-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912830/cortador-vertical-radial-carburo-altin-weston_ipstji.webp
- cortador-vertical-carburo-4f-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912827/cortador-vertical-carburo-4f-weston_qeaxzw.webp
- juego-puntas-diamante-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912831/juego-puntas-diamante-weston_fta6fh.webp
- punta-montada-rosa-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912832/punta-montada-rosa-weston_d5nqxm.webp
- cortador-vertical-av-4f-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912825/cortador-vertical-av-4f-weston_nxzmb5.webp
- cortador-vertical-carburo-milimetrico-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912828/cortador-vertical-carburo-milimetrico-weston_w1cb3z.webp
- cortador-vertical-carburo-ctian-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912827/cortador-vertical-carburo-ctian-weston_ahklnf.webp

### adhesivos-selladores

- loctite-243-fijador-de-roscas-resistencia-removible-50-ml
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912447/loctite-243-fijador-de-roscas-resistencia-removible-50-ml_cxnjof.webp
- loctite-495-adhesivo-instantaneo-super-bonder-20-gr
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789912447/loctite-495-adhesivo-instantaneo-super-bonder-20-gr_xhcibo.webp

### sujecion

- clamp-accion-horizontal-barra-u-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914648/clamp-accion-horizontal-barra-u-weston_skntzi.webp
- clamp-accion-lineal-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914644/clamp-accion-lineal-weston_eseatq.webp
- clamp-accion-pestillo-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914642/clamp-accion-pestillo-weston_azgcxl.webp
- clamp-accion-vertical-manija-recta-barra-u-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914640/clamp-accion-vertical-manija-recta-barra-u-weston_gyjqgo.webp
- clamp-pestillo-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914638/clamp-pestillo-weston_n0a2m0.webp
- abrazadera-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914650/abrazadera-weston_hsl7zt.webp
- clamp-accion-jalar-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914646/clamp-accion-jalar-weston_vodjy4.webp

### llaves-herramientas-apriete

- llave-banda-60x140
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913785/llave-banda-60x140_ft0unk.webp
- dado-cuadro-1-2-punta-bristol-80mm
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913773/dado-cuadro-1-2-punta-bristol-80mm_zspleo.webp
- juego-llaves-allen-std-mm
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913782/juego-llaves-allen-std-mm_bn9gbp.webp
- punta-cinco-estrellas-cuadro
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913802/punta-cinco-estrellas-cuadro_acvgqt.webp
- dado-cuadro-1-2-estrella-largo
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913770/dado-cuadro-1-2-estrella-largo_skabac.webp
- 1-2-dr-dado-punta-spline
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913766/1-2-dr-dado-punta-spline_loyxlp.webp
- dado-cuadro-1-2-punta-bristol-60mm
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913772/dado-cuadro-1-2-punta-bristol-60mm_cvmxd8.webp
- llave-hexagonal-mm-punta-de-bola-bondhus
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913791/llave-hexagonal-mm-punta-de-bola-bondhus_jqdv8p.webp
- pinza-presion-c-6
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913800/pinza-presion-c-6_jfiajb.webp
- dado-cuadro-1-2-corto-estrella
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913767/dado-cuadro-1-2-corto-estrella_gu0t7q.webp
- llave-hexagonal-std-corta-bondhus
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913793/llave-hexagonal-std-corta-bondhus_jqyvii.webp
- dado-cuadro-1-2-punta-torx-larga
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913778/dado-cuadro-1-2-punta-torx-larga_iekeo9.webp
- matraca-cuadro-1-2-cabeza-articulado
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913799/matraca-cuadro-1-2-cabeza-articulado_chxlft.webp
- dado-cuadro-1-2-punta-torx-segmento-corto
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913779/dado-cuadro-1-2-punta-torx-segmento-corto_f9dkbc.webp
- juego-llaves-torx
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913784/juego-llaves-torx_qp3yyy.webp
- llave-hexagonal-std-punta-de-bola-bondhus
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913796/llave-hexagonal-std-punta-de-bola-bondhus_i2cvc7.webp
- llave-hexagonal-std-larga-recta-bondhus
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913794/llave-hexagonal-std-larga-recta-bondhus_uivj9y.webp
- llave-estrias-golpe
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913787/llave-estrias-golpe_xivlwo.webp
- dado-impacto-cuadro-1-2-17mm-6-puntas
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913781/dado-impacto-cuadro-1-2-17mm-6-puntas_yndvms.webp
- dado-cuadro-1-2-punta-bristol-de-seguridad
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913775/dado-cuadro-1-2-punta-bristol-de-seguridad_rg69mr.webp
- dado-cuadro-1-2-de-cuadro
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913769/dado-cuadro-1-2-de-cuadro_v9w2lp.webp
- dado-cuadro-1-2-punta-bristol-m-measure
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913776/dado-cuadro-1-2-punta-bristol-m-measure_jd2yvs.webp
- llave-hexagonal-mm-corta-recta-bondhus
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913788/llave-hexagonal-mm-corta-recta-bondhus_ai0ey1.webp
- llave-tipo-torx-corta-bondhus
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913797/llave-tipo-torx-corta-bondhus_zm06mg.webp
- llave-hexagonal-mm-larga-recta-bondhus
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913790/llave-hexagonal-mm-larga-recta-bondhus_melp2q.webp

### herramientas-diagnostico-electricidad

- probador-circuito-6-24v
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913632/probador-circuito-6-24v_fwxohz.webp

### herramientas-impacto-forja

- martillo-estilo-aleman
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913663/martillo-estilo-aleman_akid2p.webp
- martillo-reparacion-hojalateria
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913664/martillo-reparacion-hojalateria_p0hkbe.webp

### herramientas-corte-conformado

- buriles-cobalto-co8-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913329/buriles-cobalto-co8-weston_lbaeww.webp
- machelo-bsp-aav-conico-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913317/machelo-bsp-aav-conico-volkel_otzvte.webp
- machuelo-fraccional-aav-semiconico-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913323/machuelo-fraccional-aav-semiconico-volkel_z2se05.webp
- laina-acero-azul-templado-precision
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913316/laina-acero-azul-templado-precision_lechav.webp
- jgo-machuelo-ac-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913310/jgo-machuelo-ac-weston_ij4ak9.webp
- buriles-redondo-av-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913330/buriles-redondo-av-weston_k99w0o.webp
- machuelo-nps-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913326/machuelo-nps-aav-volkel_arjypu.webp
- machuelo-maquina-acero-inox-agujeros-pasados-mm-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913324/machuelo-maquina-acero-inox-agujeros-pasados-mm-volkel_iij1nw.webp
- laina-acero-150mm-2-5m-precision
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913315/laina-acero-150mm-2-5m-precision_dt3dfd.webp
- machuelo-maquina-mm-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913325/machuelo-maquina-mm-aav-volkel_phjy6i.webp
- machuelo-fraccional-aav-recto-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913322/machuelo-fraccional-aav-recto-volkel_dluzwy.webp
- machuelo-plug-ac-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913326/machuelo-plug-ac-weston_vgmbvw.webp
- machelo-conico-milimetricos-av-fino-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913319/machelo-conico-milimetricos-av-fino-volkel_odwhkv.webp
- machuelo-fraccional-aav-conico-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913321/machuelo-fraccional-aav-conico-volkel_rrgq6v.webp
- juego-machuelos-bsp-aav-2-piezas-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913312/juego-machuelos-bsp-aav-2-piezas-volkel_icofy8.webp
- extension-machuelos-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913331/extension-machuelos-volkel_euebwx.webp
- juego-machuelos-fraccionales-aav-3-piezas-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913313/juego-machuelos-fraccionales-aav-3-piezas-volkel_npv9u4.webp
- machuelos-izq-fraccionales-conicos-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913327/machuelos-izq-fraccionales-conicos-aav-volkel_wqwp8g.webp
- juego-machuelos-ac-3-piezas-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913311/juego-machuelos-ac-3-piezas-weston_fala9a.webp
- machuelo-bsp-av-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913320/machuelo-bsp-av-weston_notc15.webp
- juego-machuelos-av-bohrcraft — missing internal id
- rima-perno-conico-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913328/rima-perno-conico-weston_pbos23.webp
- laina-acero-inoxidable-6pul-50pul-precision
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913316/laina-acero-inoxidable-6pul-50pul-precision_v5os6d.webp
- machelo-bsp-aav-recto-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913318/machelo-bsp-aav-recto-volkel_bz5jvb.webp
- laina-acero-6pul-100pul-precision
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913314/laina-acero-6pul-100pul-precision_vysprh.webp

### extraccion-reparacion-fijaciones

- maneral-extractor-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913230/maneral-extractor-volkel_za6xnn.webp
- extractor-tornillos-diager-saravia
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789913230/extractor-tornillos-diager-saravia_hbtlzk.webp

### roscado-herramientas-roscas

- dado-tarraja-ajustable-milim-aav-fino-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914382/dado-tarraja-ajustable-milim-aav-fino-volkel_tsf4u6.webp
- inserto-roscado-bohrcraft
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914371/inserto-roscado-bohrcraft_yklwhl.webp
- dado-tarraja-ajustable-milim-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914380/dado-tarraja-ajustable-milim-aav-volkel_qzyet5.webp
- insertos-elicoil-milim-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914369/insertos-elicoil-milim-weston_d92xqk.webp
- kit-reparador-roscas-bohrcraft
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914365/kit-reparador-roscas-bohrcraft_eqht3w.webp
- maneral-para-insertar-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914355/maneral-para-insertar-volkel_eqf3wd.webp
- dado-tarraja-ajustable-fracc-aav-fino-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914386/dado-tarraja-ajustable-fracc-aav-fino-volkel_rgqyo3.webp
- kit-reparador-roscas-milim-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914361/kit-reparador-roscas-milim-weston_cjco3v.webp
- dado-tarraja-izquierdo-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914376/dado-tarraja-izquierdo-aav-volkel_lcmlik.webp
- kit-reparador-roscas-fracc-volkel — not found
- dado-tarraja-izquierdo-aav-bohrcraft — missing internal id
- manerales-para-machuelos-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914357/manerales-para-machuelos-volkel_a3lwzf.webp
- dado-tarraja-bsp-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914378/dado-tarraja-bsp-aav-volkel_osi86w.webp
- dado-tarraja-npt-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914373/dado-tarraja-npt-aav-volkel_uwe4ku.webp
- dado-tarraja-ajustable-bohrcraft — missing internal id
- kit-reparador-roscas-milim-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914363/kit-reparador-roscas-milim-volkel_ampi1g.webp
- dado-tarraja-izquierdo-milim-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914374/dado-tarraja-izquierdo-milim-aav-volkel_xqjqqd.webp
- dado-tarraja-ajustable-fracc-aav-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914384/dado-tarraja-ajustable-fracc-aav-volkel_b0gwy7.webp
- dado-tarraja-bsp-aav-bohrcraft — missing internal id
- insertos-elicoil-std-volkel
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914367/insertos-elicoil-std-volkel_uinkst.webp
- UNMATCHED (filename says `kit-reparador-roscas-taller-volkel`, which is a catalog product — confirm)
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914359/kit-reparador-roscas-taller-volkel_avgdfk.webp

### perforacion-accesorios-taladro

- moleteador-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914097/moleteador-weston_ligysd.webp
- broca-larga-aav-wp-black-silver-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914126/broca-larga-aav-wp-black-silver-weston_oenl6e.webp
- broca-punta-carburo-tungsteno-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914123/broca-punta-carburo-tungsteno-weston_d1zvs6.webp
- broca-carburo-solido-m13-tialn-bohrcraft
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914128/broca-carburo-solido-m13-tialn-bohrcraft_d2ryyz.webp
- broca-larga-av-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914124/broca-larga-av-weston_xux9rb.webp
- broca-para-concreto-diager — not found
- super-broquero-embalado-con-llave-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914095/super-broquero-embalado-con-llave-weston_ott1it.webp
- escareador-tornillo-allen-acero-av-bohrcraft
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914109/escareador-tornillo-allen-acero-av-bohrcraft_mcivx7.webp
- boquilla-cono-morse-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914130/boquilla-cono-morse-weston_jw6nac.webp
- arbol-para-broquero-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914131/arbol-para-broquero-weston_p2jahy.webp
- broca-zco-recto-acero-av-bohrcraft
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914119/broca-zco-recto-acero-av-bohrcraft_dhshab.webp
- broca-zco-conico-inches-number-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914121/broca-zco-conico-inches-number-weston_o8h0fd.webp
- broca-zco-recto-acero-av-weston-inches
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914116/broca-zco-recto-acero-av-weston-inches_nrehfd.webp
- juego-brocas-acero-av-25-pzas-bohrcraft
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914103/juego-brocas-acero-av-25-pzas-bohrcraft_qdrsh5.webp
- broquero-jacobs-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914110/broquero-jacobs-weston_qakbmo.webp
- broca-aav-135-split-point — not found
- broca-zco-recto-acero-av-mims-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914117/broca-zco-recto-acero-av-mims-weston_o0fcrc.webp
- juego-brocas-acero-av-fraccionales
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914102/juego-brocas-acero-av-fraccionales_f1dbvr.webp
- broca-zco-recto-cobalto-bohrcraft — not found
- juego-brocas-av-metricas-25-pzas
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914100/juego-brocas-av-metricas-25-pzas_cvyzyq.webp
- broca-zco-recto-cobalto-weston-m-measure
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914112/broca-zco-recto-cobalto-weston-m-measure_bwxykz.webp
- jgo-brocas-av-alfabeticas-26-pzas-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914105/jgo-brocas-av-alfabeticas-26-pzas-weston_hggdcg.webp
- broca-zco-recto-acero-av-weston-number
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914114/broca-zco-recto-acero-av-weston-number_e7kbkv.webp
- jgo-brocas-acer-av-std-numericas-alfabetica-115-pzas-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914107/jgo-brocas-acer-av-std-numericas-alfabetica-115-pzas-weston_qapxe2.webp
- llave-jacobs-weston
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1789914098/llave-jacobs-weston_jy2q6s.webp

### sellado-taponado

Found alongside the tornilleria batch upload; not part of that category.

- tapon-dry-seal
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025849/tapon-dry-seal_reezsm.webp

### tornilleria

81 mapped, 3 flagged (1 not found, 2 mala calidad without a photo yet), 23 still without a mapped image (see section 3).

- tornillo-cabeza-coche-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025851/tornillo-cabeza-coche-acero-inoxidable-304_ecbqvp.webp
- tornillo-cabeza-coche-grado-2-galvanizado
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025852/tornillo-cabeza-coche-grado-2-galvanizado_gknqi6.webp
- tornillo-cabeza-fijadora-ranurado-din-85-acero-inoxidable-304-metrico
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025854/tornillo-cabeza-fijadora-ranurado-din-85-acero-inoxidable-304-metrico_oma1sd.webp
- tornillo-cabeza-gota-combinado-galvanizado
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025855/tornillo-cabeza-gota-combinado-galvanizado_y7hkly.webp
- tornillo-cabeza-gota-ranurado-combinado-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025856/tornillo-cabeza-gota-ranurado-combinado-acero-inoxidable-304_feoedh.webp
- tornillo-cabeza-hexagonal-cl-8-8-din-933-931
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025857/tornillo-cabeza-hexagonal-cl-8-8-din-933-931_cnolh3.webp
- tornillo-cabeza-hexagonal-cl-8-8-fino-din-960-96
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025859/tornillo-cabeza-hexagonal-cl-8-8-fino-din-960-96_hbxqbd.webp
- tornillo-cabeza-hexagonal-cuerda-corrida-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025860/tornillo-cabeza-hexagonal-cuerda-corrida-acero-inoxidable-304_re6uhs.webp
- tornillo-cabeza-hexagonal-grado-5-negro-fino
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025861/tornillo-cabeza-hexagonal-grado-5-negro-fino_lzn9of.webp
- tornillo-cabeza-hexagonal-grado-5-negro-unc
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025862/tornillo-cabeza-hexagonal-grado-5-negro-unc_liapr1.webp
- tornillo-cabeza-hexagonal-grado-8-negro-std
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025863/tornillo-cabeza-hexagonal-grado-8-negro-std_b1yzlv.webp
- tornillo-cabeza-plana-phillips-galvanizado
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025865/tornillo-cabeza-plana-phillips-galvanizado_eqp8ze.webp
- tornillo-cabeza-plana-phillips-metrico-din-965
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025866/tornillo-cabeza-plana-phillips-metrico-din-965_xhbmz8.webp
- tornillo-cabeza-plana-ranurado-phillips-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025867/tornillo-cabeza-plana-ranurado-phillips-acero-inoxidable-304_kntjiq.webp
- tornillo-cabeza-queso-din-84-acero-inoxidable-304-metrico
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025868/tornillo-cabeza-queso-din-84-acero-inoxidable-304-metrico_t626go.webp
- tornillo-cabeza-queso-ranurado-din-84-metrico
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025869/tornillo-cabeza-queso-ranurado-din-84-metrico_wfetgl.webp
- tornillo-hex-int-cab-bot-acer-inox-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025878/tornillo-hex-int-cab-bot-acer-inox-304_yhegmx.webp
- tornillo-hex-int-cab-cil-acer-inox-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025879/tornillo-hex-int-cab-cil-acer-inox-304_em43bo.webp
- tornillo-hex-int-cab-plana-acer-inox-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025880/tornillo-hex-int-cab-plana-acer-inox-304_jv8yus.webp
- tornillo-hexagono-interior-cabeza-baja-cilindrica
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025871/tornillo-hexagono-interior-cabeza-baja-cilindrica_mkq1a0.webp
- tornillo-hexagono-interior-cabeza-baja-metrico
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025872/tornillo-hexagono-interior-cabeza-baja-metrico_r24d7j.webp
- tornillo-hexagono-interior-cabeza-boton-std
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025873/tornillo-hexagono-interior-cabeza-boton-std_jggvri.webp
- tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025874/tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912_lfrpty.webp
- tornillo-hexagono-interior-cabeza-plana-metrico-din-7991 — not found
- tornillo-hexagono-interior-cabeza-plana-std
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025876/tornillo-hexagono-interior-cabeza-plana-std_p2dx36.webp
- tornillo-hexagono-interior-guia-std
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025877/tornillo-hexagono-interior-guia-std_qkrjbo.webp
- tornillo-maquina-cabeza-hexagonal-grado-2-cda-corrida-galvanizado
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025882/tornillo-maquina-cabeza-hexagonal-grado-2-cda-corrida-galvanizado_yivy5b.webp
- tuerca-2h-negra
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025883/tuerca-2h-negra_c1rhpl.webp
- tuerca-bellota-niquelada-nc-nf
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025884/tuerca-bellota-niquelada-nc-nf_cro6zh.webp
- tuerca-cople-galvanizada — mala calidad, no image captured yet
- tuerca-flange-aserra-galv-estandar
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025885/tuerca-flange-aserra-galv-estandar_dodemy.webp
- tuerca-flange-aserra-galv-metr
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025788/tuerca-flange-aserra-galv-metr_e40xwl.webp
- tuerca-gripco-grado-c-galv-nc-nf
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025789/tuerca-gripco-grado-c-galv-nc-nf_wxcfzv.webp
- tuerca-hexagonal-grado-5-nc-pav
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025790/tuerca-hexagonal-grado-5-nc-pav_cunrz2.webp
- tuerca-hexagonal-grado-5-nf-pav
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025791/tuerca-hexagonal-grado-5-nf-pav_xm75rz.webp
- tuerca-hexagonal-grado-8-nc-pav — mala calidad, no image captured yet
- tuerca-hexagonal-liviana-grado-2-nc-galv
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025793/tuerca-hexagonal-liviana-grado-2-nc-galv_jqn377.webp
- tuerca-hexagonal-liviana-grado-2-nc-negra
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025794/tuerca-hexagonal-liviana-grado-2-nc-negra_slxiu5.webp
- tuerca-hexagonal-metrica-din-934-negra
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025795/tuerca-hexagonal-metrica-din-934-negra_f7mggq.webp
- tuerca-hexagonal-rosca-acme-gdo-2-negr-maquinada
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025796/tuerca-hexagonal-rosca-acme-gdo-2-negr-maquinada_owldyg.webp
- tuerca-hexagonal-rosca-acme-grado-2-negra-forjada
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025797/tuerca-hexagonal-rosca-acme-grado-2-negra-forjada_l31lea.webp
- tuerca-inserto-nylon-din-985-galv
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025798/tuerca-inserto-nylon-din-985-galv_b3putv.webp
- tuerca-inserto-nylon-galv-nc
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025801/tuerca-inserto-nylon-galv-nc_ykpg0g.webp
- tuerca-inserto-nylon-galvanizada-nf
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025800/tuerca-inserto-nylon-galvanizada-nf_cpfg9u.webp
- tuerca-mariposa-acer-inox-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025802/tuerca-mariposa-acer-inox-304_gqxu2j.webp
- tuerca-mariposa-forjada-galvanizada
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025803/tuerca-mariposa-forjada-galvanizada_th0h9l.webp
- tuerca-tino-4-puntas-galv-nc-nf
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025804/tuerca-tino-4-puntas-galv-nc-nf_iangq5.webp
- accesorios-epdm-calidad-plus-pija-punta-de-broca
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025814/accesorios-epdm-calidad-plus-pija-punta-de-broca_e3lwyf.webp
- accesorios-epdm-pija-punta-de-broca
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025815/accesorios-epdm-pija-punta-de-broca_wgihmd.webp
- juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-calidad-plus
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025817/juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-calidad-plus_grgvre.webp
- juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-galaxy
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025818/juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-galaxy_mpp6hz.webp
- pija-304-cabeza-fijadora-phillips-acero-inoxidable
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025826/pija-304-cabeza-fijadora-phillips-acero-inoxidable_lbj2mi.webp
- pija-304-cabeza-plana-phillips-acero-inoxidable
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025827/pija-304-cabeza-plana-phillips-acero-inoxidable_l2fgjz.webp
- pija-410-punta-broca-cabeza-hexagonal-acero-inoxidable
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025829/pija-410-punta-broca-cabeza-hexagonal-acero-inoxidable_dcxe5s.webp
- pija-cabeza-fijadora-combi-latonada
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025830/pija-cabeza-fijadora-combi-latonada_jxe8en.webp
- pija-cabeza-hexagonal-para-lamina
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025831/pija-cabeza-hexagonal-para-lamina_f2umoi.webp
- pija-cabeza-plana-phillips-lamina-galvanizada
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025832/pija-cabeza-plana-phillips-lamina-galvanizada_iz22nd.webp
- pija-galvanizada-cabeza-hexagonal-madera
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025833/pija-galvanizada-cabeza-hexagonal-madera_jjspiy.webp
- pija-galvanizada-cabeza-hexagonal-punta-broca-calidad
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025835/pija-galvanizada-cabeza-hexagonal-punta-broca-calidad_z0usra.webp
- pija-galvanizada-punta-fijadora-combinada
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025836/pija-galvanizada-punta-fijadora-combinada_f02x9t.webp
- pija-k-lath-punta-aguda-galvanizada
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025837/pija-k-lath-punta-aguda-galvanizada_xgcws8.webp
- pija-k-lath-punta-broca-galvanizado-galaxy
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025838/pija-k-lath-punta-broca-galvanizado-galaxy_jqauaa.webp
- pija-multiusos-phillips-negra
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025839/pija-multiusos-phillips-negra_vduwrr.webp
- varilla-acme-1mt
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025806/varilla-acme-1mt_va0fkv.webp
- varilla-grad-2-galv-1mt
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025807/varilla-grad-2-galv-1mt_xwj86t.webp
- varilla-grad-2-galv-3mt
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025808/varilla-grad-2-galv-3mt_bck3hj.webp
- varilla-grad-5-1mt-neg
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025809/varilla-grad-5-1mt-neg_njknro.webp
- varilla-negra-b7-1mt
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025810/varilla-negra-b7-1mt_vgeivj.webp
- varilla-rosc-acer-inox-304-3ft
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025812/varilla-rosc-acer-inox-304-3f_ypezli.webp
- varilla-rosc-cl-8.8-neg-1mt-mm
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025813/varilla-rosc-cl-8.8-neg-1mt-mm_egmyin.webp
- rondana-de-presion-acero-inoxidable-304-std
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025842/rondana-de-presion-acero-inoxidable-304-std_op2isy.webp
- rondana-de-presion-galvanizada
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025843/rondana-de-presion-galvanizada_zkv20o.webp
- rondana-de-presion-metrica-negra-din-127
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025844/rondana-de-presion-metrica-negra-din-12_x8wj2y.webp
- rondana-de-presion-negra
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025845/rondana-de-presion-negra_kmkshm.webp
- rondana-f-436-negra
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025847/rondana-f-436-negra_ltf09n.webp
- rondana-plana-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025848/rondana-plana-acero-inoxidable-304_z23l5c.webp
- opresor-hexagono-interior-punta-copa-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025820/opresor-hexagono-interior-punta-copa-acero-inoxidable-304_u52ti7.webp
- opresor-hexagono-interior-punta-copa-std
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025821/opresor-hexagono-interior-punta-copa-std_zzoowo.webp
- opresor-punta-copa-mm-din-916-std
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025823/opresor-punta-copa-mm-din-916-std_jeftxm.webp
- perno-solido-rectificado-inches
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025824/perno-solido-rectificado-inches_dzyhlm.webp
- perno-solido-rectificado-mm
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025825/perno-solido-rectificado-mm_lxtd0l.webp
- remache-pop-corta-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025841/remache-pop-corta-acero-inoxidable-304_rvan45.webp
- nudo-maleable-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025819/nudo-maleable-acero-inoxidable-304_hoterp.webp
- taquete-arpon-acero-inoxidable-304
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025850/taquete-arpon-acero-inoxidable-304_i2zhrs.webp

### Still without image in the categories above

Products of the categories above that are neither mapped nor mentioned in the review. Format: `customId (brand)`.

- **herrajes-accesorios-cable** (1)
  - [x] - nudo-para-cable-maleable-weston (weston)
    - `WT-00100`
    - `WT-00120`
    - `WT-00140`
- **llaves-herramientas-apriete** (7)
  - [x] dado-cuadro-1-llanta-trasera-capuchon (king-tony)
    - `KT-851426S`
  - [x] dado-cuadro-1-2-punta-ribe (king-tony)
    - `KT-404904`
    - `KT-404905`
    - `KT-404906`
  - [x] llave-tipo-torx-larga-bondhus (bondhus)
    - `B421-32806`
    - `B421-32807`
    - `B421-32808`
  - [x] llave-gancho-ajustable-13-35mm (king-tony)
    - `KT-3641-35`
  - [x] llaves-combinadas-matraca-cambio (king-tony)
    - `KT-373208M`
    - `KT-373212M`
    - `KT-373217M`
  - [x] 1-2-punta-bristol-cromado (king-tony)
    - `KT-406614`
  - [x] pinza-presion-curva-cromada (king-tony)
    - `KT-6011-07`
- **herramientas-corte-conformado** (53)
  - [x] discos-corte-weston (weston)
    - `Z-20185`
    - `Z-20190`
    - `Z-20197`
  - [x] buriles-cuadrados-cobalto-cleveland (cleveland)
    - `CC44540`
    - `CC44544`
    - `CC44545`
  - buriles-incor-k-42 (cleveland) (not found)
    - `I01-001`
    - `I01-002`
    - `I01-003`
  - extension-machuelos-bohrcraft (bohrcraft) (not found)
    - `BC-4500-270`
    - `BC-4500-340`
    - `BC-4500-700`
  - juego-machuelos-aac-cleveland (cleveland) (not found)
    - `GGG107883`
    - `GGG107943`
    - `GGG108003`
  - [x] juego-machuelos-aav-cleveland (cleveland)
    - `CC1123-05323`
    - `CC1123-06243`
    - `CC1123-06323`
  - [x] machuelos-izq-semiconicos-aav-volkel (volkel)
    - `27026-2`
    - `27030-2`
    - `27034-2`
  - [x] machuelos-izq-fraccionales-semiconicos-aav-volkel (volkel)
    - `23008-2`
    - `23010-2`
    - `23014-2`
  - [x] machuelos-izq-fracc-rectos-aav-volkel (volkel)
    - `23008-3`
    - `23010-3`
    - `23014-3`
  - [x] machuelos-izq-con-finos-volkel (volkel)
    - `24010-1`
    - `24014-1`
    - `24016-1`
  - [x] machuelos-izq-rectos-aav-volkel (volkel)
    - `27026-3`
    - `27030-3`
    - `27034-3`
  - [x] machuelos-izq-rectos-finos-volkel (volkel)
    - `24010-3`
    - `24014-3`
    - `24016-3`
  - [x] machuelo-npt-aav-volkel (volkel)
    - `63510`
    - `63512`
    - `63514`
  - [x] machuelo-maquina-acero-inox-agujeros-pasados-fracc-volkel (volkel)
    - `35945`
    - `35946`
    - `35947`
  - [x] machuelo-maquina-acero-inox-agujeros-ciegos-mm-volkel (volkel)
    - `36226`
    - `36230`
    - `36234`
  - [x] machuelo-maquina-acero-inox-agujeros-ciegos-fracc-volkel (volkel)
    - `36945`
    - `36946`
    - `36947`
  - [x] machuelo-maquina-helice-35-volkel (volkel)
    - `38726`
    - `38730`
    - `38734`
  - [x] dado-tarraja-mm-aav-volkel (volkel)
    - `27416`
    - `27422`
    - `27440`
  - [x] machuelo-izq-conicos-aav-volkel (volkel)
    - `27026-1`
    - `27030-1`
    - `27034-1`
  - [x] juego-machuelos-otros-volkel (volkel)
    - `49510`
    - `47001`
    - `47033`
  - juego-machuelos-bsp-av-2-piezas-bohrcraft (bohrcraft) (missing internal id)
    - no `internalId` on any variant
  - [x] juego-machuelos-fraccionales-aav-2-piezas-volkel (volkel)
    - `24305`
    - `24310`
    - `24314`
  - [x] juego-machuelos-milimetrico-aav-2-piezas-finos-volkel (volkel)
    - `26326`
    - `26336`
    - `26338`
  - [x] juego-machuelos-izq-fraccionales-aav-2-piezas-volkel (volkel)
    - `24010`
    - `24014`
    - `24016`
  - [x] juego-machuelos-izq-fraccionales-aav-3-piezas-volkel (volkel)
    - `23008`
    - `23010`
    - `23014`
  - [x] juego-machuelos-izq-milimetricos-aav-3-piezas-volkel (volkel)
    - `27026`
    - `27030`
    - `27034`
  - [x] juego-machuelos-aav-milimetricos-tipo-europeo-volkel (volkel)
    - `27316`
    - `27322`
    - `27326`
  - [x] machelo-conico-milimetricos-av-tipo-europeo-volkel (volkel)
    - `27316-1`
    - `27322-1`
    - `27326-1`
  - [x] machelo-recto-milimetricos-av-tipo-europeo-volkel (volkel)
    - `27316-3`
    - `27322-3`
    - `27326-3`
  - [x] machelo-recto-milimetricos-aav-fino-volkel (volkel)
    - `26326-2`
    - `26336-2`
    - `26338-2`
  - [x] laina-acero-azul-templado-5pul-precision (precision)
    - `PB-23130`
  - [x] laina-acero-inoxidable-150mm-1-25m-precision (precision)
    - `PB-22971`
    - `PB-22972`
    - `PB-22973`
  - [x] machuelo-bsp-aav-volkel (volkel)
    - `65312`
    - `65314`
    - `65316`
  - [x] machuelo-fraccional-aav-conico-fino-volkel (volkel)
    - `24305-1`
    - `24310-1`
    - `24314-1`
  - [x] machuelo-fraccional-aav-recto-fino-volkel (volkel)
    - `24305-3`
    - `24310-3`
    - `24314-3`
  - [x] machuelo-fino-l-coil-fraccional-aav-volkel (volkel)
    - `TEV-03154`
    - `TEV-03155`
    - `TEV-03156`
  - [x] machuelo-l-coil-fraccional-aav-volkel (volkel)
    - `TEV-03102`
    - `TEV-03104`
    - `TEV-03105`
  - [x] machuelo-l-coil-aav-milimetrico-volkel (volkel)
    - `TEV-03005`
    - `TEV-03006`
    - `TEV-03007`
  - [x] machuelo-milimetrico-aav-semiconico-volkel (volkel)
    - `27322-2`
    - `27326-2`
    - `27330-2`
  - [x] machuelo-npt-aav-weston (weston)
    - `ST-5-764-001`
    - `ST-5-764-002`
    - `ST-5-764-003`
  - [x] machuelo-ac-weston (weston)
    - `ST-5-778-140`
  - [x] machuelo-npt-ac-weston (weston)
    - `ST-5-778-500`
    - `ST-5-778-510`
    - `ST-5-778-515`
  - [x] machuelo-aav-npt-cleveland (cleveland)
    - `CC64038`
    - `CC64039`
    - `CC64040`
  - machuelo-npt-av-bohrcraft (bohrcraft) (missing internal id)
    - no `internalId` on any variant
  - [x] machuelo-maquina-fraccional-aav-volkel (volkel)
    - `75505`
    - `75508`
    - `75510`
  - [x] machuelo-sti-av-bohrcraft (bohrcraft)
    - `BC-4800-300`
    - `BC-4800-400`
    - `BC-4800-500`
  - [x] punzon-rompe-arrastre-volkel (volkel)
    - `TEV-07006`
    - `TEV-07008`
    - `TEV-07009`
  - rayador-carburo-saravia (bondhus) (not found)
    - `D600-94338`
  - [x] rima-recta-maquina-h8-weston (weston)
    - `ST-8-015-005`
    - `ST-8-015-010`
    - `ST-8-015-015`
  - [x] rima-maquina-h8-weston (weston)
    - `ST-8-019-040`
    - `ST-8-019-055`
    - `ST-8-019-065`
  - [x] rima-flauta-recta-aav-h7-weston (weston)
    - `ST-8-015-403`
    - `ST-8-015-406`
    - `ST-8-015-409`
  - [x] avellanador-weston (weston)
    - `ST-5-660-6015`
    - `ST-5-660-6020`
    - `ST-5-660-6035`
  - [x] avellanador-juego-6f-weston (weston)
    - `ST-5-660-6088`
    - `ST-5-660-8288`
    - `ST-5-660-9088`
- **roscado-herramientas-roscas** (1)
  - [x] kit-reparador-roscas-taller-volkel (volkel)
    - `TEV-04085`
- **perforacion-accesorios-taladro** (24)
  - broca-aav-135-split-point-thunderbit (bondhus) (not found)
    - `M211-12504`
    - `M211-12505`
    - `M211-12506`
  - [x] broca-carburo-solido-weston (weston)
    - `ST-1-160-040`
    - `ST-1-160-045`
    - `ST-1-160-050`
  - [x] broca-concreto-sds-weston (weston)
    - `ST-5-151-100`
    - `ST-5-151-150`
    - `ST-5-151-200`
  - [x] broca-concreto-weston (weston)
    - `ST-5-150-10000`
    - `ST-5-150-10002`
    - `ST-5-150-10004`
  - [x] broca-centro-acero-av-weston (weston)
    - `ST-8-600-010`
    - `ST-8-600-015`
    - `ST-8-600-020`
  - [x] broca-larga-acero-av-bohrcraft (bohrcraft)
    - `BC-1350-100`
    - `BC-1350-150`
    - `BC-1350-200`
  - [x] broca-wp-concreto-weston (weston)
    - `ST-5-148-020`
    - `ST-5-148-030`
    - `ST-5-148-050`
  - [x] broca-wp-zanco-sds-plus-weston (weston)
    - `ST-5-148-350`
    - `ST-5-148-370`
    - `ST-5-148-410`
  - [x] broca-extra-larga-acero-av-bohrcraft (bohrcraft)
    - `BC-1400-10200`
    - `BC-1400-10250`
    - `BC-1400-10300`
  - [x] broca-zanco-recto-acero-av-weston-abc (weston)
    - `ST-5-180-005`
    - `ST-5-180-010`
    - `ST-5-180-015`
  - [x] broca-zco-recto-cobalto-weston-inches (weston)
    - `ST-5-162-010`
    - `ST-5-162-025`
    - `ST-5-162-035`
  - [x] broca-zco-recto-acero-av-weston (weston)
    - `ST-5-163-010`
    - `ST-5-163-017`
    - `ST-5-163-022`
  - [x] jgo-brocas-av-numericas-60-pzas-weston (weston)
    - `ST-5-170-525`
  - insertos-elicoil-std-juego-6-escareadores-tornillo-allen-acero-av-bohrcraft (bohrcraft) (no internal id)
    - no `internalId` on any variant
  - [x] juego-brocas-cobalto-metricas-25-pzas (weston)
    - `ST-5-159-009`
  - [x] juego-brocas-cobalto-fraccionales-weston (weston)
    - `ST-5-159-006`
  - [x] broca-larga-tl-weston (weston)
    - `NB-5-164-015`
    - `NB-5-164-035`
    - `NB-5-164-050`
  - [x] broca-av-zanco-weston-inches (weston)
    - `ST-5-166-010`
    - `ST-5-166-015`
    - `ST-5-166-020`
  - [x] broca-av-zanco-weston-metric (weston)
    - `ST-5-166-260`
    - `ST-5-166-265`
    - `ST-5-166-270`
  - [x] broca-zanco-1-2-cobalto-weston (weston)
    - `ST-5-167-320`
    - `ST-5-167-360`
    - `ST-5-167-440`
  - [x] broca-larga-tl-inches-weston (weston)
    - `ST-5-164-005`
    - `ST-5-164-010`
    - `ST-5-164-055`
  - [x] broquero-con-llave-y-montaje-weston (weston)
    - `SA-010-0100`
    - `SA-010-0120`
    - `SA-010-0130`
  - [x] broquero-ajustable-weston (weston)
    - `SA-010-0340`
    - `SA-010-0360`
    - `SA-010-0370`
  - [x] broquero-jacobs-con-llave-weston (weston)
    - `SA-012-0060`
    - `SA-012-0080`
    - `SA-012-0200`

#### Uploaded URLs

- **herrajes-accesorios-cable**
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790024946/nudo-para-cable-maleable-weston_bp4goh.webp
- **llaves-herramientas-apriete**
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790024997/pinza-presion-curva-cromada_fcvzko.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790024996/llave-tipo-torx-larga-bondhus_m594ol.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790024996/llaves-combinadas-matraca-cambio_admhfd.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790024995/llave-gancho-ajustable-13-35mm_vgcxy8.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790024994/dado-cuadro-1-llanta-trasera-capuchon_jx8xiw.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790024994/dado-cuadro-1-2-punta-ribe_afedwv.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790024994/1-2-punta-bristol-cromado_dka8vt.webp
- **herramientas-corte-conformado**
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025187/machuelo-aav-npt-cleveland_xef0wd.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025187/machelo-recto-milimetricos-av-tipo-europeo-volkel_iqwgxc.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025185/machelo-recto-milimetricos-aav-fino-volkel_b7wep6.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025185/machelo-conico-milimetricos-av-tipo-europeo-volkel_cpdcri.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025184/laina-acero-inoxidable-150mm-1-25m-precision_fgjmav.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025183/laina-acero-azul-templado-5pul-precision_jlg520.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025183/juego-machuelos-otros-volkel_eq9vgv.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025181/juego-machuelos-milimetrico-aav-2-piezas-finos-volkel_kc3nik.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025181/juego-machuelos-izq-milimetricos-aav-3-piezas-volkel_br5jqe.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025180/juego-machuelos-izq-fraccionales-aav-3-piezas-volkel_m5s8jm.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025179/juego-machuelos-izq-fraccionales-aav-2-piezas-volkel_efszb0.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025178/juego-machuelos-fraccionales-aav-2-piezas-volkel_pbzxiz.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025177/juego-machuelos-aav-milimetricos-tipo-europeo-volkel_mgwho4.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025177/juego-machuelos-aav-cleveland_xzbnvg.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025176/discos-corte-weston_wmz6ax.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025175/dado-tarraja-mm-aav-volkel_kbpzih.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025174/buriles-cuadrados-cobalto-cleveland_yrhz6j.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025174/avellanador-weston_tap5jk.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025173/avellanador-juego-6f-weston_ejsyes.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025172/rima-recta-maquina-h8-weston_bf2izu.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025171/rima-maquina-h8-weston_wq751d.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025171/rima-flauta-recta-aav-h7-weston_mpw2ze.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025170/punzon-rompe-arrastre-volkel_drt34y.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025169/machuelo-sti-av-bohrcraft_qbx3bu.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025169/machuelos-izq-semiconicos-aav-volkel_xebgxa.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025168/machuelos-izq-rectos-finos-volkel_l8pqkq.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025167/machuelos-izq-rectos-aav-volkel_o0nxs3.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025166/machuelos-izq-fracc-rectos-aav-volkel_p00lpj.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025165/machuelos-izq-fraccionales-semiconicos-aav-volkel_jy7naf.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025165/machuelos-izq-con-finos-volkel_ztcc9r.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025164/machuelo-npt-ac-weston_kjjnse.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025163/machuelo-npt-aav-weston_apkdgv.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025163/machuelo-npt-aav-volkel_zji32y.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025162/machuelo-milimetrico-aav-semiconico-volkel_enkphw.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025161/machuelo-maquina-helice-35-volkel_bs4zkj.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025161/machuelo-maquina-fraccional-aav-volkel_wsgjje.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025160/machuelo-maquina-acero-inox-agujeros-pasados-fracc-volkel_fr8wov.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025159/machuelo-maquina-acero-inox-agujeros-ciegos-mm-volkel_tymbb6.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025158/machuelo-maquina-acero-inox-agujeros-ciegos-fracc-volkel_x4nbap.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025157/machuelo-l-coil-fraccional-aav-volkel_syabrd.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025157/machuelo-l-coil-aav-milimetrico-volkel_ppwg7d.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025156/machuelo-izq-conicos-aav-volkel_uvfhoh.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025155/machuelo-fraccional-aav-recto-fino-volkel_fvpefc.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025154/machuelo-fraccional-aav-conico-fino-volkel_lw2adx.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025154/machuelo-fino-l-coil-fraccional-aav-volkel_d3wz1z.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025153/machuelo-bsp-aav-volkel_mvk1wb.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025153/machuelo-ac-weston_dulzr7.webp
- **roscado-herramientas-roscas**
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025562/kit-reparador-roscas-taller-volkel_yhxk3n.webp
- **perforacion-accesorios-taladro**
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025647/juego-brocas-cobalto-metricas-25-pzas_yyrvfi.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025646/juego-brocas-cobalto-fraccionales-weston_fd7pne.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025644/jgo-brocas-av-numericas-60-pzas-weston_kfml8d.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025644/broquero-jacobs-con-llave-weston_qzqdps.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025642/broquero-con-llave-y-montaje-weston_gegckb.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025641/broquero-ajustable-weston_yxbsho.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025640/broca-zco-recto-cobalto-weston-inches_eer7te.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025639/broca-zco-recto-acero-av-weston_zwst8y.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025638/broca-zanco-recto-acero-av-weston-abc_l4kk5c.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025637/broca-zanco-1-2-cobalto-weston_ar3wgw.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025636/broca-wp-zanco-sds-plus-weston_dbcrkv.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025635/broca-wp-concreto-weston_hwvvxq.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025634/broca-larga-tl-weston_vnnlra.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025633/broca-larga-tl-inches-weston_lhp1n9.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025632/broca-larga-acero-av-bohrcraft_n4xe5j.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025631/broca-extra-larga-acero-av-bohrcraft_yqcyco.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025630/broca-concreto-weston_jrtzh4.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025629/broca-concreto-sds-weston_l4lmma.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025628/broca-centro-acero-av-weston_zsewu5.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025627/broca-carburo-solido-weston_rnnwgc.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025626/broca-av-zanco-weston-metric_sfxoqs.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025625/broca-av-zanco-weston-inches_mthlnb.webp
- **tornilleria**
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025885/tuerca-flange-aserra-galv-estandar_dodemy.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025884/tuerca-bellota-niquelada-nc-nf_cro6zh.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025883/tuerca-2h-negra_c1rhpl.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025882/tornillo-maquina-cabeza-hexagonal-grado-2-cda-corrida-galvanizado_yivy5b.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025880/tornillo-hex-int-cab-plana-acer-inox-304_jv8yus.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025879/tornillo-hex-int-cab-cil-acer-inox-304_em43bo.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025878/tornillo-hex-int-cab-bot-acer-inox-304_yhegmx.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025877/tornillo-hexagono-interior-guia-std_qkrjbo.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025876/tornillo-hexagono-interior-cabeza-plana-std_p2dx36.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025874/tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912_lfrpty.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025873/tornillo-hexagono-interior-cabeza-boton-std_jggvri.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025872/tornillo-hexagono-interior-cabeza-baja-metrico_r24d7j.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025871/tornillo-hexagono-interior-cabeza-baja-cilindrica_mkq1a0.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025869/tornillo-cabeza-queso-ranurado-din-84-metrico_wfetgl.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025868/tornillo-cabeza-queso-din-84-acero-inoxidable-304-metrico_t626go.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025867/tornillo-cabeza-plana-ranurado-phillips-acero-inoxidable-304_kntjiq.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025866/tornillo-cabeza-plana-phillips-metrico-din-965_xhbmz8.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025865/tornillo-cabeza-plana-phillips-galvanizado_eqp8ze.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025863/tornillo-cabeza-hexagonal-grado-8-negro-std_b1yzlv.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025862/tornillo-cabeza-hexagonal-grado-5-negro-unc_liapr1.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025861/tornillo-cabeza-hexagonal-grado-5-negro-fino_lzn9of.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025860/tornillo-cabeza-hexagonal-cuerda-corrida-acero-inoxidable-304_re6uhs.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025859/tornillo-cabeza-hexagonal-cl-8-8-fino-din-960-96_hbxqbd.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025857/tornillo-cabeza-hexagonal-cl-8-8-din-933-931_cnolh3.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025856/tornillo-cabeza-gota-ranurado-combinado-acero-inoxidable-304_feoedh.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025855/tornillo-cabeza-gota-combinado-galvanizado_y7hkly.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025854/tornillo-cabeza-fijadora-ranurado-din-85-acero-inoxidable-304-metrico_oma1sd.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025852/tornillo-cabeza-coche-grado-2-galvanizado_gknqi6.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025851/tornillo-cabeza-coche-acero-inoxidable-304_ecbqvp.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025850/taquete-arpon-acero-inoxidable-304_i2zhrs.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025849/tapon-dry-seal_reezsm.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025848/rondana-plana-acero-inoxidable-304_z23l5c.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025847/rondana-f-436-negra_ltf09n.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025845/rondana-de-presion-negra_kmkshm.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025844/rondana-de-presion-metrica-negra-din-12_x8wj2y.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025843/rondana-de-presion-galvanizada_zkv20o.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025842/rondana-de-presion-acero-inoxidable-304-std_op2isy.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025841/remache-pop-corta-acero-inoxidable-304_rvan45.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025839/pija-multiusos-phillips-negra_vduwrr.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025838/pija-k-lath-punta-broca-galvanizado-galaxy_jqauaa.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025837/pija-k-lath-punta-aguda-galvanizada_xgcws8.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025836/pija-galvanizada-punta-fijadora-combinada_f02x9t.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025835/pija-galvanizada-cabeza-hexagonal-punta-broca-calidad_z0usra.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025833/pija-galvanizada-cabeza-hexagonal-madera_jjspiy.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025832/pija-cabeza-plana-phillips-lamina-galvanizada_iz22nd.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025831/pija-cabeza-hexagonal-para-lamina_f2umoi.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025830/pija-cabeza-fijadora-combi-latonada_jxe8en.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025829/pija-410-punta-broca-cabeza-hexagonal-acero-inoxidable_dcxe5s.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025827/pija-304-cabeza-plana-phillips-acero-inoxidable_l2fgjz.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025826/pija-304-cabeza-fijadora-phillips-acero-inoxidable_lbj2mi.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025825/perno-solido-rectificado-mm_lxtd0l.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025824/perno-solido-rectificado-inches_dzyhlm.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025823/opresor-punta-copa-mm-din-916-std_jeftxm.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025821/opresor-hexagono-interior-punta-copa-std_zzoowo.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025820/opresor-hexagono-interior-punta-copa-acero-inoxidable-304_u52ti7.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025819/nudo-maleable-acero-inoxidable-304_hoterp.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025818/juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-galaxy_mpp6hz.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025817/juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-calidad-plus_grgvre.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025815/accesorios-epdm-pija-punta-de-broca_wgihmd.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025814/accesorios-epdm-calidad-plus-pija-punta-de-broca_e3lwyf.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025813/varilla-rosc-cl-8.8-neg-1mt-mm_egmyin.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025812/varilla-rosc-acer-inox-304-3f_ypezli.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025810/varilla-negra-b7-1mt_vgeivj.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025809/varilla-grad-5-1mt-neg_njknro.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025808/varilla-grad-2-galv-3mt_bck3hj.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025807/varilla-grad-2-galv-1mt_xwj86t.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025806/varilla-acme-1mt_va0fkv.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025804/tuerca-tino-4-puntas-galv-nc-nf_iangq5.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025803/tuerca-mariposa-forjada-galvanizada_th0h9l.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025802/tuerca-mariposa-acer-inox-304_gqxu2j.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025801/tuerca-inserto-nylon-galv-nc_ykpg0g.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025800/tuerca-inserto-nylon-galvanizada-nf_cpfg9u.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025798/tuerca-inserto-nylon-din-985-galv_b3putv.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025797/tuerca-hexagonal-rosca-acme-grado-2-negra-forjada_l31lea.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025796/tuerca-hexagonal-rosca-acme-gdo-2-negr-maquinada_owldyg.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025795/tuerca-hexagonal-metrica-din-934-negra_f7mggq.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025794/tuerca-hexagonal-liviana-grado-2-nc-negra_slxiu5.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025793/tuerca-hexagonal-liviana-grado-2-nc-galv_jqn377.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025791/tuerca-hexagonal-grado-5-nf-pav_xm75rz.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025790/tuerca-hexagonal-grado-5-nc-pav_cunrz2.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025789/tuerca-gripco-grado-c-galv-nc-nf_wxcfzv.webp
  - https://res.cloudinary.com/dov7g4avx/image/upload/v1790025788/tuerca-flange-aserra-galv-metr_e40xwl.webp

### tornilleria — pending products (107)

`categoryCustomId: "tornilleria"` in `../products-tehesa/data`, grouped by `subcategory`. 81 mapped (`[x]`, see the actual URLs in section 2), 3 flagged (`ⓧ`: 1 not found, 2 mala calidad), 23 still without a mapped image (see section 3).

- **tornillos** (37)
  - [x] tornillo-cabeza-coche-acero-inoxidable-304 — Tornillo Cabeza Coche de Acero Inoxidable 304
  - [x] tornillo-cabeza-coche-grado-2-galvanizado — Tornillo Cabeza Coche Grado 2 Galvanizado
  - [x] tornillo-cabeza-fijadora-ranurado-din-85-acero-inoxidable-304-metrico — Tornillo Cabeza Fijadora Ranurado DIN 85 de Acero Inoxidable 304 Milimétrico
  - [x] tornillo-cabeza-gota-combinado-galvanizado — Tornillo Cabeza Gota Combinado Galvanizado
  - [x] tornillo-cabeza-gota-ranurado-combinado-acero-inoxidable-304 — Tornillo Cabeza Gota Ranurado y Combinado de Acero Inoxidable 304
  - [x] tornillo-cabeza-hexagonal-cl-8-8-din-933-931 — Tornillo Cabeza Hexagonal CL 8.8 DIN 933/931
  - [x] tornillo-cabeza-hexagonal-cl-8-8-fino-din-960-96 — Tornillo Cabeza Hexagonal CL 8.8 Fino DIN 960/96
  - [x] tornillo-cabeza-hexagonal-cuerda-corrida-acero-inoxidable-304 — Tornillo Cabeza Hexagonal Cuerda Corrida de Acero Inoxidable 304
  - tornillo-cabeza-hexagonal-din-933-931-acero-inoxidable-304 — Tornillo Cabeza Hexagonal Din 933 / 931 de Acero Inoxidable 304 Milimétrico
  - [x] tornillo-cabeza-hexagonal-grado-5-negro-fino — Tornillo Cabeza Hexagonal Grado 5 Negro Fino
  - [x] tornillo-cabeza-hexagonal-grado-5-negro-unc — Tornillo Cabeza Hexagonal Grado 5 Negro UNC
  - tornillo-cabeza-hexagonal-grado-8-negro-fino — Tornillo Cabeza Hexagonal Grado 8 Negro Fino
  - [x] tornillo-cabeza-hexagonal-grado-8-negro-std — Tornillo Cabeza Hexagonal Grado 8 Negro STD
  - [x] tornillo-cabeza-plana-phillips-galvanizado — Tornillo Cabeza Plana Phillips Galvanizado
  - [x] tornillo-cabeza-plana-phillips-metrico-din-965 — Tornillo Cabeza Plana Phillips Milimétrico DIN 965
  - tornillo-cabeza-plana-ranurado-din-963-acero-inoxidable-304-metrico — Tornillo Cabeza Plana Ranurado DIN 963 de Acero Inoxidable 304 Milimétrico
  - [x] tornillo-cabeza-plana-ranurado-phillips-acero-inoxidable-304 — Tornillo Cabeza Plana Ranurado y Phillips de Acero Inoxidable 304
  - [x] tornillo-cabeza-queso-din-84-acero-inoxidable-304-metrico — Tornillo Cabeza Queso DIN 84 de Acero Inoxidable 304 Milimétrico
  - [x] tornillo-cabeza-queso-ranurado-din-84-metrico — Tornillo Cabeza Queso Ranurado Milimétrico DIN 84
  - [x] tornillo-hex-int-cab-bot-acer-inox-304 — Tornillo de Hexágono Interior Cabeza Boton de Acero Inoxidable 304
  - tornillo-hex-int-cab-bot-acer-inox-304-metrico — Tornillo de Hexágono Interior Cabeza Boton de Acero Inoxidable 304 Milimétrico
  - [x] tornillo-hex-int-cab-cil-acer-inox-304 — Tornillo de Hexágono Interior Cabeza Cilindro de Acero Inoxidable 304
  - tornillo-hex-int-cab-cil-din-912-acer-inox-304-mm — Tornillo de Hexágono Interior Cabeza Cilindro DIN 912 de Acero Inoxidable 304 Milimétrico
  - [x] tornillo-hex-int-cab-plana-acer-inox-304 — Tornillo de Hexágono Interior Cabeza Plana de Acero Inoxidable 304
  - tornillo-hex-int-cab-plana-din-7991-acer-inox-304-mm — Tornillo de Hexágono Interior Cabeza Plana DIN 7991 de Acero Inoxidable 304 Milimétrico
  - [x] tornillo-hexagono-interior-cabeza-baja-cilindrica — Tornillo de Hexagono Interior Cabeza Baja Cilindrica
  - [x] tornillo-hexagono-interior-cabeza-baja-metrico — Tornillo de Hexágono Interior Cabeza Baja Milimétrico
  - tornillo-hexagono-interior-cabeza-boton — Tornillo de Hexágono Interior Cabeza Botón
  - [x] tornillo-hexagono-interior-cabeza-boton-std — Tornillo de Hexagono Interior Cabeza Botón STD
  - tornillo-hexagono-interior-cabeza-cilindrica — Tornillo de Hexágono Interior Cabeza Cilíndrica
  - [x] tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912 — Tornillo de Hexágono Interior Cabeza Cilindrica Milimétrico DIN 912
  - ⓧ tornillo-hexagono-interior-cabeza-plana-metrico-din-7991 — Tornillo de Hexágono Interior Cabeza Plana Milimétrico DIN 7991 (not found)
  - [x] tornillo-hexagono-interior-cabeza-plana-std — Tornillo de Hexágono Interior Cabeza Plana STD
  - tornillo-hexagono-interior-guia — Tornillo de Hexágono Interior Guia
  - [x] tornillo-hexagono-interior-guia-std — Tornillo de Hexágono Interior Guia STD
  - [x] tornillo-maquina-cabeza-hexagonal-grado-2-cda-corrida-galvanizado — Tornillo Maquina Cabeza Hexagonal Grado 2 CDA Corrida Galvanizado
  - tornillo-ojo-forjado-weston — Tornillo Ojo Forjado
- **tuerca** (26)
  - [x] tuerca-2h-negra — Tuerca 2H Negra
  - tuerca-bellota-acer-inox-304 — Tuerca Bellota de Acero Inoxidable 304
  - [x] tuerca-bellota-niquelada-nc-nf — Tuerca Bellota Niquelada NC & NF
  - ⓧ tuerca-cople-galvanizada — Tuerca Cople Galvanizada (mala calidad)
  - [x] tuerca-flange-aserra-galv-estandar — Tuerca Flange Aserrada Galvanizada Estándar
  - [x] tuerca-flange-aserra-galv-metr — Tuerca Flange Aserrada Galvanizada Métrica
  - [x] tuerca-gripco-grado-c-galv-nc-nf — Tuerca Gripco Grado C Galvanizada NC & NF
  - tuerca-hexagonal-din-934-acer-inox-304 — Tuerca Hexagonal DIN 934 de Acero Inoxidable 304
  - [x] tuerca-hexagonal-grado-5-nc-pav — Tuerca Hexagonal Grado 5 NC Pavonada
  - [x] tuerca-hexagonal-grado-5-nf-pav — Tuerca Hexagonal Grado 5 NF Pavonada
  - ⓧ tuerca-hexagonal-grado-8-nc-pav — Tuerca Hexagonal Grado 8 NC Pavonad (mala calidad)
  - tuerca-hexagonal-inserto-nylon-acero-inoxidable-304-std — Tuerca Hexagonal Inserto de Nylon Acero Inoxidable 304 STD
  - tuerca-hexagonal-inserto-nylon-fina-acero-inoxidable-304 — Tuerca Hexagonal Inserto de Nylon Fina Acero Inoxidable 304
  - tuerca-hexagonal-inserto-nylon-inoxidable-304-milimetrica — Tuerca Hexagonal Inserto de Nylon Inoxidable 304 Milimétrica
  - [x] tuerca-hexagonal-liviana-grado-2-nc-galv — Tuerca Hexagonal Liviana Grado 2 NC Galvanizada
  - [x] tuerca-hexagonal-liviana-grado-2-nc-negra — Tuerca Hexagonal Liviana Grado 2 NC Negra
  - [x] tuerca-hexagonal-metrica-din-934-negra — Tuerca Hexagonal Métrica DIN 934 Negra
  - tuerca-hexagonal-nc-nf-acer-inox-304 — Tuerca Hexagonal NC y NF de Acero Inoxidable 304
  - [x] tuerca-hexagonal-rosca-acme-gdo-2-negr-maquinada — Tuerca Hexagonal Rosca Acme Grado 2 Negra Maquinada
  - [x] tuerca-hexagonal-rosca-acme-grado-2-negra-forjada — Tuerca Hexagonal Rosca Acme Grado 2 Negra forjada
  - [x] tuerca-inserto-nylon-din-985-galv — Tuerca con Inserto de Nylon Métrica - DIN 985 Galvanizada
  - [x] tuerca-inserto-nylon-galv-nc — Tuerca con Inserto de Nylon Galvanizada NC
  - [x] tuerca-inserto-nylon-galvanizada-nf — Tuerca con Inserto de Nylon Galvanizada NF
  - [x] tuerca-mariposa-acer-inox-304 — Tuerca Mariposa de Acero Inoxidable 304
  - [x] tuerca-mariposa-forjada-galvanizada — Tuerca Mariposa Forjada Galvanizada
  - [x] tuerca-tino-4-puntas-galv-nc-nf — Tuerca Tino de 4 Puntas Galvanizado NC & NF
- **pija** (17)
  - [x] accesorios-epdm-calidad-plus-pija-punta-de-broca — Accesorios de E.P.D.M. Calidad Plus para Pija Punta de Broca
  - [x] accesorios-epdm-pija-punta-de-broca — Accesorios de E.P.D.M para Pija Punta de Broca
  - [x] juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-calidad-plus — Juego de Pijas de Cabeza Hexagonal, Punta Broca y Accesorio de E.P.D.M. Ensamblado Calidad Plus
  - [x] juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-galaxy — Juego de Pijas de Cabeza Hexagonal, Punta Broca y Accesorio de E.P.D.M. Galaxy Ensamblado
  - [x] pija-304-cabeza-fijadora-phillips-acero-inoxidable — Pija 304 de Cabeza Fijadora Phillips de Acero Inoxidable
  - [x] pija-304-cabeza-plana-phillips-acero-inoxidable — Pija 304 de Cabeza Plana Phillips de Acero Inoxidable
  - [x] pija-410-punta-broca-cabeza-hexagonal-acero-inoxidable — Pija 410 Punta de Broca Cabeza Hexagonal de Acero Inoxidable
  - [x] pija-cabeza-fijadora-combi-latonada — Pija Cabeza Fijadora Combi Latonada
  - [x] pija-cabeza-hexagonal-para-lamina — Pija de Cabeza Hexagonal para Lamina
  - [x] pija-cabeza-plana-phillips-lamina-galvanizada — Pija de Cabeza Plana Phillips para Lamina Galvanizada
  - [x] pija-galvanizada-cabeza-hexagonal-madera — Pija Galvanizada de Cabeza Hexagonal para Madera
  - [x] pija-galvanizada-cabeza-hexagonal-punta-broca-calidad — Pija Galvanizada de Cabeza Hexagonal, Punta Broca Calidad Plus
  - pija-galvanizada-galaxy-cabeza-hexagonal-punta-broca — Pija Galvanizada Galaxy de Cabeza Hexagonal, Punta de Broca
  - [x] pija-galvanizada-punta-fijadora-combinada — Pija Galvanizada de Punta Fijadora Combinada
  - [x] pija-k-lath-punta-aguda-galvanizada — Pija K-Lath Punta Aguda Galvanizada
  - [x] pija-k-lath-punta-broca-galvanizado-galaxy — Pija K-Lath Punta de Broca Galvanizado Galaxy
  - [x] pija-multiusos-phillips-negra — Pija Multiusos Phillips Negra
- **varilla** (9)
  - [x] varilla-acme-1mt — Varilla Acme de 1 Metro de Largo
  - [x] varilla-grad-2-galv-1mt — Varilla Grado 2 Galvanizado de 1 Metro de Largo
  - [x] varilla-grad-2-galv-3mt — Varilla Grado 2 Galvanizado de 3 Metros de Largo
  - [x] varilla-grad-5-1mt-neg — Varilla Grado 5 de 1 Metro de Largo Negra
  - [x] varilla-negra-b7-1mt — Varilla Negra B7 de 1 Metro de Largo
  - [x] varilla-rosc-acer-inox-304-3ft — Varilla Roscada de Acero Inoxidable 304 de 3 pies
  - varilla-rosc-cl-4.8-neg-1mt-mm — Varilla Roscada Clase 4.8 Negra de 1 Metro de Largo Milimétrica
  - [x] varilla-rosc-cl-8.8-neg-1mt-mm — Varilla Roscada Clase 8.8 Negra de 1 Metro de Largo Milimétrica
  - varilla-rosc-din-975-acer-inox-304-1mt — Varilla Roscada DIN 975 de Acero Inoxidable 304 de 1 Metro de Largo
- **rondana** (8)
  - [x] rondana-de-presion-acero-inoxidable-304-std — Rondana de Presión de Acero Inoxidable 304 STD
  - rondana-de-presion-din-127-acero-inoxidable-304 — Rondana de Presión DIN 127 de Acero Inoxidable 304
  - [x] rondana-de-presion-galvanizada — Rondana de Presión Galvanizada
  - [x] rondana-de-presion-metrica-negra-din-127 — Rondana de Presion Métrica Negra DIN 127
  - [x] rondana-de-presion-negra — Rondana de Presión Negra
  - [x] rondana-f-436-negra — Rondana F-436 Negra
  - [x] rondana-plana-acero-inoxidable-304 — Rondana Plana de Acero Inoxidable 304
  - rondana-plana-din-125-acero-inoxidable-304 — Rondana Plana DIN 125 de Acero Inoxidable 304
- **opresor** (4)
  - [x] opresor-hexagono-interior-punta-copa-acero-inoxidable-304 — Opresor de Hexágono Interior Punta de Copa Acero Inoxidable 304
  - opresor-hexagono-interior-punta-copa-din-916-acero-inoxidable — Opresor de Hexágono Interior Punta de Copa DIN 916 de Acero Inoxidable
  - [x] opresor-hexagono-interior-punta-copa-std — Opresor de Hexágono Interior Punta de Copa STD
  - [x] opresor-punta-copa-mm-din-916-std — Opresor Punta de Copa MM DIN 916 STD
- **perno** (2)
  - [x] perno-solido-rectificado-inches — Perno Solido Rectificado en Pulgadas
  - [x] perno-solido-rectificado-mm — Perno Solido Rectificado en Millímetros
- **remache** (2)
  - remache-pop-ancha-acero-inoxidable-304 — Remache Pop a la ancha de Acero Inoxidable Tipo 304
  - [x] remache-pop-corta-acero-inoxidable-304 — Remache Pop a la corta de Acero Inoxidable Tipo 304
- **nudo** (1)
  - [x] nudo-maleable-acero-inoxidable-304 — Nudo Maleable de Acero Inoxidable 304
- **taquete** (1)
  - [x] taquete-arpon-acero-inoxidable-304 — Taquete Arpon de Acero Inoxidable 304

Total: 107 products.

## 3. Pending

Products with no entry in `data/product-images.json` (checked across every category in `../products-tehesa/data`, not just tornilleria):

- **Herrajes y accesorios para cable** (1)
  - nudo-para-cable-maleable-weston — Nudo para cable maleable (Weston)
    - WT-00100
    - WT-00120
    - WT-00140
- **Herramientas de corte y conformado** (54)
  - discos-corte-weston — Discos de corte (Weston)
    - Z-20185
    - Z-20190
    - Z-20197
  - buriles-cuadrados-cobalto-cleveland — Buriles Cuadrados de Cobalto (Cleveland)
    - CC44540
    - CC44544
    - CC44545
  - buriles-incor-k-42 — Buriles Incor K-42 (Cleveland)
    - I01-001
    - I01-002
    - I01-003
  - extension-machuelos-bohrcraft — Extensión para Machuelos (Bohrcraft)
    - BC-4500-270
    - BC-4500-340
    - BC-4500-700
  - juego-machuelos-aac-cleveland — Juego de Machuelos AAC (Cleveland)
    - GGG107883
    - GGG107943
    - GGG108003
  - juego-machuelos-aav-cleveland — Juego de Machuelos AAV (Cleveland)
    - CC1123-05323
    - CC1123-06243
    - CC1123-06323
  - juego-machuelos-av-bohrcraft — Juego de Machuelos A.V. (Bohrcraft)
  - machuelos-izq-semiconicos-aav-volkel — Machuelos Izquierdos Semiconicos A.A.V. Milimétrico (Volkel)
    - 27026-2
    - 27030-2
    - 27034-2
  - machuelos-izq-fraccionales-semiconicos-aav-volkel — Machuelos Izquierdos Fraccionales Semicónicos A.A.V. (Volkel)
    - 23008-2
    - 23010-2
    - 23014-2
  - machuelos-izq-fracc-rectos-aav-volkel — Machuelos Izquierdos Fraccionales Rectos A.A.V. (Volkel)
    - 23008-3
    - 23010-3
    - 23014-3
  - machuelos-izq-con-finos-volkel — Machuelos Izquierdos Cónicos Finos (Volkel)
    - 24010-1
    - 24014-1
    - 24016-1
  - machuelos-izq-rectos-aav-volkel — Machuelos Izquierdos Rectos A.A.V. (Volkel)
    - 27026-3
    - 27030-3
    - 27034-3
  - machuelos-izq-rectos-finos-volkel — Machuelos Izquierdos Rectos Finos (Volkel)
    - 24010-3
    - 24014-3
    - 24016-3
  - machuelo-npt-aav-volkel — Machuelo NPT A.A.V. (Volkel)
    - 63510
    - 63512
    - 63514
  - machuelo-maquina-acero-inox-agujeros-pasados-fracc-volkel — Machuelo Máquina Acero Inox Agujeros Pasados Fraccionales. (Volkel)
    - 35945
    - 35946
    - 35947
  - machuelo-maquina-acero-inox-agujeros-ciegos-mm-volkel — Machuelo Máquina Acero Inox Agujeros Ciegos Milimétricos. (Volkel)
    - 36226
    - 36230
    - 36234
  - machuelo-maquina-acero-inox-agujeros-ciegos-fracc-volkel — Machuelo Máquina Acero Inox Agujeros Ciegos Fraccionales. (Volkel)
    - 36945
    - 36946
    - 36947
  - machuelo-maquina-helice-35-volkel — Machuelo Máquina Hélice 35° (Volkel)
    - 38726
    - 38730
    - 38734
  - dado-tarraja-mm-aav-volkel — Dado Tarraja Milimétrica A.A.V. (Volkel)
    - 27416
    - 27422
    - 27440
  - machuelo-izq-conicos-aav-volkel — Machuelo Izquierdos Cónicos A.A.V. (Volkel)
    - 27026-1
    - 27030-1
    - 27034-1
  - juego-machuelos-otros-volkel — Juego de Machuelos y otros (Volkel)
    - 49510
    - 47001
    - 47033
  - juego-machuelos-bsp-av-2-piezas-bohrcraft — Juego de Machuelos BSP A.V. de 2 Piezas (Bohrcraft)
  - juego-machuelos-fraccionales-aav-2-piezas-volkel — Juego de Machuelos Fraccionales A.A.V. de 2 Piezas Finos (Volkel)
    - 24305
    - 24310
    - 24314
  - juego-machuelos-milimetrico-aav-2-piezas-finos-volkel — Juego de Machuelos Milimétricos A.A.V. de 2 Piezas finos (Volkel)
    - 26326
    - 26336
    - 26338
  - juego-machuelos-izq-fraccionales-aav-2-piezas-volkel — Juego de Machuelos Izquierdos Fraccionales Finos A.A.V. de 2 Piezas (Volkel)
    - 24010
    - 24014
    - 24016
  - juego-machuelos-izq-fraccionales-aav-3-piezas-volkel — Juego de Machuelos Izquierdos Fraccionales A.A.V. de 3 Piezas (Volkel)
    - 23008
    - 23010
    - 23014
  - juego-machuelos-izq-milimetricos-aav-3-piezas-volkel — Juego de Machuelos Izquierdos A.A.V. Milimétrico de 3 Piezas (Volkel)
    - 27026
    - 27030
    - 27034
  - juego-machuelos-aav-milimetricos-tipo-europeo-volkel — Juego de Machuelos A.A.V. Milimétrico Tipo Europeo (Volkel)
    - 27316
    - 27322
    - 27326
  - machelo-conico-milimetricos-av-tipo-europeo-volkel — Machuelo Cónico Milimétrico A.V. Tipo Europeo (Volkel)
    - 27316-1
    - 27322-1
    - 27326-1
  - machelo-recto-milimetricos-av-tipo-europeo-volkel — Machuelo Recto Milimétrico A.V. Tipo Europeo (Volkel)
    - 27316-3
    - 27322-3
    - 27326-3
  - machelo-recto-milimetricos-aav-fino-volkel — Machuelo Recto Milimétrico A.A.V. Fino (Volkel)
    - 26326-2
    - 26336-2
    - 26338-2
  - laina-acero-azul-templado-5pul-precision — Laina de Acero azul templado de 5" (Precision)
    - PB-23130
  - laina-acero-inoxidable-150mm-1-25m-precision — Laina de Acero Inoxidable de 150mm, 1.25m (Precision)
    - PB-22971
    - PB-22972
    - PB-22973
  - machuelo-bsp-aav-volkel — Machuelo BSP A.A.V. (Volkel)
    - 65312
    - 65314
    - 65316
  - machuelo-fraccional-aav-conico-fino-volkel — Machuelo Fraccional A.A.V. Cónico Fino. (Volkel)
    - 24305-1
    - 24310-1
    - 24314-1
  - machuelo-fraccional-aav-recto-fino-volkel — Machuelo Fraccional A.A.V. Recto Fino. (Volkel)
    - 24305-3
    - 24310-3
    - 24314-3
  - machuelo-fino-l-coil-fraccional-aav-volkel — Machuelo Fino L-Coil Fraccional A.A.V. (Volkel)
    - TEV-03154
    - TEV-03155
    - TEV-03156
  - machuelo-l-coil-fraccional-aav-volkel — Machuelo L-Coil Fraccional A.A.V. (Volkel)
    - TEV-03102
    - TEV-03104
    - TEV-03105
  - machuelo-l-coil-aav-milimetrico-volkel — Machuelo L-Coil A.A.V. Milimétrico (Volkel)
    - TEV-03005
    - TEV-03006
    - TEV-03007
  - machuelo-milimetrico-aav-semiconico-volkel — Machuelo Milimétrico A.A.V. Semiconico (Volkel)
    - 27322-2
    - 27326-2
    - 27330-2
  - machuelo-npt-aav-weston — Machuelo NPT A.A.V. (Weston)
    - ST-5-764-001
    - ST-5-764-002
    - ST-5-764-003
  - machuelo-ac-weston — Machuelo A.C. (Weston)
    - ST-5-778-140
  - machuelo-npt-ac-weston — Machuelo NPT A.C (Weston)
    - ST-5-778-500
    - ST-5-778-510
    - ST-5-778-515
  - machuelo-aav-npt-cleveland — Machuelo AAV NPT (Cleveland)
    - CC64038
    - CC64039
    - CC64040
  - machuelo-npt-av-bohrcraft — Machuelo NPT A.V. (Bohrcraft)
  - machuelo-maquina-fraccional-aav-volkel — Machuelo para Máquina Fraccional A.A.V. (Volkel)
    - 75505
    - 75508
    - 75510
  - machuelo-sti-av-bohrcraft — Machuelo STI A.V. (Bohrcraft)
    - BC-4800-300
    - BC-4800-400
    - BC-4800-500
  - punzon-rompe-arrastre-volkel — Punzon Rompe Arrastre (Volkel)
    - TEV-07006
    - TEV-07008
    - TEV-07009
  - rayador-carburo-saravia — Rayador de Carburo (Bondhus)
    - D600-94338
  - rima-recta-maquina-h8-weston — Rima recta de máquina H8 (Weston)
    - ST-8-015-005
    - ST-8-015-010
    - ST-8-015-015
  - rima-maquina-h8-weston — Rima de máquina H8 (Weston)
    - ST-8-019-040
    - ST-8-019-055
    - ST-8-019-065
  - rima-flauta-recta-aav-h7-weston — Rima de máquina Flauta Recta A.A.V. H7 (Weston)
    - ST-8-015-403
    - ST-8-015-406
    - ST-8-015-409
  - avellanador-weston — Avellanador A.V. (Weston)
    - ST-5-660-6015
    - ST-5-660-6020
    - ST-5-660-6035
  - avellanador-juego-6f-weston — Juego de Avellanadores 6F (Weston)
    - ST-5-660-6088
    - ST-5-660-8288
    - ST-5-660-9088
- **Llaves y herramientas de apriete** (7)
  - dado-cuadro-1-llanta-trasera-capuchon — Dado Cuadro 1" Llanta Trasera Capuchon (King Tony)
    - KT-851426S
  - dado-cuadro-1-2-punta-ribe — Dado Cuadro 1/2" con Punta Ribe (King Tony)
    - KT-404904
    - KT-404905
    - KT-404906
  - llave-tipo-torx-larga-bondhus — Llave Tipo Torx Larga (Bondhus)
    - B421-32806
    - B421-32807
    - B421-32808
  - llave-gancho-ajustable-13-35mm — Llave de Gancho Ajustable 13 - 35mm (King Tony)
    - KT-3641-35
  - llaves-combinadas-matraca-cambio — Llaves Combinadas de Matraca con Cambio (King Tony)
    - KT-373208M
    - KT-373212M
    - KT-373217M
  - 1-2-punta-bristol-cromado — 1/2" Punta Bristol Cromado (King Tony)
    - KT-406614
  - pinza-presion-curva-cromada — Pinza de Presión Curva Cromada (King Tony)
    - KT-6011-07
- **Tornillería** (26)
  - opresor-hexagono-interior-punta-copa-din-916-acero-inoxidable — Opresor de Hexágono Interior Punta de Copa DIN 916 de Acero Inoxidable (Marca Libre)
  - pija-galvanizada-galaxy-cabeza-hexagonal-punta-broca — Pija Galvanizada Galaxy de Cabeza Hexagonal, Punta de Broca (Marca Libre)
  - remache-pop-ancha-acero-inoxidable-304 — Remache Pop a la ancha de Acero Inoxidable Tipo 304 (Marca Libre)
  - rondana-plana-din-125-acero-inoxidable-304 — Rondana Plana DIN 125 de Acero Inoxidable 304 (Marca Libre)
  - rondana-de-presion-din-127-acero-inoxidable-304 — Rondana de Presión DIN 127 de Acero Inoxidable 304 (Marca Libre)
  - tornillo-cabeza-hexagonal-din-933-931-acero-inoxidable-304 — Tornillo Cabeza Hexagonal Din 933 / 931 de Acero Inoxidable 304 Milimétrico (Marca Libre)
  - tornillo-hexagono-interior-cabeza-boton — Tornillo de Hexágono Interior Cabeza Botón (Marca Libre)
  - tornillo-hexagono-interior-cabeza-plana-metrico-din-7991 — Tornillo de Hexágono Interior Cabeza Plana Milimétrico DIN 7991 (Marca Libre)
  - tornillo-hexagono-interior-guia — Tornillo de Hexágono Interior Guia (Marca Libre)
  - tornillo-hexagono-interior-cabeza-cilindrica — Tornillo de Hexágono Interior Cabeza Cilíndrica (Marca Libre)
  - tornillo-cabeza-hexagonal-grado-8-negro-fino — Tornillo Cabeza Hexagonal Grado 8 Negro Fino (Marca Libre)
  - tornillo-cabeza-plana-ranurado-din-963-acero-inoxidable-304-metrico — Tornillo Cabeza Plana Ranurado DIN 963 de Acero Inoxidable 304 Milimétrico (Marca Libre)
  - tornillo-hex-int-cab-bot-acer-inox-304-metrico — Tornillo de Hexágono Interior Cabeza Boton de Acero Inoxidable 304 Milimétrico (Marca Libre)
  - tornillo-hex-int-cab-cil-din-912-acer-inox-304-mm — Tornillo de Hexágono Interior Cabeza Cilindro DIN 912 de Acero Inoxidable 304 Milimétrico (Marca Libre)
  - tornillo-hex-int-cab-plana-din-7991-acer-inox-304-mm — Tornillo de Hexágono Interior Cabeza Plana DIN 7991 de Acero Inoxidable 304 Milimétrico (Marca Libre)
  - tornillo-ojo-forjado-weston — Tornillo Ojo Forjado (Weston)
    - C-00600
    - C-00605
    - C-00610
  - tuerca-hexagonal-inserto-nylon-acero-inoxidable-304-std — Tuerca Hexagonal Inserto de Nylon Acero Inoxidable 304 STD (Marca Libre)
  - tuerca-bellota-acer-inox-304 — Tuerca Bellota de Acero Inoxidable 304 (Marca Libre)
  - tuerca-cople-galvanizada — Tuerca Cople Galvanizada (Marca Libre)
  - tuerca-hexagonal-din-934-acer-inox-304 — Tuerca Hexagonal DIN 934 de Acero Inoxidable 304 (Marca Libre)
  - tuerca-hexagonal-grado-8-nc-pav — Tuerca Hexagonal Grado 8 NC Pavonada (Marca Libre)
  - tuerca-hexagonal-inserto-nylon-fina-acero-inoxidable-304 — Tuerca Hexagonal Inserto de Nylon Fina Acero Inoxidable 304 (Marca Libre)
  - tuerca-hexagonal-inserto-nylon-inoxidable-304-milimetrica — Tuerca Hexagonal Inserto de Nylon Inoxidable 304 Milimétrica (Marca Libre)
  - tuerca-hexagonal-nc-nf-acer-inox-304 — Tuerca Hexagonal NC y NF de Acero Inoxidable 304 (Marca Libre)
  - varilla-rosc-cl-4.8-neg-1mt-mm — Varilla Roscada Clase 4.8 Negra de 1 Metro de Largo Milimétrica (Marca Libre)
  - varilla-rosc-din-975-acer-inox-304-1mt — Varilla Roscada DIN 975 de Acero Inoxidable 304 de 1 Metro de Largo (Marca Libre)
- **Perforación y accesorios para taladro** (27)
  - broca-aav-135-split-point — Broca AAV 135° Split Point (Bondhus)
    - M111-11201
    - M111-11202
    - M111-11203
  - broca-aav-135-split-point-thunderbit — Broca AAV 135° Split Point Thunderbit (Bondhus)
    - M211-12504
    - M211-12505
    - M211-12506
  - broca-carburo-solido-weston — Broca de carburo sólido (Weston)
    - ST-1-160-040
    - ST-1-160-045
    - ST-1-160-050
  - broca-para-concreto-diager — Broca para Concreto Diager (Bondhus)
    - D282-03076
    - D282-04076
    - D282-05102
  - broca-concreto-sds-weston — Broca Concreto SDS (Weston)
    - ST-5-151-100
    - ST-5-151-150
    - ST-5-151-200
  - broca-concreto-weston — Broca Concreto (Weston)
    - ST-5-150-10000
    - ST-5-150-10002
    - ST-5-150-10004
  - broca-centro-acero-av-weston — Broca de Centro de Acero A.V. (Weston)
    - ST-8-600-010
    - ST-8-600-015
    - ST-8-600-020
  - broca-larga-acero-av-bohrcraft — Broca Larga Acero A.V. (Bohrcraft)
    - BC-1350-100
    - BC-1350-150
    - BC-1350-200
  - broca-wp-concreto-weston — Broca WP Concreto (Weston)
    - ST-5-148-020
    - ST-5-148-030
    - ST-5-148-050
  - broca-wp-zanco-sds-plus-weston — Broca WP Zanco SDS Plus (Weston)
    - ST-5-148-350
    - ST-5-148-370
    - ST-5-148-410
  - broca-extra-larga-acero-av-bohrcraft — Broca Extra Larga Acero A.V. (Bohrcraft)
    - BC-1400-10200
    - BC-1400-10250
    - BC-1400-10300
  - broca-zco-recto-cobalto-bohrcraft — Broca Zco. Recto de Cobalto (Bohrcraft)
    - BC-1141-100
    - BC-1141-150
    - BC-1141-200
  - broca-zanco-recto-acero-av-weston-abc — Broca Zanco Recto de Acero A.V. (Weston)
    - ST-5-180-005
    - ST-5-180-010
    - ST-5-180-015
  - broca-zco-recto-cobalto-weston-inches — Broca Zco. Recto de Cobalto (Weston)
    - ST-5-162-010
    - ST-5-162-025
    - ST-5-162-035
  - broca-zco-recto-acero-av-weston — Broca Zco. Recto de Acero A.V. (Weston)
    - ST-5-163-010
    - ST-5-163-017
    - ST-5-163-022
  - jgo-brocas-av-numericas-60-pzas-weston — Juego de Brocas A.V. Númericas 60 de piezas (Weston)
    - ST-5-170-525
  - insertos-elicoil-std-juego-6-escareadores-tornillo-allen-acero-av-bohrcraft — Insertos Elicoil STD - Juego de 6 Escareadores para Tornillo Allen Acero A.V., Bohrcraft (Bohrcraft)
  - juego-brocas-cobalto-metricas-25-pzas — Juego de brocas de Cobalto Métricas (25 pzas) (Weston)
    - ST-5-159-009
  - juego-brocas-cobalto-fraccionales-weston — Juego de Brocas de Cobalto Fraccionales (Weston)
    - ST-5-159-006
  - broca-larga-tl-weston — Broca Larga TL (Weston)
    - NB-5-164-015
    - NB-5-164-035
    - NB-5-164-050
  - broca-av-zanco-weston-inches — Broca A.V. Zanco. 1/2" (Weston)
    - ST-5-166-010
    - ST-5-166-015
    - ST-5-166-020
  - broca-av-zanco-weston-metric — Broca A.V. Zanco. 1/2" Milimétrico (Weston)
    - ST-5-166-260
    - ST-5-166-265
    - ST-5-166-270
  - broca-zanco-1-2-cobalto-weston — Broca Zanco 1/2" de Cobalto (Weston)
    - ST-5-167-320
    - ST-5-167-360
    - ST-5-167-440
  - broca-larga-tl-inches-weston — Broca Larga TL (Weston)
    - ST-5-164-005
    - ST-5-164-010
    - ST-5-164-055
  - broquero-con-llave-y-montaje-weston — Broqueros (Weston)
    - SA-010-0100
    - SA-010-0120
    - SA-010-0130
  - broquero-ajustable-weston — Broquero ajustable (Weston)
    - SA-010-0340
    - SA-010-0360
    - SA-010-0370
  - broquero-jacobs-con-llave-weston — Broquero Jacobs con llave (Weston)
    - SA-012-0060
    - SA-012-0080
    - SA-012-0200
- **Roscado y herramientas para roscas** (5)
  - dado-tarraja-ajustable-bohrcraft — Dado Tarraja Ajustable (Bohrcraft)
  - dado-tarraja-bsp-aav-bohrcraft — Dado Tarraja BSP A.V. (Bohrcraft)
  - dado-tarraja-izquierdo-aav-bohrcraft — Dado Tarraja Izquierdo A.V. (Bohrcraft)
  - kit-reparador-roscas-fracc-volkel — Kit Reparador de Roscas Fraccional (Volkel)
    - TEV-04101
    - TEV-04103
    - TEV-04104
  - kit-reparador-roscas-taller-volkel — Kit Reparador de Roscas para Taller (Volkel)
    - TEV-04085

Count: 212 products mapped and injected via `npm run images:products` (130 other categories + 81 tornilleria + 1 sellado-taponado) + 120 products above still with no image = 332 total products across `../products-tehesa/data`.

## 4. Steps

Order: ship what is mapped now (steps 1–7), then come back for "Still without image" and `tornilleria` (step 8). Not executed yet — plan only.

1. `data/product-images.json` is generated from section 2 (`{ customId: url }`); regenerate when the map changes.
2. Add `imageUrl` to the product schema; `npm run build`.
3. Write `scripts/set-product-images.js`, add `images:products` to `package.json`, run it, check updated vs. missing counts.
4. Update `AGENTS.md` / `REPO_CONTEXT.md` / `CLAUDE.md` script list and field table.
5. `npm run transfer:prod`.
6. Frontend: category placeholder for products without `imageUrl`.
7. **Backfill the seed** in `/home/rafael/projects/tehesa/products-tehesa`: write each product's URL as `imageUrl` into its entry in `data/<category>/products.<name>.json` (keyed by `customId`, one-off script in that repo), so the mapping survives if this repo or `data/product-images.json` is lost and a full reseed carries images. Then make `scripts/seed.js` here pass `imageUrl` through on create. After that, the seed is the source of truth and `data/product-images.json` can be dropped.
8. Second pass: resolve section 3 (tornilleria, "not found", "missing internal id", "mala calidad") and the 86 "Still without image" products; repeat steps 1, 3, 5 and 7 for the new URLs.

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

| brand            | authorization | date | contact / file |
| ---------------- | ------------- | ---- | -------------- |
| weston           | pending       |      |                |
| volkel           | pending       |      |                |
| bohrcraft        | pending       |      |                |
| bondhus          | pending       |      |                |
| cleveland        | pending       |      |                |
| precision        | pending       |      |                |
| king-tony        | pending       |      |                |
| henkel (loctite) | pending       |      |                |
| wd-40            | pending       |      |                |
| diager           | pending       |      |                |

### Cleanup before launch

- Remove any image whose origin you can't name (unknown reseller, Google Images).
- Show `imagen ilustrativa` on products mapped with `~` / `?` in section 2.
- Don't hotlink from brand sites — keep serving from Tehesa's Cloudinary (already the case).

## Appendix B. Superseded: product-type image mapping (informational)

First approach (2026-09-19): 196 generic images named by product _type_ (`broca-cobalto`, `tuerca-nylon`, …) were mapped by hand onto the 332 products, one image serving many products. It was dropped on 2026-09-20 in favor of one brand image per `customId` (section 2). Kept as-is for reference — the internalId lists per product are still useful when asking brands for photos.

### B.1 Image → product map (old)

Confidence: ✓ exact match, ~ same product type (shared image), ? guess — verify before shipping. `✓ confirmed` = reviewed by Tehesa. `not registered` = image exists but the product is not in the catalog.

#### carburo

| image   | customId                         | internalIds (first 3)                     | conf        |
| ------- | -------------------------------- | ----------------------------------------- | ----------- |
| lima-sc | lima-rotativa-weston             | ST-2-200-003, ST-2-200-005, ST-2-200-007… | ✓ confirmed |
| lima-sd | lima-rotativa-doble-corte-weston | ST-1-199-003, ST-1-199-004, ST-1-199-025… | ✓ confirmed |

#### extraccion-reparacion-fijaciones

| image                       | customId                                                   | internalIds (first 3)                         | conf |
| --------------------------- | ---------------------------------------------------------- | --------------------------------------------- | ---- |
| insertos-helicoil           | insertos-elicoil-std-volkel, insertos-elicoil-milim-weston | TEV-08302, TEV-08304, TEV-08205… / SB-200-020 | ✓    |
| insertos-roscado-con-ranura | inserto-roscado-bohrcraft                                  | BC-4601-300, BC-4601-400, BC-4601-500…        | ✓    |

#### herramientas-corte-conformado

| image                                                                                                                                                  | customId                                                                                                                   | internalIds (first 3)                                                                                                                | conf           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| avellanador-3-filos                                                                                                                                    | avellanador-weston                                                                                                         | ST-5-660-6015, ST-5-660-6020, ST-5-660-6035…                                                                                         | ✓              |
| avellanador-3-filos                                                                                                                                    | avellanador-juego-6f-weston                                                                                                | ST-5-660-6088, ST-5-660-8288, ST-5-660-9088                                                                                          | ✓ confirmed    |
| rima-recta-maquina                                                                                                                                     | rima-recta-maquina-h8-weston, rima-maquina-h8-weston, rima-flauta-recta-aav-h7-weston                                      | ST-8-015-005, ST-8-015-010, ST-8-015-015… / ST-8-019-040, ST-8-019-055, ST-8-019-065… / ST-8-015-403, ST-8-015-406, ST-8-015-409…    | ✓ confirmed    |
| laina-metrica-inoxidable                                                                                                                               | laina-acero-inoxidable-150mm-1-25m-precision, laina-acero-inoxidable-6pul-50pul-precision                                  | PB-22971, PB-22972, PB-22973… / PB-22125, PB-22L2, PB-22195…                                                                         | ✓ confirmed    |
| laina-fraccional-metrica                                                                                                                               | laina-acero-6pul-100pul-precision, laina-acero-150mm-2-5m-precision                                                        | PB-16130, PB-16195, PB-16245… / PB-16971, PB-16972, PB-16973…                                                                        | ✓ confirmed    |
| laina-azul-templado                                                                                                                                    | laina-acero-azul-templado-precision, laina-acero-azul-templado-5pul-precision                                              | PB-07000, PB-09000, PB-10000 / PB-23130                                                                                              | ✓              |
| escariador-caja                                                                                                                                        | escareador-tornillo-allen-acero-av-bohrcraft                                                                               | BC-1707-300, BC-1707-400, BC-1707-500…                                                                                               | ✓ confirmed    |
| cortador-vertical-tin                                                                                                                                  | cortador-vertical-4f-titanio-weston, cortador-vertical-carburo-ctian-weston, cortador-vertical-radial-carburo-altin-weston | ST-3-306-005, ST-3-306-015, ST-3-306-025… / ST-2-306-5015, ST-2-306-5025, ST-2-306-5035… / ST-1-222-004, ST-1-222-005, ST-1-222-006… | ✓ confirmed    |
| buril-redondo                                                                                                                                          | buriles-redondo-av-weston                                                                                                  | ST-5-091-002, ST-5-091-008, ST-5-091-013…                                                                                            | ✓              |
| buril-momax-cobalto                                                                                                                                    | buriles-cuadrados-cobalto-cleveland                                                                                        | CC44540, CC44544, CC44545…                                                                                                           | ✓ confirmed    |
| buril-cobalto-8-porciento                                                                                                                              | buriles-cobalto-co8-weston                                                                                                 | ST-5-095-007, ST-5-095-012, ST-5-095-017…                                                                                            | ✓              |
| buril-calzado-punta-60, buril-calzado-punta-80, buril-calzado-punta-cuadrada, buril-corte-izquierdo, buril-corte-derecho, sierra-cinta, rima-ajustable | —                                                                                                                          | —                                                                                                                                    | not registered |

#### llaves-herramientas-torque (category `llaves-herramientas-apriete`)

| image                                                                                                                                                     | customId                                                                            | internalIds (first 3)                                                     | conf                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| llave-torx-larga                                                                                                                                          | llave-tipo-torx-larga-bondhus                                                       | B421-32806, B421-32807, B421-32808…                                       | ✓                                            |
| llave-torx                                                                                                                                                | llave-tipo-torx-corta-bondhus                                                       | B411-32705, B411-32706, B411-32707…                                       | ✓                                            |
| llave-allen-punta-bola-metrica-fraccional                                                                                                                 | llave-hexagonal-std-punta-de-bola-bondhus, llave-hexagonal-mm-punta-de-bola-bondhus | B121-15702, B121-15703, B121-15704… / B122-15749, B122-15750, B122-15752… | ✓                                            |
| llave-allen-brazo-largo                                                                                                                                   | llave-hexagonal-mm-larga-recta-bondhus, llave-hexagonal-std-larga-recta-bondhus     | B132-15947, B132-15948, B132-15949… / B131-15900, B131-15901, B131-15902… | ✓                                            |
| llave-allen                                                                                                                                               | llave-hexagonal-mm-corta-recta-bondhus, llave-hexagonal-std-corta-bondhus           | B112-15847, B112-15848, B112-15849… / B111-15800, B111-15801, B111-15802… | ✓                                            |
| jgo-llave-torx                                                                                                                                            | juego-llaves-torx                                                                   | B412-31732, B412-31734, B422-31832…                                       | ✓ confirmed                                  |
| jgo-llave-allen-brazo-largo-metrico                                                                                                                       | juego-llaves-allen-std-mm                                                           | B123-10945, B123-10932, B123-10938…                                       | ✓ confirmed                                  |
| jgo-llave-torx-larga                                                                                                                                      | —                                                                                   | —                                                                         | not found or related                         |
| jgo-llave-punta-bola-fraccional, jgo-llave-allen-punta-bola-metrica, llave-allen-t-metrica, llave-allen-t-fraccional, llave-torx-t, goldguard, colorguard | —                                                                                   | —                                                                         | not found or related                         |
| plateado, extra-largas                                                                                                                                    | —                                                                                   | —                                                                         | pending: image needs a more descriptive name |

#### perforacion-accesorios-taladro

| image                                  | customId                                                                                                                                                                                                                                                                                          | internalIds (first 3)                                                                                                                                                                                                                                                                                                                          | conf                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| broca-fraccional-zanco-recto           | broca-zco-recto-acero-av-weston-inches, broca-zco-recto-acero-av-weston, broca-zco-recto-acero-av-weston-number, broca-zanco-recto-acero-av-weston-abc, broca-zco-recto-acero-av-mims-weston, broca-zco-recto-acero-av-bohrcraft, broca-aav-135-split-point, broca-aav-135-split-point-thunderbit | ST-5-160-005, ST-5-160-010, ST-5-160-015… / ST-5-163-010, ST-5-163-017, ST-5-163-022… / ST-5-170-005, ST-5-170-010, ST-5-170-015… / ST-5-180-005, ST-5-180-010, ST-5-180-015… / ST-5-154-020, ST-5-154-025, ST-5-154-030… / BC-1100-100, BC-1100-130, BC-1100-150… / M111-11201, M111-11202, M111-11203… / M211-12504, M211-12505, M211-12506… | ✓ confirmed          |
| broca-concreto-sds                     | broca-concreto-sds-weston, broca-wp-zanco-sds-plus-weston                                                                                                                                                                                                                                         | ST-5-151-100, ST-5-151-150, ST-5-151-200… / ST-5-148-350, ST-5-148-370, ST-5-148-410                                                                                                                                                                                                                                                           | ✓                    |
| broca-concreto                         | broca-concreto-weston, broca-para-concreto-diager                                                                                                                                                                                                                                                 | ST-5-150-10000, ST-5-150-10002, ST-5-150-10004… / D282-03076, D282-04076, D282-05102…                                                                                                                                                                                                                                                          | ✓ confirmed          |
| broca-concreto-booster                 | broca-wp-concreto-weston                                                                                                                                                                                                                                                                          | ST-5-148-020, ST-5-148-030, ST-5-148-050…                                                                                                                                                                                                                                                                                                      | ✓ confirmed          |
| broca-cobalto                          | broca-zco-recto-cobalto-bohrcraft, broca-zco-recto-cobalto-weston-inches, broca-zco-recto-cobalto-weston-m-measure                                                                                                                                                                                | BC-1141-100, BC-1141-150, BC-1141-200… / ST-5-162-010, ST-5-162-025, ST-5-162-035… / ST-5-162-300, ST-5-162-305, ST-5-162-310…                                                                                                                                                                                                                 | ✓                    |
| broca-centro                           | broca-centro-acero-av-weston                                                                                                                                                                                                                                                                      | ST-8-600-010, ST-8-600-015, ST-8-600-020…                                                                                                                                                                                                                                                                                                      | ✓                    |
| broca-carburo-TiAlN                    | broca-carburo-solido-m13-tialn-bohrcraft                                                                                                                                                                                                                                                          | BC-1502-300, BC-1502-350, BC-1502-400…                                                                                                                                                                                                                                                                                                         | ✓                    |
| broca-carburo-solido                   | broca-carburo-solido-weston                                                                                                                                                                                                                                                                       | ST-1-160-040, ST-1-160-045, ST-1-160-050…                                                                                                                                                                                                                                                                                                      | ✓                    |
| jgo-escariadores-metrico               | insertos-elicoil-std-juego-6-escareadores-tornillo-allen-acero-av-bohrcraft                                                                                                                                                                                                                       | —                                                                                                                                                                                                                                                                                                                                              | ✓ confirmed          |
| jgo-brocas-metrica                     | juego-brocas-av-metricas-25-pzas, juego-brocas-acero-av-25-pzas-bohrcraft                                                                                                                                                                                                                         | ST-5-159-008 / BC-1100-30019, BC-1100-30025                                                                                                                                                                                                                                                                                                    | ✓                    |
| jgo-brocas-fraccional                  | juego-brocas-acero-av-fraccionales, jgo-brocas-acer-av-std-numericas-alfabetica-115-pzas-weston, jgo-brocas-av-alfabeticas-26-pzas-weston, jgo-brocas-av-numericas-60-pzas-weston                                                                                                                 | ST-5-159-003, ST-5-159-004, ST-5-159-010 / ST-5-159-001 / ST-5-180-500 / ST-5-170-525                                                                                                                                                                                                                                                          | ✓/~                  |
| jgo-brocas-cobalto                     | juego-brocas-cobalto-metricas-25-pzas, juego-brocas-cobalto-fraccionales-weston                                                                                                                                                                                                                   | ST-5-159-009 / ST-5-159-006                                                                                                                                                                                                                                                                                                                    | ✓                    |
| broca-zanco-media-pulgada              | broca-av-zanco-weston-inches, broca-av-zanco-weston-metric, broca-zanco-1-2-cobalto-weston                                                                                                                                                                                                        | ST-5-166-010, ST-5-166-015, ST-5-166-020… / ST-5-166-260, ST-5-166-265, ST-5-166-270… / ST-5-167-320, ST-5-167-360, ST-5-167-440                                                                                                                                                                                                               | ✓                    |
| broca-zanco-conico                     | broca-zco-conico-inches-number-weston                                                                                                                                                                                                                                                             | ST-5-190-225, ST-5-190-240, ST-5-190-260…                                                                                                                                                                                                                                                                                                      | ✓                    |
| broca-vidrio                           | broca-punta-carburo-tungsteno-weston                                                                                                                                                                                                                                                              | ST-5-149-10200, ST-5-149-10210, ST-5-149-10220…                                                                                                                                                                                                                                                                                                | ?                    |
| broca-larga                            | broca-larga-acero-av-bohrcraft, broca-extra-larga-acero-av-bohrcraft, broca-larga-tl-weston, broca-larga-av-weston, broca-larga-tl-inches-weston, broca-larga-aav-wp-black-silver-weston                                                                                                          | BC-1350-100, BC-1350-150, BC-1350-200… / BC-1400-10200, BC-1400-10250, BC-1400-10300… / NB-5-164-015, NB-5-164-035, NB-5-164-050… / ST-5-165-005, ST-5-165-010 / ST-5-164-005, ST-5-164-010, ST-5-164-055… / NB-5-165-005, NB-5-165-010, NB-5-165-015…                                                                                         | ✓ confirmed          |
| jgo-broca-zanco-media, broca-multiusos | —                                                                                                                                                                                                                                                                                                 | —                                                                                                                                                                                                                                                                                                                                              | not found or related |

#### roscado-herramientas-roscas (products split across `herramientas-corte-conformado` and `roscado-herramientas-roscas`)

| image                                                                                                                                                                                   | customId                                                                                                                                                                                                                                                                                                                                                                                                                 | internalIds (first 3)                                                                                                                                                                                                                                              | conf                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| machuelo-nps-volkel                                                                                                                                                                     | machuelo-nps-aav-volkel                                                                                                                                                                                                                                                                                                                                                                                                  | 99402, 99406, 99414…                                                                                                                                                                                                                                               | ✓                                                                         |
| machuelo-npt-volkel                                                                                                                                                                     | machuelo-npt-aav-volkel                                                                                                                                                                                                                                                                                                                                                                                                  | 63510, 63512, 63514…                                                                                                                                                                                                                                               | ✓                                                                         |
| machuelo-npt-weston                                                                                                                                                                     | machuelo-npt-aav-weston, machuelo-npt-ac-weston                                                                                                                                                                                                                                                                                                                                                                          | ST-5-764-001, ST-5-764-002, ST-5-764-003… / ST-5-778-500, ST-5-778-510, ST-5-778-515…                                                                                                                                                                              | ✓                                                                         |
| machuelo-maquina-volkel                                                                                                                                                                 | machuelo-maquina-mm-aav-volkel, machuelo-maquina-fraccional-aav-volkel, machuelo-maquina-acero-inox-agujeros-pasados-mm-volkel, machuelo-maquina-acero-inox-agujeros-pasados-fracc-volkel, machuelo-maquina-acero-inox-agujeros-ciegos-mm-volkel, machuelo-maquina-acero-inox-agujeros-ciegos-fracc-volkel                                                                                                               | 38526, 38530, 38534… / 75505, 75508, 75510… / 35226, 35230, 35234… / 35945, 35946, 35947… / 36226, 36230, 36234… / 36945, 36946, 36947…                                                                                                                            | ~                                                                         |
| machuelo-helicoidal-banda-blanca                                                                                                                                                        | machuelo-maquina-helice-35-volkel                                                                                                                                                                                                                                                                                                                                                                                        | 38726, 38730, 38734…                                                                                                                                                                                                                                               | ?                                                                         |
| machuelo-l-coil-volkel                                                                                                                                                                  | machuelo-l-coil-fraccional-aav-volkel, machuelo-l-coil-aav-milimetrico-volkel, machuelo-fino-l-coil-fraccional-aav-volkel                                                                                                                                                                                                                                                                                                | TEV-03102, TEV-03104, TEV-03105… / TEV-03005, TEV-03006, TEV-03007… / TEV-03154, TEV-03155, TEV-03156…                                                                                                                                                             | ✓                                                                         |
| machuelo-bsp-volkel                                                                                                                                                                     | machuelo-bsp-aav-volkel, machelo-bsp-aav-conico-volkel, machelo-bsp-aav-recto-volkel                                                                                                                                                                                                                                                                                                                                     | 65312, 65314, 65316… / 25312-1, 25314-1, 25316-1… / 25312-2, 25314-2, 25316-2…                                                                                                                                                                                     | ✓                                                                         |
| machuelo-semiconico-volkel                                                                                                                                                              | machuelo-milimetrico-aav-semiconico-volkel, machuelo-fraccional-aav-semiconico-volkel, machuelos-izq-semiconicos-aav-volkel, machuelos-izq-fraccionales-semiconicos-aav-volkel                                                                                                                                                                                                                                           | 27322-2, 27326-2, 27330-2… / 23305-2, 23308-2, 23310-2… / 27026-2, 27030-2, 27034-2… / 23008-2, 23010-2, 23014-2…                                                                                                                                                  | ✓                                                                         |
| machuelo-semiconico-weston                                                                                                                                                              | machuelo-plug-ac-weston                                                                                                                                                                                                                                                                                                                                                                                                  | ST-5-778-009, ST-5-778-010, ST-5-778-015…                                                                                                                                                                                                                          | ✓                                                                         |
| kit-reparador-rosca                                                                                                                                                                     | kit-reparador-roscas-bohrcraft, kit-reparador-roscas-fracc-volkel, kit-reparador-roscas-milim-volkel, kit-reparador-roscas-taller-volkel, kit-reparador-roscas-milim-weston                                                                                                                                                                                                                                              | BC-4601-30300, BC-4601-30400, BC-4601-30500… / TEV-04101, TEV-04103, TEV-04104… / TEV-04005, TEV-04007, TEV-04009… / TEV-04085 / SB-100-100, SB-100-105, SB-100-110…                                                                                               | ~                                                                         |
| jgo-machuelo-weston                                                                                                                                                                     | jgo-machuelo-ac-weston, juego-machuelos-ac-3-piezas-weston                                                                                                                                                                                                                                                                                                                                                               | ST-5-780-044, ST-5-780-059, ST-5-780-067… / ST-5-779-001, ST-5-779-010, ST-5-779-013…                                                                                                                                                                              | ✓                                                                         |
| jgo-machuelo-fino-2-pasos-volkel                                                                                                                                                        | juego-machuelos-fraccionales-aav-2-piezas-volkel, juego-machuelos-milimetrico-aav-2-piezas-finos-volkel, juego-machuelos-izq-fraccionales-aav-2-piezas-volkel                                                                                                                                                                                                                                                            | 24305, 24310, 24314… / 26326, 26336, 26338… / 24010, 24014, 24016…                                                                                                                                                                                                 | ✓                                                                         |
| jgo-3-machuelo-volkel                                                                                                                                                                   | juego-machuelos-fraccionales-aav-3-piezas-volkel, juego-machuelos-izq-fraccionales-aav-3-piezas-volkel, juego-machuelos-izq-milimetricos-aav-3-piezas-volkel, juego-machuelos-aav-milimetricos-tipo-europeo-volkel                                                                                                                                                                                                       | 23305, 23308, 23310… / 23008, 23010, 23014… / 27026, 27030, 27034… / 27316, 27322, 27326…                                                                                                                                                                          | ✓                                                                         |
| jgo-2-machuelo-volkel                                                                                                                                                                   | juego-machuelos-otros-volkel                                                                                                                                                                                                                                                                                                                                                                                             | 49510, 47001, 47033…                                                                                                                                                                                                                                               | ?                                                                         |
| jgo-2-machuelo-bsp-volkel                                                                                                                                                               | juego-machuelos-bsp-aav-2-piezas-volkel, juego-machuelos-bsp-av-2-piezas-bohrcraft                                                                                                                                                                                                                                                                                                                                       | 25312, 25314, 25316… / —                                                                                                                                                                                                                                           | ✓/~                                                                       |
| extractor-tornillos                                                                                                                                                                     | extractor-tornillos-diager-saravia                                                                                                                                                                                                                                                                                                                                                                                       | D634-00010, D634-00020, D634-00030…                                                                                                                                                                                                                                | ✓                                                                         |
| dado-tarraja-volkel                                                                                                                                                                     | dado-tarraja-ajustable-fracc-aav-fino-volkel, dado-tarraja-ajustable-fracc-aav-volkel, dado-tarraja-ajustable-milim-aav-fino-volkel, dado-tarraja-ajustable-milim-aav-volkel, dado-tarraja-izquierdo-aav-volkel, dado-tarraja-izquierdo-milim-aav-volkel, dado-tarraja-mm-aav-volkel, dado-tarraja-ajustable-bohrcraft, dado-tarraja-izquierdo-aav-bohrcraft                                                             | 24403, 24410, 24414… / 23405, 23408, 22408… / 26426, 26436, 26438… / 27926, 27930, 27934… / 22206, 23210, 23214… / 27226, 27230, 27234… / 27416, 27422, 27440… / — / —                                                                                             | ~                                                                         |
| dado-npt-volkel                                                                                                                                                                         | dado-tarraja-npt-aav-volkel                                                                                                                                                                                                                                                                                                                                                                                              | 23612, 23614, 23616…                                                                                                                                                                                                                                               | ✓                                                                         |
| dado-bsp-volkel                                                                                                                                                                         | dado-tarraja-bsp-aav-volkel, dado-tarraja-bsp-aav-bohrcraft                                                                                                                                                                                                                                                                                                                                                              | 25412, 25414, 25416… / —                                                                                                                                                                                                                                           | ✓/~                                                                       |
| punzo-rompe-arrastre-volkel-1                                                                                                                                                           | punzon-rompe-arrastre-volkel                                                                                                                                                                                                                                                                                                                                                                                             | TEV-07006, TEV-07008, TEV-07009…                                                                                                                                                                                                                                   | ✓ (-7 unused)                                                             |
| maneral-tipo-garrote-volkel                                                                                                                                                             | manerales-para-machuelos-volkel                                                                                                                                                                                                                                                                                                                                                                                          | 10001, 10002, 10010…                                                                                                                                                                                                                                               | ~ (also maneral-machuelo-T-volkel; one product, pick one)                 |
| maneral-extractor-volkel                                                                                                                                                                | maneral-extractor-volkel                                                                                                                                                                                                                                                                                                                                                                                                 | TEV-07052, TEV-07053                                                                                                                                                                                                                                               | ✓                                                                         |
| maneral-dado-tarraja-volkel                                                                                                                                                             | maneral-para-insertar-volkel                                                                                                                                                                                                                                                                                                                                                                                             | TEV-08004, TEV-08006, TEV-08008…                                                                                                                                                                                                                                   | ? (check variants; "insertar" may be the helicoil tool, not a die holder) |
| machuelo-maquina-volkel (fallback)                                                                                                                                                      | machelo-conico-milimetricos-av-tipo-europeo-volkel, machelo-conico-milimetricos-av-fino-volkel, machelo-recto-milimetricos-av-tipo-europeo-volkel, machelo-recto-milimetricos-aav-fino-volkel, machuelo-fraccional-aav-conico-volkel, machuelo-fraccional-aav-conico-fino-volkel, machuelo-fraccional-aav-recto-volkel, machuelo-fraccional-aav-recto-fino-volkel, machuelos-izq-\* (7), machuelo-izq-conicos-aav-volkel | 27316-1, 27322-1, 27326-1… / 26326-1, 26336-1, 26338-1… / 27316-3, 27322-3, 27326-3… / 26326-2, 26336-2, 26338-2… / 23305-1, 23308-1, 23310-1… / 24305-1, 24310-1, 24314-1… / 23305-3, 23308-3, 23310-3… / 24305-3, 24310-3, 24314-3… / 27026-1, 27030-1, 27034-1… | ? (no cónico/recto image exists; decide fallback or leave empty)          |
| jgo-extractor-tornillos, maneral-tipo-garrote, maneral-tipo-garrote-surtek, maneral-machuelo-t-weston, maneral-dado-tarraja, maneral-dado-tarraja-weston, punzo-rompe-arrastre-volkel-7 | —                                                                                                                                                                                                                                                                                                                                                                                                                        | —                                                                                                                                                                                                                                                                  | no product                                                                |

#### sujecion

| image                                                                                                         | customId                                          | internalIds (first 3)         | conf       |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------- | ---------- |
| nudo-galvanizado                                                                                              | nudo-para-cable-maleable-weston                   | WT-00100, WT-00120, WT-00140… | ✓          |
| remache-ancha-inox                                                                                            | remache-pop-ancha-acero-inoxidable-304            | —                             | ✓          |
| remache-corta-inox                                                                                            | remache-pop-corta-acero-inoxidable-304            | —                             | ✓          |
| clamp-accion-vertical                                                                                         | clamp-accion-vertical-manija-recta-barra-u-weston | CH-101-A, CH-10247, CH-12050… | ✓          |
| clamp-accion-horizontal                                                                                       | clamp-accion-horizontal-barra-u-weston            | CH-201, CH-201-B, CH-20235…   | ✓          |
| clamp-accion-lineal                                                                                           | clamp-accion-lineal-weston                        | CH-301-A, CH-304-C, CH-304-E… | ✓          |
| clamp-accion-jalar                                                                                            | clamp-accion-jalar-weston                         | CH-40323, CH-40334, CH-40341… | ✓          |
| abrazadera-sin-fin                                                                                            | abrazadera-weston                                 | ZH-00309, ZH-00310, ZH-00315… | ✓          |
| argolla-carga                                                                                                 | tornillo-ojo-forjado-weston                       | C-00600, C-00605, C-00610…    | ?          |
| taquete-z, taquete-tx, taquete-plastico, taquete-arpon, sujetador-mariposa, armellas, abrazadera-alta-presion | —                                                 | —                             | no product |

#### suministros-maquinado

| image           | customId                | internalIds (first 3) | conf |
| --------------- | ----------------------- | --------------------- | ---- |
| rayador-carburo | rayador-carburo-saravia | D600-94338            | ✓    |

#### tornilleria

| image                                                                                                                                                                                                                                                                               | customId                                                                                                                                                                             | internalIds (first 3) | conf                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------- |
| taquete-arpon-inox                                                                                                                                                                                                                                                                  | taquete-arpon-acero-inoxidable-304                                                                                                                                                   | —                     | ✓                               |
| varilla-inoxidable                                                                                                                                                                                                                                                                  | varilla-rosc-acer-inox-304-3ft, varilla-rosc-din-975-acer-inox-304-1mt                                                                                                               | — / —                 | ✓                               |
| accesorio-neopreno                                                                                                                                                                                                                                                                  | accesorios-epdm-pija-punta-de-broca, accesorios-epdm-calidad-plus-pija-punta-de-broca                                                                                                | — / —                 | ✓                               |
| opresor-allen-inox                                                                                                                                                                                                                                                                  | opresor-hexagono-interior-punta-copa-acero-inoxidable-304, opresor-hexagono-interior-punta-copa-din-916-acero-inoxidable                                                             | — / —                 | ✓                               |
| opresores/opresor-allen                                                                                                                                                                                                                                                             | opresor-hexagono-interior-punta-copa-std, opresor-punta-copa-mm-din-916-std                                                                                                          | — / —                 | ✓                               |
| pernos/perno-solido                                                                                                                                                                                                                                                                 | perno-solido-rectificado-mm, perno-solido-rectificado-inches                                                                                                                         | — / —                 | ✓                               |
| pija-multiusos-negra                                                                                                                                                                                                                                                                | pija-multiusos-phillips-negra                                                                                                                                                        | —                     | ✓                               |
| pija-lamina                                                                                                                                                                                                                                                                         | pija-cabeza-plana-phillips-lamina-galvanizada, pija-cabeza-hexagonal-para-lamina                                                                                                     | — / —                 | ~                               |
| pija-k-lath-punta-broca                                                                                                                                                                                                                                                             | pija-k-lath-punta-broca-galvanizado-galaxy                                                                                                                                           | —                     | ✓                               |
| pija-k-lath-ab-galv                                                                                                                                                                                                                                                                 | pija-k-lath-punta-aguda-galvanizada                                                                                                                                                  | —                     | ✓                               |
| pija-hexagonal-punta-broca                                                                                                                                                                                                                                                          | pija-galvanizada-galaxy-cabeza-hexagonal-punta-broca, pija-galvanizada-cabeza-hexagonal-punta-broca-calidad                                                                          | — / —                 | ✓                               |
| pija-cabeza-hexagonal-punta-broca                                                                                                                                                                                                                                                   | pija-410-punta-broca-cabeza-hexagonal-acero-inoxidable                                                                                                                               | —                     | ?                               |
| pija-hexagonal-madera                                                                                                                                                                                                                                                               | pija-galvanizada-cabeza-hexagonal-madera                                                                                                                                             | —                     | ✓                               |
| pija-hexagonal-acc                                                                                                                                                                                                                                                                  | juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-calidad-plus, juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-galaxy                                                 | — / —                 | ✓                               |
| pija-fijadora                                                                                                                                                                                                                                                                       | pija-galvanizada-punta-fijadora-combinada, pija-cabeza-fijadora-combi-latonada                                                                                                       | — / —                 | ✓                               |
| pija-cabeza-plana-inox                                                                                                                                                                                                                                                              | pija-304-cabeza-plana-phillips-acero-inoxidable                                                                                                                                      | —                     | ✓                               |
| pija-cabeza-fijadora-inox                                                                                                                                                                                                                                                           | pija-304-cabeza-fijadora-phillips-acero-inoxidable                                                                                                                                   | —                     | ✓                               |
| rondana-presion-negra                                                                                                                                                                                                                                                               | rondana-de-presion-negra, rondana-de-presion-metrica-negra-din-127                                                                                                                   | — / —                 | ✓                               |
| rondana-presion-inox                                                                                                                                                                                                                                                                | rondana-de-presion-acero-inoxidable-304-std, rondana-de-presion-din-127-acero-inoxidable-304                                                                                         | — / —                 | ✓                               |
| rondana-presion-galvanizada                                                                                                                                                                                                                                                         | rondana-de-presion-galvanizada                                                                                                                                                       | —                     | ✓                               |
| rondana-plana-inox                                                                                                                                                                                                                                                                  | rondana-plana-acero-inoxidable-304, rondana-plana-din-125-acero-inoxidable-304                                                                                                       | — / —                 | ✓                               |
| rondana-f-36                                                                                                                                                                                                                                                                        | rondana-f-436-negra                                                                                                                                                                  | —                     | ✓                               |
| tornillo-cabeza-plana-ranurado-inox                                                                                                                                                                                                                                                 | tornillo-cabeza-plana-ranurado-din-963-acero-inoxidable-304-metrico                                                                                                                  | —                     | ✓                               |
| tornillo-cabeza-plana-phillips-inox                                                                                                                                                                                                                                                 | tornillo-cabeza-plana-ranurado-phillips-acero-inoxidable-304                                                                                                                         | —                     | ✓                               |
| tornillo-cabeza-plana-phillips-galvanizado                                                                                                                                                                                                                                          | tornillo-cabeza-plana-phillips-galvanizado, tornillo-cabeza-plana-phillips-metrico-din-965                                                                                           | — / —                 | ✓                               |
| tornillo-cabeza-gota-inox                                                                                                                                                                                                                                                           | tornillo-cabeza-gota-ranurado-combinado-acero-inoxidable-304                                                                                                                         | —                     | ✓                               |
| tornillo-cabeza-gota-combinado-galvanizado                                                                                                                                                                                                                                          | tornillo-cabeza-gota-combinado-galvanizado                                                                                                                                           | —                     | ✓                               |
| tornillo-cabeza-coche-galvanizado                                                                                                                                                                                                                                                   | tornillo-cabeza-coche-grado-2-galvanizado                                                                                                                                            | —                     | ✓                               |
| tornillo-coche-inox                                                                                                                                                                                                                                                                 | tornillo-cabeza-coche-acero-inoxidable-304                                                                                                                                           | —                     | ✓                               |
| tornillo-allen-milimetrico                                                                                                                                                                                                                                                          | tornillo-hexagono-interior-cabeza-baja-metrico                                                                                                                                       | —                     | ~                               |
| tornillo-allen-guia                                                                                                                                                                                                                                                                 | tornillo-hexagono-interior-guia-std, tornillo-hexagono-interior-guia                                                                                                                 | — / —                 | ✓                               |
| tornillo-allen-cilindrico                                                                                                                                                                                                                                                           | tornillo-hexagono-interior-cabeza-cilindrica, tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912, tornillo-hexagono-interior-cabeza-baja-cilindrica                        | — / — / —             | ✓                               |
| tornillo-alen-cilindrico-inox                                                                                                                                                                                                                                                       | tornillo-hex-int-cab-cil-din-912-acer-inox-304-mm, tornillo-hex-int-cab-cil-acer-inox-304                                                                                            | — / —                 | ✓                               |
| tornillo-allen-cabeza-plana                                                                                                                                                                                                                                                         | tornillo-hexagono-interior-cabeza-plana-metrico-din-7991, tornillo-hexagono-interior-cabeza-plana-std                                                                                | — / —                 | ✓                               |
| tornillo-allen-cabeza-plana-inox                                                                                                                                                                                                                                                    | tornillo-hex-int-cab-plana-acer-inox-304, tornillo-hex-int-cab-plana-din-7991-acer-inox-304-mm                                                                                       | — / —                 | ✓                               |
| tornillo-allen-cabeza-boton                                                                                                                                                                                                                                                         | tornillo-hexagono-interior-cabeza-boton-std, tornillo-hexagono-interior-cabeza-boton                                                                                                 | — / —                 | ✓                               |
| tornillo-allen-boton-inox                                                                                                                                                                                                                                                           | tornillo-hex-int-cab-bot-acer-inox-304-metrico, tornillo-hex-int-cab-bot-acer-inox-304                                                                                               | — / —                 | ✓                               |
| tapon-dry                                                                                                                                                                                                                                                                           | tapon-dry-seal                                                                                                                                                                       | —                     | ✓ (category `sellado-taponado`) |
| tornillo-hexagonal-milimetrico                                                                                                                                                                                                                                                      | tornillo-cabeza-hexagonal-cl-8-8-din-933-931, tornillo-cabeza-hexagonal-cl-8-8-fino-din-960-96                                                                                       | — / —                 | ✓                               |
| tornillo-hexagonal-inox                                                                                                                                                                                                                                                             | tornillo-cabeza-hexagonal-din-933-931-acero-inoxidable-304, tornillo-cabeza-hexagonal-cuerda-corrida-acero-inoxidable-304                                                            | — / —                 | ✓                               |
| tornillo-hexagonal-grado-5                                                                                                                                                                                                                                                          | tornillo-cabeza-hexagonal-grado-5-negro-fino, tornillo-cabeza-hexagonal-grado-5-negro-unc, tornillo-cabeza-hexagonal-grado-8-negro-fino, tornillo-cabeza-hexagonal-grado-8-negro-std | — / — / — / —         | ✓/~ (grade 8 shares it)         |
| tornillo-hexagonal-galvanizado                                                                                                                                                                                                                                                      | tornillo-maquina-cabeza-hexagonal-grado-2-cda-corrida-galvanizado                                                                                                                    | —                     | ✓                               |
| tornillo-fijador-inox                                                                                                                                                                                                                                                               | tornillo-cabeza-fijadora-ranurado-din-85-acero-inoxidable-304-metrico                                                                                                                | —                     | ✓                               |
| tornillo-cabeza-queso-inoxidable                                                                                                                                                                                                                                                    | tornillo-cabeza-queso-din-84-acero-inoxidable-304-metrico                                                                                                                            | —                     | ✓                               |
| tornillo-cabeza-queso                                                                                                                                                                                                                                                               | tornillo-cabeza-queso-ranurado-din-84-metrico                                                                                                                                        | —                     | ✓                               |
| tuerca-tino                                                                                                                                                                                                                                                                         | tuerca-tino-4-puntas-galv-nc-nf                                                                                                                                                      | —                     | ✓                               |
| tuerca-nylon                                                                                                                                                                                                                                                                        | tuerca-inserto-nylon-galvanizada-nf, tuerca-inserto-nylon-galv-nc, tuerca-inserto-nylon-din-985-galv                                                                                 | — / — / —             | ✓                               |
| tuerca-inserto-inox                                                                                                                                                                                                                                                                 | tuerca-hexagonal-inserto-nylon-acero-inoxidable-304-std, tuerca-hexagonal-inserto-nylon-fina-acero-inoxidable-304, tuerca-hexagonal-inserto-nylon-inoxidable-304-milimetrica         | — / — / —             | ✓                               |
| tuerca-metrica                                                                                                                                                                                                                                                                      | tuerca-hexagonal-metrica-din-934-negra                                                                                                                                               | —                     | ✓                               |
| tuerca-mariposa                                                                                                                                                                                                                                                                     | tuerca-mariposa-forjada-galvanizada                                                                                                                                                  | —                     | ✓                               |
| tuerca-mariposa-inox                                                                                                                                                                                                                                                                | tuerca-mariposa-acer-inox-304                                                                                                                                                        | —                     | ✓                               |
| tuerca-hexagonal-inox                                                                                                                                                                                                                                                               | tuerca-hexagonal-din-934-acer-inox-304, tuerca-hexagonal-nc-nf-acer-inox-304                                                                                                         | — / —                 | ✓                               |
| tuerca-hexagonal-grado-5                                                                                                                                                                                                                                                            | tuerca-hexagonal-grado-5-nc-pav, tuerca-hexagonal-grado-5-nf-pav, tuerca-hexagonal-grado-8-nc-pav                                                                                    | — / — / —             | ✓/~                             |
| tuerca-hexagonal-grado-2-negra                                                                                                                                                                                                                                                      | tuerca-hexagonal-liviana-grado-2-nc-negra                                                                                                                                            | —                     | ✓                               |
| tuerca-galvanizada                                                                                                                                                                                                                                                                  | tuerca-hexagonal-liviana-grado-2-nc-galv                                                                                                                                             | —                     | ✓                               |
| tuerca-gripco                                                                                                                                                                                                                                                                       | tuerca-gripco-grado-c-galv-nc-nf                                                                                                                                                     | —                     | ✓                               |
| tuerca-flange                                                                                                                                                                                                                                                                       | tuerca-flange-aserra-galv-metr, tuerca-flange-aserra-galv-estandar                                                                                                                   | — / —                 | ✓                               |
| tuerca-cople                                                                                                                                                                                                                                                                        | tuerca-cople-galvanizada                                                                                                                                                             | —                     | ✓                               |
| tuerca-bellota                                                                                                                                                                                                                                                                      | tuerca-bellota-niquelada-nc-nf                                                                                                                                                       | —                     | ✓                               |
| tuerca-bellota-inox                                                                                                                                                                                                                                                                 | tuerca-bellota-acer-inox-304                                                                                                                                                         | —                     | ✓                               |
| tuerca-2h                                                                                                                                                                                                                                                                           | tuerca-2h-negra                                                                                                                                                                      | —                     | ✓                               |
| tuerca-acme-1                                                                                                                                                                                                                                                                       | tuerca-hexagonal-rosca-acme-grado-2-negra-forjada                                                                                                                                    | —                     | ~                               |
| tuerca-acme-2                                                                                                                                                                                                                                                                       | tuerca-hexagonal-rosca-acme-gdo-2-negr-maquinada                                                                                                                                     | —                     | ~                               |
| varilla-acme                                                                                                                                                                                                                                                                        | varilla-acme-1mt                                                                                                                                                                     | —                     | ✓                               |
| varilla-87                                                                                                                                                                                                                                                                          | varilla-negra-b7-1mt                                                                                                                                                                 | —                     | ✓ (B7)                          |
| varilla-grado-5                                                                                                                                                                                                                                                                     | varilla-grad-5-1mt-neg                                                                                                                                                               | —                     | ✓                               |
| varilla-galvanizada-1m-3m                                                                                                                                                                                                                                                           | varilla-grad-2-galv-1mt, varilla-grad-2-galv-3mt                                                                                                                                     | — / —                 | ✓                               |
| opresor-ranurado-pivote, opresor-ranurado-balin, opresor-allen-resorte, opresor-allen-pivote, opresor-allen-balin, perno-roscado, pija-hexagonal-punta-aguda, pija-durock, accesorio-pija-inox, rondana-seguridad, rondana-plana-metrica, rondana-plana-galvanizada, tuerca-resorte | —                                                                                                                                                                                    | —                     | no product                      |

### B.2 Products with no image under the old map

Format: `customId | internalId(s) of its variants | brand`.

#### adhesivos-selladores (whole category)

- loctite-243-fijador-de-roscas-resistencia-removible-50-ml | LT-1329467 | weston
- loctite-495-adhesivo-instantaneo-super-bonder-20-gr | LT-270821 | weston

#### calibrador (whole category)

- calibrador-gage-angulo-corte-rosca-acero-inoxidable-weston | STW-9047 | weston
- calibrador-gage-cuerda-60-weston | STW-9050 | weston
- calibrador-gage-cuerdas-acme-weston | STW-9045 | weston
- contador-hilos-weston | STW-4823-31, STW-4823-52, STW-4823-55, STW-4823-60, STW-4823-65 | weston
- cuenta-hilos-metrico-weston | STW-4821-52 | weston

#### carburo

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

#### equipo-seguridad (whole category)

- lente-general-tricolor-ansi-weston | ST-6-500-065, ST-6-500-066 | weston

#### herramientas-corte-conformado

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

#### herramientas-diagnostico-electricidad (whole category)

- probador-circuito-6-24v | KT-9DC22 | king-tony

#### herramientas-impacto-forja (whole category)

- martillo-estilo-aleman | KT-7821-50 | king-tony
- martillo-reparacion-hojalateria | KT-9CF131 | king-tony

#### herramientas-marcado (whole category)

- marcador-hp-proline | STM-096960, STM-096961, STM-096964, STM-096966 | weston
- marcador-valve-action | STM-096809, STM-096820, STM-096821, STM-096822, STM-096823, STM-096825, STM-096826 | weston

#### llaves-herramientas-apriete

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

#### lubricantes-multifuncionales (whole category)

- wd-40-aerosol | WD-52203, WD-52208, WD-52211 | weston

#### perforacion-accesorios-taladro

- arbol-para-broquero-weston | SA-015-0290, SA-015-0310, SA-015-0340, SA-015-0350, SA-015-0360, SA-015-0370, SA-015-0400, SA-015-0410, SA-015-0420, SA-015-0430, SA-015-0440, SA-015-0480 | weston
- boquilla-cono-morse-weston | SA-015-0620, SA-015-0640, SA-015-0670, SA-015-0710, SA-015-0730 | weston
- broquero-ajustable-weston | SA-010-0340, SA-010-0360, SA-010-0370, SA-010-0380 | weston
- broquero-con-llave-y-montaje-weston | SA-010-0100, SA-010-0120, SA-010-0130, SA-010-0140, SA-010-0150, SA-010-0160, SA-010-0170 | weston
- broquero-jacobs-con-llave-weston | SA-012-0060, SA-012-0080, SA-012-0200, SA-012-0230 | weston
- broquero-jacobs-weston | SA-012-0110 | weston
- llave-jacobs-weston | SA-012-0010, SA-012-0020, SA-012-0120, SA-012-0130, SA-012-0140, SA-012-0150, SA-012-0160, SA-012-0170 | weston
- moleteador-weston | SA-100-0080, SA-100-0090, SA-100-0100 | weston
- super-broquero-embalado-con-llave-weston | SA-010-0190, SA-010-0200, SA-010-0210 | weston

#### roscado-herramientas-roscas

- maneral-para-insertar-volkel | TEV-08004, TEV-08006, TEV-08008, TEV-08009, TEV-08010, TEV-08011, TEV-08013, TEV-08014, TEV-08015, TEV-08016, TEV-08018, TEV-08021, TEV-08022, TEV-08023 | volkel (only if the `maneral-dado-tarraja-volkel` `?` guess is wrong)

#### sujecion

- clamp-accion-pestillo-weston | CH-40324, CH-40371 | weston
- clamp-pestillo-weston | CH-40344 | weston

#### tornilleria

- tornillo-ojo-forjado-weston | C-00600, C-00605, C-00610, C-00615, C-00620, C-00625, C-00630, C-00635, C-00640, C-00645, C-00650, C-00655, C-00660, C-00665, C-00670 | weston (only if the `argolla-carga` `?` guess is wrong)
- varilla-rosc-cl-4.8-neg-1mt-mm | — | libre (fallback: varilla-87)
- varilla-rosc-cl-8.8-neg-1mt-mm | — | libre (fallback: varilla-87)

Rough count: ~215 products mapped (≈95 `✓`, rest shared/guessed), ~115 without an image.

## Append C - New map optimized "tornilleria" images

- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084052/tornillo-hex-int-cab-plana-acer-inox-304_maeisu.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084053/tuerca-2h-negra_azrnny.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084052/tornillo-maquina-cabeza-hexagonal-grado-2-cda-corrida-galvanizado_niex9z.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084052/tornillo-hex-int-cab-cil-acer-inox-304_tihdaz.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084051/tornillo-hexagono-interior-guia-std_psgfrl.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084051/tornillo-hex-int-cab-bot-acer-inox-304_e4wrlf.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084050/tornillo-hexagono-interior-cabeza-plana-std_ctetxn.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084050/tornillo-hexagono-interior-cabeza-cilindrica-metrico-din-912_ccr8aj.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084050/tornillo-hexagono-interior-cabeza-boton-std_wtgej1.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084049/tornillo-hexagono-interior-cabeza-baja-metrico_wjv25b.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084049/tornillo-hexagono-interior-cabeza-baja-cilindrica_x7llkr.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084049/tornillo-cabeza-queso-ranurado-din-84-metrico_fqgkn6.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084049/tornillo-cabeza-queso-din-84-acero-inoxidable-304-metrico_gnsg92.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084048/tornillo-cabeza-plana-ranurado-phillips-acero-inoxidable-304_scrhgh.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084048/tornillo-cabeza-plana-phillips-metrico-din-965_xr15ow.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084047/tornillo-cabeza-plana-phillips-galvanizado_z2sy0m.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084047/tornillo-cabeza-hexagonal-grado-8-negro-std_laa0u4.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084047/tornillo-cabeza-hexagonal-grado-5-negro-unc_o2tmcu.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084046/tornillo-cabeza-hexagonal-grado-5-negro-fino_axmlrt.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084045/tornillo-cabeza-hexagonal-cl-8-8-fino-din-960-96_efditv.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084046/tornillo-cabeza-hexagonal-cuerda-corrida-acero-inoxidable-304_nvzlym.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084045/tornillo-cabeza-hexagonal-cl-8-8-din-933-931_d1calj.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084045/tornillo-cabeza-gota-ranurado-combinado-acero-inoxidable-304_a2uqxl.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084045/tornillo-cabeza-gota-combinado-galvanizado_q9ivmo.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084044/tornillo-cabeza-fijadora-ranurado-din-85-acero-inoxidable-304-metrico_twnpyd.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084043/tapon-dry-seal_zdqxub.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084043/tornillo-cabeza-coche-acero-inoxidable-304_vgmrb6.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084043/tornillo-cabeza-coche-grado-2-galvanizado_lp3d8v.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084043/taquete-arpon-acero-inoxidable-304_o796xg.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084043/rondana-plana-acero-inoxidable-304_epkne4.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084042/rondana-de-presion-negra_w6ef7b.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084042/rondana-f-436-negra_cqnopj.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084041/rondana-de-presion-metrica-negra-din-12_lqaegq.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084041/rondana-de-presion-galvanizada_tnzs1n.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084041/rondana-de-presion-acero-inoxidable-304-std_b3h3jt.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084041/remache-pop-corta-acero-inoxidable-304_rbqqhg.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084040/pija-multiusos-phillips-negra_tf0sev.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084039/pija-k-lath-punta-broca-galvanizado-galaxy_qhcl0f.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084039/pija-galvanizada-punta-fijadora-combinada_gln5nw.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084039/pija-k-lath-punta-aguda-galvanizada_vsafwp.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084039/pija-galvanizada-cabeza-hexagonal-punta-broca-calidad_ycvei2.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084039/pija-galvanizada-cabeza-hexagonal-madera_xk6jdo.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084038/pija-cabeza-plana-phillips-lamina-galvanizada_aq8gjo.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084038/pija-cabeza-hexagonal-para-lamina_metrop.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084037/pija-cabeza-fijadora-combi-latonada_jcjzxz.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084037/pija-304-cabeza-plana-phillips-acero-inoxidable_uk96zz.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084037/pija-410-punta-broca-cabeza-hexagonal-acero-inoxidable_dckztd.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084036/pija-304-cabeza-fijadora-phillips-acero-inoxidable_cumpsd.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084036/perno-solido-rectificado-mm_s7xk9w.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084035/perno-solido-rectificado-inches_afxmw9.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084035/opresor-punta-copa-mm-din-916-std_gq4fzy.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084035/opresor-hexagono-interior-punta-copa-std_uqfyaw.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084034/opresor-hexagono-interior-punta-copa-acero-inoxidable-304_moujlt.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084034/nudo-maleable-acero-inoxidable-304_xfeafk.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084034/juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-galaxy_qlg230.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084034/juego-pijas-cabeza-hexagonal-punta-broca-accesorio-epdm-calidad-plus_dzn774.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084033/accesorios-epdm-pija-punta-de-broca_wnp71s.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084033/accesorios-epdm-calidad-plus-pija-punta-de-broca_vsimzx.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084033/varilla-rosc-cl-8.8-neg-1mt-mm_ltdjh2.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084032/varilla-rosc-acer-inox-304-3f_a6e6qc.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084032/varilla-negra-b7-1mt_hxy7ev.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084032/varilla-grad-5-1mt-neg_uciq3p.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084031/varilla-grad-2-galv-3mt_etvwqt.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084031/varilla-acme-1mt_eukl86.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084031/varilla-grad-2-galv-1mt_vt5myx.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084030/tuerca-tino-4-puntas-galv-nc-nf_aos1c3.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084030/tuerca-mariposa-forjada-galvanizada_exurti.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084030/tuerca-mariposa-acer-inox-304_qeufen.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084029/tuerca-inserto-nylon-galv-nc_trtq6q.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084029/tuerca-inserto-nylon-galvanizada-nf_sczicv.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084028/tuerca-inserto-nylon-din-985-galv_vdzugo.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084028/tuerca-hexagonal-rosca-acme-grado-2-negra-forjada_ntngv7.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084028/tuerca-hexagonal-rosca-acme-gdo-2-negr-maquinada_xpyuxy.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084028/tuerca-hexagonal-metrica-din-934-negra_y4tufu.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084026/tuerca-hexagonal-liviana-grado-2-nc-galv_iaaspg.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084026/tuerca-hexagonal-liviana-grado-2-nc-negra_xpkppr.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084026/tuerca-hexagonal-grado-5-nf-pav_p6ensa.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084026/tuerca-flange-aserra-galv-metr_ge3nmk.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084026/tuerca-gripco-grado-c-galv-nc-nf_ynufje.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084026/tuerca-hexagonal-grado-5-nc-pav_wfsphy.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084026/tuerca-flange-aserra-galv-estandar_bqjcjb.webp
- https://res.cloudinary.com/dov7g4avx/image/upload/v1790084025/tuerca-bellota-niquelada-nc-nf_pukdwu.webp
