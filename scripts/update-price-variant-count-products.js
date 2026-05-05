'use strict';

async function updateProductPrices() {
  try {
    console.log('Starting to update product prices and variant counts...');

    const products = await strapi.documents('api::product.product').findMany({
      limit: 10000,
    });

    console.log(`Found ${products.length} products to update`);

    for (const product of products) {
      // Find all variants for this product
      const variants = await strapi.documents('api::product-variant.product-variant').findMany({
        filters: { 
          product: { 
            documentId: product.documentId 
          } 
        },
        populate: ['pricing'],
        limit: 10000,
      });

      // Extract prices from variants
      const prices = variants
        .map(v => v.pricing?.price)
        .filter(p => typeof p === 'number' && !isNaN(p));

      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
      const variantCount = variants.length;

      // Update the product with the calculated values
      await strapi.documents('api::product.product').update({
        documentId: product.documentId,
        data: {
          minPrice,
          maxPrice,
          variantCount,
        },
      });

      console.log(`✅ Updated ${product.name} (${variantCount} variants, min: ${minPrice}, max: ${maxPrice})`);
    }

    console.log('All products updated successfully');
  } catch (error) {
    console.log('Could not update product prices');
    console.error(error);
  }
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await updateProductPrices();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
