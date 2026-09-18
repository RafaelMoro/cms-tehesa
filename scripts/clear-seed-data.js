'use strict';

const { allDocumentIds } = require('./document-ids');

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

async function deleteAll(model) {
  const uid = `api::${model}.${model}`;
  const ids = await allDocumentIds(uid);
  console.log(`Deleting ${ids.length} ${model} documents...`);
  for (const documentId of ids) {
    await strapi.documents(uid).delete({ documentId });
  }
}

const deleteProductVariants = () => deleteAll('product-variant');
const deleteProducts = () => deleteAll('product');
const deleteBrands = () => deleteAll('brand');
const deleteCategories = () => deleteAll('category');

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
