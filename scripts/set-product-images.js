'use strict';

const imageMap = require('../data/product-images.json');

async function setProductImages() {
  const customIds = Object.keys(imageMap);
  console.log(`Loaded ${customIds.length} customId -> imageUrl entries`);

  const products = await strapi.documents('api::product.product').findMany({
    filters: { customId: { $in: customIds } },
    limit: 10000,
  });

  const foundIds = new Set(products.map((p) => p.customId));
  const missingInDb = customIds.filter((id) => !foundIds.has(id));

  for (const product of products) {
    const imageUrl = imageMap[product.customId];
    await strapi.documents('api::product.product').update({
      documentId: product.documentId,
      data: { imageUrl },
      status: 'published',
    });
    console.log(`✅ ${product.customId}`);
  }

  const allProducts = await strapi.documents('api::product.product').findMany({ limit: 10000 });
  const withoutUrl = allProducts.filter((p) => !imageMap[p.customId]).map((p) => p.customId);

  console.log(`Updated ${products.length} products`);
  if (missingInDb.length) {
    console.log(`customIds in map but missing in DB (${missingInDb.length}):`, missingInDb);
  }
  console.log(`DB products without a mapped imageUrl (${withoutUrl.length}):`, withoutUrl);
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await setProductImages();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
