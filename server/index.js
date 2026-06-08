import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import problemRouter from './routes/problem.js';
import runRouter from './routes/run.js';
import contestRouter from './routes/contest.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
// Basically give the folder in which this current file is
//eg: Here __dirname will be D:\CodeUp\server 
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/problem', problemRouter);
app.use('/api/run', runRouter);
app.use('/api/contest', contestRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(` Server Listening on http://localhost:${PORT}`);
});