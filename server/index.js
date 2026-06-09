import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import problemRouter from './routes/problem.js';
import runRouter from './routes/run.js';
import contestRouter from './routes/contest.js';
import authRouter from './routes/auth.js';
import syncRouter from './routes/sync.js';
import analyticsRouter from './routes/analytics.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
// Basically give the folder in which this current file is
//eg: Here __dirname will be D:\CodeUp\server 
const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet()); // Sets 15+ secure HTTP headers

// Allow frontend connection (use .env CLIENT_URL in production, fallback to localhost)
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '2mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Prevent DDoS and abuse of our free AI/Compiler APIs
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', globalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/problem', problemRouter);
app.use('/api/run', runRouter);
app.use('/api/contest', contestRouter);
app.use('/api/auth', authRouter);
app.use('/api/sync', syncRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(` Server Listening on http://localhost:${PORT}`);
});