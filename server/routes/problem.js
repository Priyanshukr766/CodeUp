import { Router } from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import axios from 'axios';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to the Python scraper (two levels up from server/routes/)
const SCRAPER_PATH = resolve(__dirname, '../../cf_fetcher.py');
const PYTHON_CMD   = process.platform === 'win32' ? 'python' : 'python3';

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
      const jsonStart = stdout.indexOf('{');
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

// ── Token parser (mirrors cf_fetcher.py logic) ────────────────────────────────
function parseToken(raw) {
  // Full CF URL
  const urlMatch = raw.match(
    /codeforces\.com\/(?:contest|gym)\/(\d+)\/problem\/([A-Za-z]\d*)/i
  );
  if (urlMatch) return [urlMatch[1], urlMatch[2].toUpperCase()];

  // Compact token "1984A"
  const tokenMatch = raw.match(/^(\d+)\s*([A-Za-z]\d*)$/);
  if (tokenMatch) return [tokenMatch[1], tokenMatch[2].toUpperCase()];

  return null;
}

// ── GET /api/problem/:token ───────────────────────────────────────────────────
router.get('/:token(*)', async (req, res) => {
  const raw = decodeURIComponent(req.params.token).trim();

  if (!raw) {
    return res.status(400).json({ error: 'Problem token is required' });
  }

  try {
    // Run Python scraper
    const problem = await runScraper(raw);

    // Attempt to enrich with CF API metadata
    const parsed = parseToken(raw);
    if (parsed) {
      const [contestId, problemIndex] = parsed;
      const meta = await fetchCFMeta(contestId, problemIndex);
      if (meta) {
        problem.rating = meta.rating;
        problem.tags   = meta.tags;
      }
    }

    res.json(problem);
  } catch (err) {
    console.error('[problem route]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;