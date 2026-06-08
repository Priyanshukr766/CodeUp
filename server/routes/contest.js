import { Router } from 'express';
import axios from 'axios';

const router = Router();

// ── GET /api/contest/:id ──────────────────────────────────────────────────────
// Strategy: CF's contest.standings returns 400 for many contests (requires auth).
// Instead we combine two public endpoints:
//   1. contest.list  → contest name, phase, startTime, duration
//   2. problemset.problems → problem list filtered by contestId
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Contest ID must be a positive integer.' });
  }

  const numId = Number(id);

  try {
    // ── Fetch both in parallel ─────────────────────────────────────────────
    const [contestListResp, problemsResp] = await Promise.all([
      axios.get('https://codeforces.com/api/contest.list', { timeout: 10_000 }),
      axios.get('https://codeforces.com/api/problemset.problems', { timeout: 15_000 }),
    ]);

    if (contestListResp.data.status !== 'OK') {
      return res.status(502).json({ error: 'Codeforces contest.list API failed.' });
    }
    if (problemsResp.data.status !== 'OK') {
      return res.status(502).json({ error: 'Codeforces problemset.problems API failed.' });
    }

    // ── Find the contest in the list ───────────────────────────────────────
    const contest = contestListResp.data.result.find(c => c.id === numId);
    if (!contest) {
      return res.status(404).json({ error: `Contest ${id} not found.` });
    }

    // ── Filter problems belonging to this contest, sort by index ──────────
    const allProblems = problemsResp.data.result.problems;
    const problems = allProblems
      .filter(p => p.contestId === numId)
      .sort((a, b) => a.index.localeCompare(b.index))
      .map(p => ({ index: p.index, name: p.name }));

    if (problems.length === 0) {
      return res.status(404).json({
        error: `No problems found for contest ${id}. It may not have started yet.`,
      });
    }

    res.json({
      id:                  String(id),
      name:                contest.name,
      phase:               contest.phase,              // "BEFORE" | "CODING" | "FINISHED"
      startTimeSeconds:    contest.startTimeSeconds,
      durationSeconds:     contest.durationSeconds,
      relativeTimeSeconds: contest.relativeTimeSeconds ?? null,
      problems,
    });

  } catch (err) {
    console.error('[contest route]', err.message);
    const msg = err.response?.data?.comment || err.message || 'Failed to reach Codeforces API';
    res.status(500).json({ error: msg });
  }
});

export default router;
