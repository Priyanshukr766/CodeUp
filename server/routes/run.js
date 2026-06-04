import { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// ── Base URL and API key ──────────────────────────────────────────────────────
const OC_BASE_URL = 'https://api.onlinecompiler.io';
const OC_KEY      = process.env.OC_KEY || '';

/*
  onlinecompiler.io compiler identifiers
  Docs: https://onlinecompiler.io/docs#compilers

  Our langId  →  compiler string sent to the API
  ---------------------------------------------------
  cpp         →  g++-15      (G++ 15, C++23 support)
  c           →  gcc-15      (GCC 15)
  java        →  openjdk-25  (OpenJDK 25)
  python      →  python-3.14
*/
const COMPILER_MAP = {
  cpp:    'g++-15',
  c:      'gcc-15',
  java:   'openjdk-25',
  python: 'python-3.14',
};

// ── Map onlinecompiler.io response to a human-readable status string ──────────
/*
  The API returns:
    status    → "success" | "error"
    exit_code → 0 = OK, 124 = timeout, 137 = killed (OOM), 139 = segfault
    signal    → null | signal number (e.g. 9 for SIGKILL)
    error     → stderr / compile errors (max 999 chars)
    output    → stdout (max 999 chars)

  We map these to the same status labels the old Judge0 code used so the
  frontend verdict cards don't need any changes.
*/
function resolveStatus(apiResp) {
  const { status, exit_code, signal, error } = apiResp;

  if (status === 'success' && exit_code === 0) return 'Accepted';  // tentative — caller checks output

  if (exit_code === 124)               return 'Time Limit Exceeded';
  if (exit_code === 137 || signal === 9)  return 'Memory / Time Limit Exceeded';
  if (exit_code === 139 || signal === 11) return 'Runtime Error (SIGSEGV)';

  // Non-zero exit without a signal usually means a runtime or compile error
  if (error && error.trim().length > 0) {
    // Heuristic: compile errors typically appear before any output
    const looksLikeCompile = /error:|undefined reference|cannot|fatal/i.test(error);
    return looksLikeCompile ? 'Compilation Error' : 'Runtime Error';
  }

  return status === 'error' ? 'Runtime Error' : 'Accepted';
}

// ── Submit one test case to onlinecompiler.io (sync endpoint) ─────────────────
/*
  Uses POST /api/run-code-sync/ which blocks until execution finishes
  (up to 30 s). Perfect for our use-case — no polling needed.

  Request:
    Authorization: <key>        (no "Bearer" prefix — docs confirmed)
    Content-Type:  application/json
    Body: { compiler, code, input }

  Response 200: { output, error, status, exit_code, signal, time, total, memory }
*/
async function runOnTestCase(code, compiler, input) {
  const response = await axios.post(
    `${OC_BASE_URL}/api/run-code-sync/`,
    {
      compiler,
      code,
      input: input || '',
    },
    {
      headers: {
        'Authorization': OC_KEY,
        'Content-Type':  'application/json',
      },
      timeout: 35_000,   // 35 s — slightly above their 30 s limit
    }
  );
  return response.data;
}

// ── POST /api/run ─────────────────────────────────────────────────────────────
/*
  Request body (unchanged — same shape as before so the frontend works as-is):
  {
    code:     string,
    language: 'cpp' | 'c' | 'java' | 'python',
    tests:    [{ input: string, expectedOutput: string }]
  }

  Response (same shape as before):
  [
    {
      id:       number,
      passed:   boolean,
      status:   string,   // e.g. "Accepted", "Wrong Answer", "Runtime Error"
      stdout:   string,
      stderr:   string,
      expected: string,
      time:     string,   // e.g. "0.03s"
      memory:   string,   // e.g. "8192 KB"
    },
    ...
  ]
*/
router.post('/', async (req, res) => {
  const { code, language, tests } = req.body;

  // ── Validation ──────────────────────────────────────────────────────────
  if (!code)
    return res.status(400).json({ error: 'code is required' });
  if (!language)
    return res.status(400).json({ error: 'language is required' });
  if (!Array.isArray(tests) || tests.length === 0)
    return res.status(400).json({ error: 'tests array is required' });

  const compiler = COMPILER_MAP[language];
  if (!compiler)
    return res.status(400).json({ error: `Unsupported language: ${language}` });

  if (!OC_KEY) {
    return res.status(503).json({
      error: 'OC_KEY not configured. Add OC_KEY=<your_key> to server/.env and restart.',
    });
  }

  // ── Run all test cases concurrently ────────────────────────────────────
  try {
    const results = await Promise.all(
      tests.map(async (tc, i) => {
        try {
          console.log(`[OC] Test ${i + 1} — compiler: ${compiler}`);

          const apiResp = await runOnTestCase(code, compiler, tc.input);
          const stdout   = apiResp.output ?? '';
          const stderr   = apiResp.error  ?? '';
          const expected = tc.expectedOutput ?? '';

          /*
            "Accepted" means:
              1. No runtime/compile error   (exit_code === 0)
              2. stdout (trimmed) matches expectedOutput (trimmed)
            If expectedOutput is empty (custom test with no expected output),
            we mark it passed as long as exit_code is 0.
          */
          const exitOk   = apiResp.exit_code === 0;
          const outputOk = expected.trim() === ''
            ? true 
            : stdout.trim() === expected.trim();
          const passed   = exitOk && outputOk;

          const statusStr = passed
            ? 'Accepted'
            : exitOk
              ? 'Wrong Answer'
              : resolveStatus(apiResp);

          return {
            id:       i + 1,
            passed,
            status:   statusStr,
            stdout,
            stderr,
            expected,
            time:     apiResp.time   ? `${apiResp.time}s`   : null,
            memory:   apiResp.memory ? `${apiResp.memory} KB` : null,
          };

        } catch (err) {
          // Per-test error (network, timeout, etc.) — don't abort the batch
          console.error(`[OC] Test ${i + 1} failed:`, err.message);
          const msg = err.response?.data
            ? JSON.stringify(err.response.data)
            : err.message;
          return {
            id:     i + 1,
            passed: false,
            status: 'Error',
            stdout: '',
            stderr: msg,
            expected: tc.expectedOutput ?? '',
          };
        }
      })
    );

    res.json(results);

  } catch (err) {
    console.error('[run route]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;