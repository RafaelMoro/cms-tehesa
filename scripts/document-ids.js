'use strict';

// All documentIds for a content type via the db layer, which has no result limit
// (strapi.documents().findMany caps at `limit`, which silently truncated at 10000).
async function allDocumentIds(uid, { unpublishedOnly = false } = {}) {
  const rows = await strapi.db.query(uid).findMany({ select: ['documentId', 'publishedAt'] });
  const published = new Set(rows.filter((r) => r.publishedAt).map((r) => r.documentId));
  const all = new Set(rows.map((r) => r.documentId));
  return [...all].filter((id) => !unpublishedOnly || !published.has(id));
}

module.exports = { allDocumentIds };
