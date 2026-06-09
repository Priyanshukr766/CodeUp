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

// ── Security Middleware ────────────────────────────────────────────────────────
// Helmet sets various HTTP headers for security (X-XSS-Protection, Strict-Transport-Security, etc)
app.use(helmet());

// Dynamic CORS: Allow localhost for dev, or the specific Vercel URL in production
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));

// Rate Limiting: Prevent DDoS and API abuse (150 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, 
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);

app.use(express.json({ limit: '2mb' }));

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