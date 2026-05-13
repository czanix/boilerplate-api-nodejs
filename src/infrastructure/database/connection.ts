import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!client) {
    const url = process.env.MONGODB_URL ?? 'mongodb://localhost:27017';
    client = new MongoClient(url);
    await client.connect();
  }
  return client.db(process.env.DB_NAME ?? 'czanix');
}

export async function closeDb(): Promise<void> {
  if (client) { await client.close(); client = null; }
}
