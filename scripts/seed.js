'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { categories, global, brands } = require('../data/data.json');

// Load all products.*.json files from tehesa-products/data subdirectories
const dataPath = path.join(__dirname, '../../tehesa-products/data');
const products = [];

function loadProductsFromDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Check if this directory contains a products.*.json file
      const files = fs.readdirSync(fullPath);
      const productFile = files.find(file => file.match(/^products\..+\.json$/));
      
      if (productFile) {
        const productFilePath = path.join(fullPath, productFile);
        const productData = require(productFilePath);
        products.push(...productData);
        console.log(`Loaded ${productData.length} products from ${productFile}`);
      }
    }
  }
}

loadProductsFromDirectory(dataPath);

async function seedExampleApp() {
  const shouldImportSeedData = await isFirstRun();

  try {
    console.log('Setting up the template...');
    await importSeedData();
    console.log('Ready to go');
  } catch (error) {
    console.log('Could not import seed data');
    console.error(error);
  }
  // if (shouldImportSeedData) {
  // } else {
  //   console.log(
  //     'Seed data has already been imported. We cannot reimport unless you clear your database first.'
  //   );
  // }
}

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
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
    console.error({ model, entry, error });
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

async function importGlobal() {
  const favicon = await checkFileExistsBeforeUpload(['favicon.png']);
  return createEntry({
    model: 'global',
    entry: {
      ...global,
      favicon,
      // Make sure it's not a draft
      publishedAt: Date.now(),
      defaultSeo: {
        ...global.defaultSeo,
      },
    },
  });
}

async function importCategories() {
  for (const category of categories) {
    await createEntry({ model: 'category', entry: category });
  }
}

async function importBrands() {
  for (const brand of brands) {
    await createEntry({ model: 'brand', entry: brand });
  }
}

async function importProducts() {
  // Fetch categories and brands from Strapi to create relations
  const categories = await strapi.documents('api::category.category').findMany({
    limit: 1000,
  });
  const brands = await strapi.documents('api::brand.brand').findMany({
    limit: 1000,
  });

  // Create maps for easy lookup
  const categoriesMap = new Map();
  categories.forEach((category) => {
    if (category.customId) {
      categoriesMap.set(category.customId, category.documentId);
    }
  });

  const brandsMap = new Map();
  brands.forEach((brand) => {
    if (brand.customId) {
      brandsMap.set(brand.customId, brand.documentId);
    }
  });

  // Import each product with relations
  for (const product of products) {
    const { categoryCustomId, brandCustomId, ...productData } = product;

    const categoryDocumentId = categoryCustomId ? categoriesMap.get(categoryCustomId) : null;
    const brandDocumentId = brandCustomId ? brandsMap.get(brandCustomId) : null;

    await createEntry({
      model: 'product',
      entry: {
        ...productData,
        category: categoryDocumentId,
        brand: brandDocumentId,
      },
    });
  }
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    category: ['find', 'findOne'],
    brand: ['find', 'findOne'],
  });

  // Create all entries
  await importCategories();
  await importBrands();
  await importProducts();
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
