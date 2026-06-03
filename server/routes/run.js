import { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// ── Judge0 language IDs ───────────────────────────────────────────────────────
const LANGUAGE_IDS = {
  cpp:    54,  // C++ (GCC 9.2.0)  — C++17
  c:      50,  // C (GCC 9.2.0)
  java:   62,  // Java (OpenJDK 13.0.1)
  python: 71,  // Python (3.8.1)
};

const JUDGE0_URL = (process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com').replace(/\/$/, '');
const JUDGE0_KEY = process.env.JUDGE0_KEY || '';

const judge0Headers = {
  'content-type':    'application/json',
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  'X-RapidAPI-Key':  JUDGE0_KEY,
};

// ── Submit a single test case to Judge0 and poll until done ──────────────────
async function submitAndWait(code, language, input) {
  const langId = LANGUAGE_IDS[language];
  if (!langId) throw new Error(`Unsupported language: ${language}`);

  // Submit
  console.log(`[Judge0] Calling API for language: ${language}`);
  // API IS FIRED HERE
  const submitRes = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
    {
      language_id:    langId,
      source_code:    Buffer.from(code).toString('base64'),
      stdin:          Buffer.from(input || '').toString('base64'),
    },
    { headers: judge0Headers, timeout: 10_000 }
  );

  const token = submitRes.data.token;
  if (!token) throw new Error('Judge0 did not return a submission token');

  // Poll until status is not "In Queue" (1) or "Processing" (2)
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 800));
    const pollRes = await axios.get(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
      { headers: judge0Headers, timeout: 8_000 }
    );
    const s = pollRes.data;
    if (s.status.id > 2) {
      // Decode base64 fields
      const decode = b64 => b64 ? Buffer.from(b64, 'base64').toString('utf-8') : '';
      return {
        statusId:    s.status.id,
        statusDesc:  s.status.description,
        stdout:      decode(s.stdout),
        stderr:      decode(s.stderr) || decode(s.compile_output),
        time:        s.time   ? `${s.time}s`  : null,
        memory:      s.memory ? `${s.memory} KB` : null,
      };
    }
  }
  throw new Error('Submission timed out waiting for Judge0');
}

// ── POST /api/run ─────────────────────────────────────────────────────────────
// Body: { code, language, tests: [{ input, expectedOutput }] }
router.post('/', async (req, res) => {
  const { code, language, tests } = req.body;

  if (!code)     return res.status(400).json({ error: 'code is required' });
  if (!language) return res.status(400).json({ error: 'language is required' });
  if (!Array.isArray(tests) || tests.length === 0)
    return res.status(400).json({ error: 'tests array is required' });

  if (!JUDGE0_KEY || JUDGE0_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
    return res.status(503).json({
      error: 'Judge0 API key not configured. Set JUDGE0_KEY in server/.env',
    });
  }

  try {
    // Run all test cases concurrently (Judge0 free tier allows this)
    const results = await Promise.all(
      tests.map(async (tc, i) => {
        try {
          const result = await submitAndWait(code, language, tc.input);
          const expected = (tc.expectedOutput || '').trim();
          const received = result.stdout.trim();
          const passed   = result.statusId === 3 && received === expected;

          return {
            id:       i + 1,
            passed,
            status:   passed ? 'Accepted' : result.statusDesc,
            stdout:   result.stdout,
            stderr:   result.stderr,
            expected: tc.expectedOutput,
            time:     result.time,
            memory:   result.memory,
          };
        } catch (err) {
          return {
            id:     i + 1,
            passed: false,
            status: 'Error',
            stderr: err.message,
            expected: tc.expectedOutput,
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
