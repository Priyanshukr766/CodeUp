import { Router } from 'express';
import axios from 'axios';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';

const router = Router();

// ── POST /api/sync/problems ───────────────────────────────────────────────────
// Fetches all problems from Codeforces problemset and caches their metadata 
// (rating, tags, name) into cf_problems. Should be run periodically.
router.post('/problems', async (req, res) => {
  try {
    const { data } = await axios.get('https://codeforces.com/api/problemset.problems', { timeout: 20_000 });

    if (data.status !== 'OK') {
      return res.status(502).json({ error: 'Failed to fetch from Codeforces' });
    }

    const problems = data.result.problems;
    
    // Map to DB schema
    const rows = problems
      .filter(p => p.contestId && p.index && p.name)
      .map(p => ({
        contest_id: p.contestId,
        problem_index: p.index,
        problem_name: p.name,
        rating: p.rating || null,
        tags: p.tags || []
      }));

    console.log(`[sync] Preparing to upsert ${rows.length} problems...`);

    // Upsert in batches of 1000 to avoid request size limits
    const BATCH_SIZE = 1000;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabaseAdmin
        .from('cf_problems')
        .upsert(batch, { onConflict: 'contest_id, problem_index' });
        
      if (error) {
        console.error(`[sync] Batch upsert error at index ${i}:`, error);
        return res.status(500).json({ error: 'Database upsert failed' });
      }
    }

    console.log(`[sync] Successfully synced ${rows.length} problems.`);
    res.json({ success: true, count: rows.length });

  } catch (err) {
    console.error('[sync route]', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
