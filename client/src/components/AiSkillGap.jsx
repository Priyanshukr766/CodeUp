import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

export default function AiSkillGap({ data }) {
  const { dbUser } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data) return;

    const fetchAnalysis = async () => {
      try {
        const metrics = {
          most_solved_rating: data.difficultyDistribution.mostSolvedDifficulty,
          highest_solved_rating: data.difficultyDistribution.highestSolvedDifficulty,
          top_tags: data.strengths,
          weak_tags: data.weaknesses,
          weekly_solves: data.practiceConsistency.weeklySolves
        };

        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await axios.post('/api/ai/skill-gap', 
          { metrics },
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        setAnalysis(res.data.analysis);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [data]);

  return (
    <div className="custom-test" style={{ padding: '24px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Sparkles size={18} color="var(--text-primary)" />
        <h3 className="samples-title" style={{ margin: 0, color: 'var(--text-primary)' }}>AI Skill Gap Analysis</h3>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton line long"></div>
          <div className="skeleton line"></div>
          <div className="skeleton line short"></div>
        </div>
      ) : error ? (
        <p style={{ color: 'var(--danger)', fontSize: '13px' }}>Failed to load AI analysis: {error}</p>
      ) : (
        <div className="ai-markdown">
          {analysis.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
}
