import { Router } from 'express';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';
import axios from 'axios';

const router = Router();

// ── GET /api/analytics/:handle ────────────────────────────────────────────────
// Aggregates data from user_solved_problems and cf_problems to generate
// 1. Skill Distribution (Top 10 tags)
// 2. Difficulty Distribution
// 3. AI Coach Strengths / Weaknesses / Next Problem Recommendation
router.get('/:handle', async (req, res) => {
  const { handle } = req.params;

  if (!handle) {
    return res.status(400).json({ error: 'Codeforces handle is required.' });
  }

  try {
    // 1. Get user by cf_handle
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('cf_handle', handle)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found or handle not synced.' });
    }

    const { data: solvedRaw, error: solvedError } = await supabaseAdmin
      .from('user_solved_problems')
      .select('contest_id, problem_index, solved_at')
      .eq('user_id', user.id);

    if (solvedError) {
      console.error('[analytics] Error fetching solved problems:', solvedError);
      return res.status(500).json({ error: 'Failed to fetch solved problems.' });
    }

    // Since there's no foreign key between user_solved_problems and cf_problems,
    // we fetch the corresponding cf_problems by getting all unique contest_ids.
    const contestIds = [...new Set(solvedRaw.map(s => s.contest_id))];
    
    let cfProbs = [];
    if (contestIds.length > 0) {
      // Fetch in chunks if there are too many contestIds (PostgREST limit)
      const chunkSize = 200;
      for (let i = 0; i < contestIds.length; i += chunkSize) {
        const chunk = contestIds.slice(i, i + chunkSize);
        const { data: probsChunk, error: cfError } = await supabaseAdmin
          .from('cf_problems')
          .select('contest_id, problem_index, problem_name, rating, tags')
          .in('contest_id', chunk);
          
        if (!cfError && probsChunk) {
          cfProbs = cfProbs.concat(probsChunk);
        }
      }
    }

    const cfProbsMap = new Map();
    cfProbs.forEach(p => cfProbsMap.set(`${p.contest_id}-${p.problem_index}`, p));

    const solved = solvedRaw.map(s => ({
      ...s,
      cf_problems: cfProbsMap.get(`${s.contest_id}-${s.problem_index}`) || null
    }));

    if (solvedError) {
      console.error('[analytics] Error fetching solved problems:', solvedError);
      return res.status(500).json({ error: 'Failed to fetch solved problems.' });
    }

    // Initialize aggregations
    const tagCounts = {};
    const ratingCounts = {
      '800': 0, '900': 0, '1000': 0, '1100': 0, '1200': 0, '1300': 0,
      '1400': 0, '1500': 0, '1600': 0, '1700': 0, '1800': 0, '1900': 0, '2000+': 0
    };

    let highestRating = 0;
    
    // Process each solved problem
    solved.forEach(s => {
      const p = s.cf_problems;
      if (!p) return;

      // Tag distribution
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }

      // Rating distribution
      if (p.rating) {
        if (p.rating > highestRating) highestRating = p.rating;
        
        let bucket = p.rating >= 2000 ? '2000+' : String(p.rating);
        if (ratingCounts[bucket] !== undefined) {
          ratingCounts[bucket]++;
        } else {
          // If rating is odd like 850, we can bucket it down to nearest 100
          const rounded = Math.floor(p.rating / 100) * 100;
          bucket = rounded >= 2000 ? '2000+' : String(rounded);
          ratingCounts[bucket] = (ratingCounts[bucket] || 0) + 1;
        }
      }
    });

    // ── Feature 1: Skill Distribution (Top 10 tags) ──
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
      
    const skillDistribution = sortedTags.slice(0, 10);

    // ── Feature 2: Difficulty Distribution ──
    // Determine most solved difficulty (Comfort rating)
    let mostSolvedRating = '800';
    let maxSolved = -1;
    Object.entries(ratingCounts).forEach(([rating, count]) => {
      if (count > maxSolved && rating !== '2000+') {
        maxSolved = count;
        mostSolvedRating = rating;
      }
    });

    const difficultyDistribution = {
      histogram: ratingCounts,
      mostSolvedDifficulty: mostSolvedRating,
      highestSolvedDifficulty: highestRating
    };

    // ── Feature 4: Strengths & Weaknesses ──
    // Filter out noise: only consider tags with >= 3 solves for weakness
    const validTagsForWeakness = sortedTags.filter(t => t.count >= 3);
    
    const strengths = sortedTags.slice(0, 3).map(t => t.tag);
    // Weaknesses are the bottom 3 from the valid tags list
    const weaknesses = validTagsForWeakness.slice(-3).reverse().map(t => t.tag);

    // ── Feature 5: Personalized Recommendations ──
    // Weakest tag:
    const weakestTag = weaknesses.length > 0 ? weaknesses[0] : (sortedTags.length > 0 ? sortedTags[sortedTags.length - 1].tag : null);
    
    let recommendations = [];
    if (weakestTag) {
      // Comfort rating + 100
      const targetRating = parseInt(mostSolvedRating) + 100;
      
      // We need to fetch unsolved problems with this tag and rating from cf_problems
      // First, get all problems the user has solved
      const solvedIds = new Set(solved.map(s => `${s.contest_id}-${s.problem_index}`));
      
      // Fetch matching problems from cf_problems
      const { data: candidateProbs, error: candidateError } = await supabaseAdmin
        .from('cf_problems')
        .select('*')
        .contains('tags', [weakestTag])
        .eq('rating', targetRating)
        .limit(50);
        
      if (!candidateError && candidateProbs) {
        // Filter out solved ones
        const unsolved = candidateProbs.filter(p => !solvedIds.has(`${p.contest_id}-${p.problem_index}`));
        
        // Take top 5
        recommendations = unsolved.slice(0, 5).map(p => ({
          name: p.problem_name,
          rating: p.rating,
          tags: p.tags,
          contestId: p.contest_id,
          index: p.problem_index,
          reason: `Weak Topic = ${weakestTag}, Rating = ${targetRating}`
        }));
      }
    }

    // Practice Consistency (Mocked here since we don't track full login history natively yet,
    // but we can query user_activity if we implemented it. For MVP, we calculate from solved_at)
    // Real implementation would look at user_activity table.
    // Let's do a basic calculation from solved_at for weekly/monthly solves.
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let weeklySolves = 0;
    let monthlySolves = 0;
    
    solved.forEach(s => {
      const solvedDate = new Date(s.solved_at);
      if (solvedDate >= sevenDaysAgo) weeklySolves++;
      if (solvedDate >= thirtyDaysAgo) monthlySolves++;
    });

    const practiceConsistency = {
      currentStreak: "N/A", // Hard to calculate purely from solved_at reliably without grouping by date, we'll just mock for MVP or calculate it
      weeklySolves,
      monthlySolves,
      totalSolves: solved.length
    };

    let currentRating = "Unrated";
    try {
      const { data: cfData } = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`, { timeout: 5000 });
      if (cfData.status === 'OK' && cfData.result[0].rating) {
        currentRating = cfData.result[0].rating;
      }
    } catch (err) {
      console.warn(`[analytics] Could not fetch CF rating for ${handle}:`, err.message);
    }

    res.json({
      handle,
      currentRating,
      skillDistribution,
      difficultyDistribution,
      strengths,
      weaknesses,
      recommendations,
      practiceConsistency
    });

  } catch (err) {
    console.error('[analytics route]', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
