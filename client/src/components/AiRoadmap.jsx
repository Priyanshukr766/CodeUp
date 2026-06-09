import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Target, ArrowRight } from 'lucide-react';

export default function AiRoadmap({ data }) {
  const [targetRating, setTargetRating] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRoadmap = async () => {
    if (!targetRating.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const metrics = {
        most_solved_rating: data.difficultyDistribution.mostSolvedDifficulty,
        top_tags: data.strengths,
        weak_tags: data.weaknesses
      };

      const res = await axios.post('/api/ai/roadmap', {
        metrics,
        targetRating: parseInt(targetRating, 10)
      });
      
      setRoadmap(res.data.roadmap);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-test" style={{ padding: '24px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        {/* <Target size={18} color="var(--text-primary)" /> */}
        <h3 className="samples-title" style={{ margin: 0, color: 'var(--text-primary)' }}>Goal-Based Roadmap</h3>
      </div>
      
      <div className="search-form" style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <div className="search-input-wrap">
          <input 
            type="number" 
            className="search-input" 
            placeholder="Target Codeforces Rating (e.g. 1600)"
            value={targetRating}
            onChange={(e) => setTargetRating(e.target.value)}
            disabled={loading}
            style={{ padding: '10px 14px', borderRadius: '8px', background: 'transparent' }}
          />
        </div>
        <button 
          className="search-btn" 
          onClick={generateRoadmap}
          disabled={loading || !targetRating.trim()}
          style={{ width: 'auto', padding: '0 16px', background: 'var(--text-primary)', color: 'var(--bg-base)', borderRadius: '8px', height: '40px' }}
        >
          {loading ? 'Generating...' : <><span style={{ fontWeight: '600' }}>Generate</span> <ArrowRight size={16} /></>}
        </button>
      </div>

      {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

      {roadmap && (
        <div style={{ 
          background: 'transparent', 
          padding: '24px', 
          borderRadius: '12px',
          border: '1px solid var(--border)' 
        }}>
          <div className="ai-markdown">
            <ReactMarkdown>{roadmap}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
