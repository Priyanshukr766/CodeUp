import { createClient } from 'redis';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env relative to this file
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const redisUrl = process.env.REDIS_URL;

let redisClient = null;

if (redisUrl) {
  redisClient = createClient({
    url: redisUrl
  });

  redisClient.on('error', (err) => console.error('[Redis Client Error]', err));
  
  // Connect immediately
  redisClient.connect().catch(console.error);
} else {
  console.warn('[Redis] No REDIS_URL found in .env. Caching will be disabled.');
}

export default redisClient;
