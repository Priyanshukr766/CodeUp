import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import { supabaseAdmin } from '../utils/supabaseAdmin.js';

const router = Router();

// Initialize the Gemini client using the key from env
// According to the new @google/genai sdk, it picks up GEMINI_API_KEY automatically if not provided,
// but we can pass it explicitly for clarity.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── POST /api/ai/skill-gap ────────────────────────────────────────────────────
// Accepts processed metrics and returns a human-readable skill gap analysis.
router.post('/skill-gap', async (req, res) => {
  const userId = req.user.id;
  const { metrics } = req.body;

  if (!metrics) {
    return res.status(400).json({ error: 'metrics are required.' });
  }

  // Generate a hash of the incoming metrics to detect changes
  const hash = crypto.createHash('sha256').update(JSON.stringify(metrics)).digest('hex');

  try {
    // 1. Check Cache
    const { data: existingRow } = await supabaseAdmin
      .from('recommendation_cache')
      .select('recommendations')
      .eq('user_id', userId)
      .single();

    const cacheData = existingRow?.recommendations || {};

    // If the hash matches and we already generated an analysis, return it instantly!
    if (cacheData.skill_gap_hash === hash && cacheData.skill_gap_analysis) {
      console.log('[ai/skill-gap] Serving from cache');
      return res.json({ analysis: cacheData.skill_gap_analysis });
    }

    console.log('[ai/skill-gap] Metrics changed or no cache. Calling Gemini...');

    const prompt = `
You are an expert competitive programming AI Coach.
Analyze the following user performance metrics and provide a brief, actionable skill gap explanation.
Do not use charts or complex formatting. Output clear, concise paragraphs.
Focus on:
1. Explaining strengths.
2. Explaining weaknesses.
3. Identifying likely skill gaps.
4. Explaining what is limiting their rating growth.

User Metrics:
- Current Target Difficulty/Most Solved Rating: ${metrics.most_solved_rating}
- Highest Solved Rating: ${metrics.highest_solved_rating}
- Top Strengths: ${metrics.top_tags?.join(', ') || 'None'}
- Weak Areas: ${metrics.weak_tags?.join(', ') || 'None'}
- Recent Consistency (Weekly Solves): ${metrics.weekly_solves}

Keep your response under 150 words and be highly encouraging but precise.
`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const analysis = response.text;

    // 3. Update Cache
    const newCacheData = { ...cacheData, skill_gap_hash: hash, skill_gap_analysis: analysis };
    
    await supabaseAdmin.from('recommendation_cache').upsert({
      user_id: userId,
      recommendations: newCacheData,
      generated_at: new Date().toISOString()
    });

    res.json({ analysis });
  } catch (err) {
    console.error('[ai/skill-gap] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate skill gap analysis.' });
  }
});

// ── POST /api/ai/roadmap ──────────────────────────────────────────────────────
// Accepts processed metrics + targetRating and returns a roadmap.
router.post('/roadmap', async (req, res) => {
  const userId = req.user.id;
  const { metrics, targetRating } = req.body;

  if (!metrics || !targetRating) {
    return res.status(400).json({ error: 'metrics, and targetRating are required.' });
  }

  // Include targetRating in the hash because changing the target should generate a new roadmap
  const hashObj = { ...metrics, targetRating };
  const hash = crypto.createHash('sha256').update(JSON.stringify(hashObj)).digest('hex');

  try {
    // 1. Check Cache
    const { data: existingRow } = await supabaseAdmin
      .from('recommendation_cache')
      .select('recommendations')
      .eq('user_id', userId)
      .single();

    const cacheData = existingRow?.recommendations || {};

    if (cacheData.roadmap_hash === hash && cacheData.roadmap_analysis) {
      console.log('[ai/roadmap] Serving from cache');
      return res.json({ roadmap: cacheData.roadmap_analysis });
    }

    console.log('[ai/roadmap] Metrics or target changed. Calling Gemini...');

    const prompt = `
You are an expert competitive programming AI Coach.
Generate a personalized, week-by-week study roadmap for a user trying to reach a Codeforces rating of ${targetRating}.
The user is currently comfortable solving problems around the ${metrics.most_solved_rating} rating level.

User Profile:
- Top Strengths: ${metrics.top_tags?.join(', ') || 'None'}
- Weak Areas: ${metrics.weak_tags?.join(', ') || 'None'}

Please provide a 4-week roadmap using Markdown format. 
Structure the response as follows:
1. Weak topics to focus on.
2. A 4-week progression plan (Week 1, Week 2, etc.), focusing on bridging the gap in their weak areas.
3. Suggested practice direction.

Do not use charts. Use clean Markdown headers and bullet points.
`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const roadmapAnalysis = response.text;

    // 3. Update Cache
    const newCacheData = { ...cacheData, roadmap_hash: hash, roadmap_analysis: roadmapAnalysis };
    
    await supabaseAdmin.from('recommendation_cache').upsert({
      user_id: userId,
      recommendations: newCacheData,
      generated_at: new Date().toISOString()
    });

    res.json({ roadmap: roadmapAnalysis });
  } catch (err) {
    console.error('[ai/roadmap] Error:', err.message);
    res.status(500).json({ error: 'Failed to generate roadmap.' });
  }
});

export default router;
