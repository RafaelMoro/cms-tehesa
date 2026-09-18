'use strict';

const { allDocumentIds } = require('./document-ids');

// Publish all draft documents. Usage: node scripts/publish-content.js [model ...]
// Defaults to categories, brands, products and product variants, in relation order.
const ALL_MODELS = ['category', 'brand', 'product', 'product-variant'];
const models = process.argv.slice(2).length ? process.argv.slice(2) : ALL_MODELS;

async function publishAll(model) {
  const uid = `api::${model}.${model}`;
  const drafts = await allDocumentIds(uid, { unpublishedOnly: true });
  console.log(`[${model}] ${drafts.length} unpublished documents found`);

  let published = 0;
  let errors = 0;
  for (const documentId of drafts) {
    try {
      await strapi.documents(uid).publish({ documentId });
      published++;
      if (published % 500 === 0) console.log(`[${model}] published ${published}...`);
    } catch (error) {
      console.error(`[${model}] failed ${documentId}: ${error.message}`);
      errors++;
    }
  }
  console.log(`[${model}] published ${published}, errors ${errors}`);
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';

  for (const model of models) await publishAll(model);

  await app.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
