'use strict';

async function listDraftVariants() {
  try {
    console.log('Fetching draft product variants...');

    const variants = await strapi.documents('api::product-variant.product-variant').findMany({
      limit: 10000,
      status: 'draft',
      populate: ['product', 'pricing'],
    });

    console.log(`Found ${variants.length} draft product variants`);

    if (variants.length === 0) {
      return;
    }

    for (const variant of variants) {
      const productName = variant.product?.name || 'Unknown product';
      const productCustomId = variant.product?.customId || 'N/A';
      const internalId = variant.internalId || 'N/A';
      const diameter = variant.diameter || 'N/A';
      const quantity = variant.quantity ?? 'N/A';
      const price = variant.pricing?.price ?? 'N/A';

      console.log(
        [
          `documentId=${variant.documentId}`,
          `internalId=${internalId}`,
          `product=${productName}`,
          `productCustomId=${productCustomId}`,
          `diameter=${diameter}`,
          `quantity=${quantity}`,
          `price=${price}`,
        ].join(' | ')
      );
    }

    console.log(`Total draft variants: ${variants.length}`);
  } catch (error) {
    console.log('Could not list draft product variants');
    console.error(error);
  }
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await listDraftVariants();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
