import { Router } from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';
import axios from 'axios';
import redisClient from '../utils/redisAdmin.js';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to the Python scraper
const SCRAPER_PATH = resolve(__dirname, '../../cf_fetcher.py');

function getPythonCmd() {
  if (process.env.PYTHON_CMD) return process.env.PYTHON_CMD;

  // Check for local project virtualenv first (.venv)
  const venvWin = resolve(__dirname, '../../.venv/Scripts/python.exe');
  if (process.platform === 'win32' && fs.existsSync(venvWin)) {
    return venvWin;
  }
  const venvUnix = resolve(__dirname, '../../.venv/bin/python');
  if (fs.existsSync(venvUnix)) {
    return venvUnix;
  }

  return process.platform === 'win32' ? 'python' : 'python3';
}

const PYTHON_CMD = getPythonCmd();

// ── Spawn cf_fetcher.py and collect stdout ────────────────────────────────────
function runScraper(token) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_CMD, ['-X', 'utf8', SCRAPER_PATH, token], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => { stdout += d.toString('utf8'); });
    child.stderr.on('data', d => { stderr += d.toString('utf8'); });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('Scraper timed out after 25 s'));
    }, 25_000);

    child.on('close', code => {
      clearTimeout(timer);
      if (code !== 0) {
        // Extract the error line from stderr
        const errLine = stderr.split('\n').find(l => l.includes('ERROR:')) || stderr;
        return reject(new Error(errLine.replace('[cf_fetcher] ERROR:', '').trim()));
      }

      // stdout contains log lines + the JSON blob — grab the JSON block
      const marker = '-- Full JSON Payload --';
      const markerIdx = stdout.indexOf(marker);
      const jsonStart = markerIdx !== -1 ? stdout.indexOf('{', markerIdx) : stdout.indexOf('{');
      if (jsonStart === -1) {
        return reject(new Error('Scraper returned no JSON output'));
      }
      try {
        resolve(JSON.parse(stdout.slice(jsonStart)));
      } catch (e) {
        reject(new Error('Failed to parse scraper JSON: ' + e.message));
      }
    });
  });
}

// ── Fetch tags + rating from Codeforces public API ────────────────────────────
async function fetchCFMeta(contestId, problemIndex) {
  try {
    const url = `https://codeforces.com/api/problemset.problems`;
    const { data } = await axios.get(url, { timeout: 8000 });
    if (data.status !== 'OK') return null;

    //in the list of all problems, find the problem that matches the given contestId and problemIndex
    //Example: if contestId is "1984" and problemIndex is "A", then find the problem with contestId "1984" and problemIndex "A"
    const problem = data.result.problems.find(
      p => String(p.contestId) === String(contestId) &&
           p.index.toUpperCase() === problemIndex.toUpperCase()
    );
    if (!problem) return null;

    return {
      rating: problem.rating ?? null,
      tags:   problem.tags   ?? [],
    };
  } catch {
    return null; // CF API is optional — don't fail the whole request
  }
}

/*matlab user agar  
1984A
or
https://codeforces.com/contest/1984/problem/A

enter krega to ye func iss 1984 and A ko extract krega and obj mei send krega
Result: ["1984", "A"]
*/
function parseToken(raw) {
  // Pattern 1: /contest/{id}/problem/{index}  or  /gym/{id}/problem/{index}
  //   e.g. https://codeforces.com/contest/580/problem/C
  const contestMatch = raw.match(
    /codeforces\.com\/(?:contest|gym)\/(\d+)\/problem\/([A-Za-z]\d*)/i
  );
  if (contestMatch) return [contestMatch[1], contestMatch[2].toUpperCase()];

  // Pattern 2: /problemset/problem/{id}/{index}  (NO second "/problem/" segment)
  //   e.g. https://codeforces.com/problemset/problem/1324/F
  const problemsetMatch = raw.match(
    /codeforces\.com\/problemset\/problem\/(\d+)\/([A-Za-z]\d*)/i
  );
  if (problemsetMatch) return [problemsetMatch[1], problemsetMatch[2].toUpperCase()];

  // Compact token "1984A" or "1984 A"
  const tokenMatch = raw.match(/^(\d+)\s*([A-Za-z]\d*)$/);
  if (tokenMatch) return [tokenMatch[1], tokenMatch[2].toUpperCase()];

  return null;
}

// ── GET /api/problem/:token ───────────────────────────────────────────────────
router.get('/:token(*)', async (req, res) => {
  const raw = decodeURIComponent(req.params.token).trim();
  
/*
raw stores the problem token/URL after decoding and cleaning it.
Example:
User enters:
https://codeforces.com/contest/1984/problem/A

Sometimes URLs may contain encoded characters such as:
1984%20A
where `%20` represents a space.
`decodeURIComponent()` converts encoded characters back to their original form:
1984%20A  →  1984 A
After decoding, `trim()` removes any unnecessary spaces from the beginning and end of the string.
Example:
"   1984 A   "  →  "1984 A"
This ensures that `raw` contains a clean, usable input for further processing.
*/
  if (!raw) {
    return res.status(400).json({ error: 'Problem token is required' });
  }

  try {
    const parsed = parseToken(raw);
    let cacheKey = `cf_problem:${raw}`;
    if (parsed) {
      cacheKey = `cf_problem:${parsed[0]}:${parsed[1]}`;
    }

    // 1. Check Redis Cache
    if (redisClient && redisClient.isReady) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log(`[problem route] Serving ${cacheKey} from Redis cache`);
          return res.json(JSON.parse(cached));
        }
      } catch (cacheErr) {
        console.warn(`[problem route] Redis cache get failed for ${cacheKey}:`, cacheErr.message);
      }
    }

    console.log(`[problem route] Cache miss for ${cacheKey}. Running scraper...`);

    // 2. Run Python scraper
    const problem = await runScraper(raw);

    // 3. Attempt to enrich with CF API metadata
    if (parsed) {
      const [contestId, problemIndex] = parsed;
      const meta = await fetchCFMeta(contestId, problemIndex);
      if (meta) {
        problem.rating = meta.rating;
        problem.tags   = meta.tags;
      }
    }

    // 4. Store in Redis with 48 hr TTL (172,800 seconds)
    if (redisClient && redisClient.isReady) {
      try {
        await redisClient.setEx(cacheKey, 172800, JSON.stringify(problem));
      } catch (cacheErr) {
        console.warn(`[problem route] Redis cache set failed for ${cacheKey}:`, cacheErr.message);
      }
    }

    res.json(problem);
  } catch (err) {
    console.error('[problem route]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;