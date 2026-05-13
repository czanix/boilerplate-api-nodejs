import express from 'express';
import { securityHeaders } from './presentation/middlewares/security-headers';
import { getDb } from './infrastructure/database/connection';
import { createIndexes } from './infrastructure/database/indexes';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(securityHeaders);

app.get('/health', async (_, res) => {
  try { const db = await getDb(); await db.command({ ping: 1 }); res.json({ status: 'ok' }); }
  catch { res.status(503).json({ status: 'degraded' }); }
});

const PORT = parseInt(process.env.PORT ?? '3000');
app.listen(PORT, async () => {
  const db = await getDb();
  await createIndexes(db);
  console.log(JSON.stringify({ event: 'server_started', port: PORT }));
});
