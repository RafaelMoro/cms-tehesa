'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

// Load product variants from perforacion-accesorios-taladro folder
function loadProductVariants() {
  const folderPath = path.join(__dirname, '../../tehesa-products/data/perforacion-accesorios-taladro');
  const files = fs.readdirSync(folderPath);
  
  const allVariants = [];
  
  for (const file of files) {
    // Skip the products.perforacion-accessorios-taladro.json file
    if (file.startsWith('products.') || !file.endsWith('.json')) {
      continue;
    }
    
    const filePath = path.join(folderPath, file);
    const variants = require(filePath);
    allVariants.push(...variants);
  }
  
  return allVariants;
}

const productsVariant = loadProductVariants();

async function seedExampleApp() {
  try {
    console.log('Setting up product variants...');
    await importProductVariants();
    console.log('Product variants imported successfully');
  } catch (error) {
    console.log('Could not import product variants');
    console.error(error);
  }
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats['size'];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = path.join('data', 'uploads', fileName);
  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split('.').pop();
  const mimeType = mime.lookup(ext || '') || '';

  return {
    filepath: filePath,
    originalFileName: fileName,
    size,
    mimetype: mimeType,
  };
}

async function uploadFile(file, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry }) {
  try {
    // Actually create the entry in Strapi
    await strapi.documents(`api::${model}.${model}`).create({
      data: entry,
    });
  } catch (error) {
    console.error({ model, entry, error: error.message, details: error.details });
  }
}

async function checkFileExistsBeforeUpload(files) {
  const existingFiles = [];
  const uploadedFiles = [];
  const filesCopy = [...files];

  for (const fileName of filesCopy) {
    // Check if the file already exists in Strapi
    const fileWhereName = await strapi.query('plugin::upload.file').findOne({
      where: {
        name: fileName.replace(/\..*$/, ''),
      },
    });

    if (fileWhereName) {
      // File exists, don't upload it
      existingFiles.push(fileWhereName);
    } else {
      // File doesn't exist, upload it
      const fileData = getFileData(fileName);
      const fileNameNoExtension = fileName.split('.').shift();
      const [file] = await uploadFile(fileData, fileNameNoExtension);
      uploadedFiles.push(file);
    }
  }
  const allFiles = [...existingFiles, ...uploadedFiles];
  // If only one file then return only that file
  return allFiles.length === 1 ? allFiles[0] : allFiles;
}

async function updateBlocks(blocks) {
  const updatedBlocks = [];
  for (const block of blocks) {
    if (block.__component === 'shared.media') {
      const uploadedFiles = await checkFileExistsBeforeUpload([block.file]);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file name on the block with the actual file
      blockCopy.file = uploadedFiles;
      updatedBlocks.push(blockCopy);
    } else if (block.__component === 'shared.slider') {
      // Get files already uploaded to Strapi or upload new files
      const existingAndUploadedFiles = await checkFileExistsBeforeUpload(block.files);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file names on the block with the actual files
      blockCopy.files = existingAndUploadedFiles;
      // Push the updated block
      updatedBlocks.push(blockCopy);
    } else {
      // Just push the block as is
      updatedBlocks.push(block);
    }
  }

  return updatedBlocks;
}

// Helper function to remove empty strings and null values from an object
function cleanEntryData(data) {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    // Skip empty strings, null, and undefined
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

async function importProductVariants() {
  // Set public permissions for product variants
  await setPublicPermissions({
    'product-variant': ['find', 'findOne'],
  });

  // Fetch all products from Strapi
  const products = await strapi.documents('api::product.product').findMany({
    limit: 1000,
  });

  // Create a map of products by customId for easy lookup
  const productsMap = new Map();
  products.forEach((product) => {
    if (product.customId) {
      productsMap.set(product.customId, product.documentId);
    }
  });

  console.log(`Found ${products.length} products in Strapi`);

  // Import each product variant
  for (const variant of productsVariant) {
    const { productCustomId, ...variantData } = variant;

    // Find the product documentId using the customId
    const productDocumentId = productsMap.get(productCustomId);

    if (!productDocumentId) {
      console.warn(`Product with customId "${productCustomId}" not found. Skipping variant.`);
      continue;
    }

    // Clean the variant data (remove empty strings and null values)
    const cleanedVariantData = cleanEntryData(variantData);

    // Create the product variant with the product relation
    await createEntry({
      model: 'product-variant',
      entry: {
        ...cleanedVariantData,
        product: productDocumentId,
      },
    });
  }

  console.log(`Imported ${productsVariant.length} product variants`);
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await seedExampleApp();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});