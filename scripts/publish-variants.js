'use strict';

async function publishAllVariants() {
  try {
    console.log('Starting to publish all product variants...');
    
    // Fetch all product variants from Strapi (including drafts)
    const variants = await strapi.documents('api::product-variant.product-variant').findMany({
      limit: 10000,
      status: 'draft',
    });

    console.log(`Found ${variants.length} draft variants to publish`);

    let publishedCount = 0;
    let errorCount = 0;

    // Publish each variant
    for (const variant of variants) {
      try {
        await strapi.documents('api::product-variant.product-variant').publish({
          documentId: variant.documentId,
        });
        publishedCount++;
        
        if (publishedCount % 100 === 0) {
          console.log(`Published ${publishedCount} variants so far...`);
        }
      } catch (error) {
        console.error(`Failed to publish variant ${variant.documentId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Publish Summary ===');
    console.log(`Total draft variants found: ${variants.length}`);
    console.log(`Successfully published: ${publishedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('All variants have been published!');
  } catch (error) {
    console.log('Could not publish variants');
    console.error(error);
  }
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await publishAllVariants();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
