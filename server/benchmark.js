/**
 * benchmark.js — One-shot script to collect the 3 missing resume numbers.
 * 
 * Run while your server is already running on localhost:3001:
 *   node benchmark.js
 * 
 * It will measure:
 *   1. Redis cache-hit latency (fetch a problem twice — 2nd is from cache)
 *   2. Codeforces problem count (POST /api/sync/problems)
 *   3. Gemini response time (POST /api/ai/roadmap with dummy data)
 */

const BASE = 'http://localhost:3001';

async function measure(label, fn) {
  const start = Date.now();
  const result = await fn();
  const elapsed = Date.now() - start;
  console.log(`[${label}] ${elapsed} ms`);
  return { result, elapsed };
}

async function main() {
  console.log('='.repeat(60));
  console.log('  CodeUp Benchmark — Collecting Resume Numbers');
  console.log('='.repeat(60));
  console.log();

  // ── 1. Problem fetch: cold (scraper) vs hot (Redis cache hit) ──────────
  console.log('── TEST 1: Redis Cache Hit vs Miss ──');
  console.log('Fetching 143B (cold — triggers scraper + Redis SET)...');
  
  const cold = await measure('CACHE MISS (scraper)', () =>
    fetch(`${BASE}/api/problem/143B`).then(r => r.json())
  );
  
  console.log('Fetching 143B again (hot — should come from Redis)...');
  
  const hot = await measure('CACHE HIT  (Redis) ', () =>
    fetch(`${BASE}/api/problem/143B`).then(r => r.json())
  );
  
  if (cold.elapsed > 0 && hot.elapsed > 0) {
    const reduction = (((cold.elapsed - hot.elapsed) / cold.elapsed) * 100).toFixed(1);
    console.log(`\n  → Cold: ${cold.elapsed}ms  |  Hot: ${hot.elapsed}ms  |  Reduction: ${reduction}%\n`);
  }

  // ── 2. Sync problem count ─────────────────────────────────────────────
  console.log('── TEST 2: Codeforces Problem Sync Count ──');
  console.log('Calling POST /api/sync/problems (this may take 10-20s)...');
  
  const sync = await measure('SYNC', () =>
    fetch(`${BASE}/api/sync/problems`, { method: 'POST' }).then(r => r.json())
  );
  
  console.log(`  → Synced ${sync.result.count ?? 'N/A'} problems in ${sync.elapsed}ms\n`);

  // ── 3. Gemini AI response time ────────────────────────────────────────
  console.log('── TEST 3: Gemini AI Roadmap Response Time ──');
  console.log('Calling POST /api/ai/roadmap with sample metrics...');
  console.log('(This needs a valid userId from your Supabase users table.)');
  console.log('If you get an error, replace the userId below with a real one.\n');
  
  // NOTE: You may need to replace this userId with a real one from your DB.
  // Run this SQL in Supabase dashboard to find one:
  //   SELECT id FROM users LIMIT 1;
  const testPayload = {
    userId: 'aeae4fbe-19cf-4ec9-92d0-55db0e8dd9e1',  // ← Replace this!
    metrics: {
      most_solved_rating: '1200',
      highest_solved_rating: 1600,
      top_tags: ['greedy', 'math', 'implementation'],
      weak_tags: ['dp', 'graphs', 'trees'],
      weekly_solves: 5
    },
    targetRating: 1400
  };

  const gemini = await measure('GEMINI (cold)', () =>
    fetch(`${BASE}/api/ai/roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    }).then(r => r.json())
  );

  if (gemini.result.error) {
    console.log(`  → Error: ${gemini.result.error}`);
    console.log('  → To fix: replace userId in this script with a real user ID from Supabase.\n');
  } else {
    console.log(`  → Gemini responded in ${gemini.elapsed}ms\n`);
    
    // Call again to test cache hit
    console.log('Calling again (should hit SHA-256 cache)...');
    const geminiHot = await measure('GEMINI (cached)', () =>
      fetch(`${BASE}/api/ai/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      }).then(r => r.json())
    );
    console.log(`  → Cached response in ${geminiHot.elapsed}ms\n`);
  }

  // ── Summary ───────────────────────────────────────────────────────────
  console.log('='.repeat(60));
  console.log('  SUMMARY — Copy these numbers back to me:');
  console.log('='.repeat(60));
  console.log(`  Redis cache miss:  ${cold.elapsed} ms`);
  console.log(`  Redis cache hit:   ${hot.elapsed} ms`);
  console.log(`  Problem count:     ${sync.result.count ?? 'ERROR'}`);
  console.log(`  Gemini cold call:  ${gemini.elapsed} ms`);
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Benchmark failed:', err.message);
  process.exit(1);
});
