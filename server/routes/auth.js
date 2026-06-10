import { Router } from 'express';
import axios from 'axios';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';

const router = Router();

// ── POST /api/auth/sync ───────────────────────────────────────────────────────
// Syncs a user's Codeforces handle:
// 1. Updates their handle in the users table
// 2. Fetches their accepted submissions from Codeforces
// 3. Upserts them into user_solved_problems
router.post('/sync', async (req, res) => {
  const { userId, handle } = req.body;

  if (!userId || !handle) {
    return res.status(400).json({ error: 'userId and handle are required.' });
  }

  try {
    // 1. Update user handle in DB
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ cf_handle: handle })
      .eq('id', userId);

    if (userError) {
      console.error('[auth/sync] Update handle error:', userError);
      return res.status(500).json({ error: 'Failed to update user handle.' });
    }

    // 2. Fetch accepted submissions from CF
    const cfUrl = `https://codeforces.com/api/user.status?handle=${handle}`;
    const { data } = await axios.get(cfUrl, { timeout: 15_000 });

    if (data.status !== 'OK') {
      return res.status(502).json({ error: 'Failed to fetch from Codeforces' });
    }

    const submissions = data.result;
    
    // Filter for accepted submissions
    const accepted = submissions.filter(s => s.verdict === 'OK');
    
    // Keep track of unique problems solved (contest_id + index)
    // to avoid inserting multiple times if solved multiple times.
    const solvedSet = new Map();
    
    accepted.forEach(sub => {
      if (sub.problem.contestId && sub.problem.index) {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        // Store only the earliest or latest solve? 
        // We'll just store one instance of them solving it.
        if (!solvedSet.has(key)) {
          solvedSet.set(key, {
            user_id: userId,
            contest_id: sub.problem.contestId,
            problem_index: sub.problem.index,
            solved_at: new Date(sub.creationTimeSeconds * 1000).toISOString()
          });
        }
      }
    });

    const rowsToInsert = Array.from(solvedSet.values());

    // 3. Upsert into user_solved_problems
    if (rowsToInsert.length > 0) {
      // Chunking if necessary, but Supabase can handle a few thousand rows at once
      const { error: insertError } = await supabaseAdmin
        .from('user_solved_problems')
        .upsert(rowsToInsert, { onConflict: 'user_id, contest_id, problem_index' });

      if (insertError) {
        console.error('[auth/sync] Insert solved problems error:', insertError);
        return res.status(500).json({ error: 'Failed to save solved problems.' });
      }
    }

    // Update user_activity for practice consistency?
    // According to the doc: App activity is "User login dates, Problem solve dates"
    // The initial CF sync could populate the user_activity table if desired, 
    // but the MVP doc says "App Activity" is "Data collected internally: User login dates, Problem solve dates, Session activity"
    // We will just do CF sync here.

    res.json({ success: true, count: rowsToInsert.length });
  } catch (err) {
    console.error('[auth/sync]', err.response?.data || err.message);
    const cfError = err.response?.data?.comment || err.message;
    res.status(500).json({ error: `Sync failed: ${cfError}` });
  }
});

export default router;
