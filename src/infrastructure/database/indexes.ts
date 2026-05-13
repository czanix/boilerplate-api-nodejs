import type { Db } from 'mongodb';

export async function createIndexes(db: Db): Promise<void> {
  await db.collection('products').createIndexes([
    { key: { category: 1, createdAt: -1 }, name: 'ix_products_category_recent' },
    { key: { name: 'text', description: 'text' }, name: 'ix_products_text', weights: { name: 10, description: 1 } },
    { key: { publicId: 1 }, name: 'ix_products_public_id', unique: true },
  ]);
}
