'use strict';

async function clearSeedData() {
  try {
    console.log('Starting to clear seed data...');

    // Delete in reverse order of dependencies
    await deleteProductVariants();
    await deleteProducts();
    await deleteBrands();
    await deleteCategories();

    console.log('All seed data cleared successfully');
  } catch (error) {
    console.log('Could not clear seed data');
    console.error(error);
  }
}

async function deleteProductVariants() {
  console.log('Deleting product variants...');
  
  const variants = await strapi.documents('api::product-variant.product-variant').findMany({
    limit: 10000,
  });

  for (const variant of variants) {
    await strapi.documents('api::product-variant.product-variant').delete({
      documentId: variant.documentId,
    });
  }

  console.log(`Deleted ${variants.length} product variants`);
}

async function deleteProducts() {
  console.log('Deleting products...');
  
  const products = await strapi.documents('api::product.product').findMany({
    limit: 10000,
  });

  for (const product of products) {
    await strapi.documents('api::product.product').delete({
      documentId: product.documentId,
    });
  }

  console.log(`Deleted ${products.length} products`);
}

async function deleteBrands() {
  console.log('Deleting brands...');
  
  const brands = await strapi.documents('api::brand.brand').findMany({
    limit: 10000,
  });

  for (const brand of brands) {
    await strapi.documents('api::brand.brand').delete({
      documentId: brand.documentId,
    });
  }

  console.log(`Deleted ${brands.length} brands`);
}

async function deleteCategories() {
  console.log('Deleting categories...');
  
  const categories = await strapi.documents('api::category.category').findMany({
    limit: 10000,
  });

  for (const category of categories) {
    await strapi.documents('api::category.category').delete({
      documentId: category.documentId,
    });
  }

  console.log(`Deleted ${categories.length} categories`);
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await clearSeedData();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
