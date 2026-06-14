I have run the python file directly in terminal
(not through the frontend or app) 
The same script run multiple times to show you time.

(.venv) PS D:\CodeUp> python cf_fetcher.py 1984A
[cf_fetcher] Fetching problem: 1984A
[LATENCY] fetch_problem(1984A) completed in 6.35s

(.venv) PS D:\CodeUp> python cf_fetcher.py 1984A
[cf_fetcher] Fetching problem: 1984A
[LATENCY] fetch_problem(1984A) completed in 5.43s


(.venv) PS D:\CodeUp> python cf_fetcher.py 1984A
[cf_fetcher] Fetching problem: 1984A
[LATENCY] fetch_problem(1984A) completed in 3.86s

(.venv) PS D:\CodeUp> python cf_fetcher.py 1984A
[cf_fetcher] Fetching problem: 1984A
[LATENCY] fetch_problem(1984A) completed in 1.78s


============================================================
  CodeUp Benchmark — Collecting Resume Numbers
============================================================


── TEST 1: Redis Cache Hit vs Miss ──
── TEST 1: Redis Cache Hit vs Miss ──
Fetching 143B (cold — triggers scraper + Redis SET)...
[CACHE MISS (scraper)] 16288 ms
Fetching 143B again (hot — should come from Redis)...
[CACHE HIT  (Redis) ] 60 ms

  → Cold: 16288ms  |  Hot: 60ms  |  Reduction: 99.6%

── TEST 2: Codeforces Problem Sync Count ──
Calling POST /api/sync/problems (this may take 10-20s)...
Calling POST /api/sync/problems (this may take 10-20s)...
[SYNC] 8937 ms
[SYNC] 8937 ms
  → Synced 11237 problems in 8937ms

── TEST 3: Gemini AI Roadmap Response Time ──
Calling POST /api/ai/roadmap with sample metrics...
(This needs a valid userId from your Supabase users table.)


If you get an error, replace the userId below with a real one.

[GEMINI (cold)] 11109 ms
  → Error: Failed to generate roadmap.
  → To fix: replace userId in this script with a real user ID from Supabase.

============================================================
  SUMMARY — Copy these numbers back to me:
============================================================
  Redis cache miss:  16288 ms
  Redis cache hit:   60 ms
  Problem count:     11237
  Gemini cold call:  11109 ms
============================================================