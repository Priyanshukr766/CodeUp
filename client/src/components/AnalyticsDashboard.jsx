import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import AiSkillGap from './AiSkillGap';
import AiRoadmap from './AiRoadmap';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { LayoutDashboard, Calendar, Activity, BarChart2, TrendingUp, Target } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { dbUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dbUser || !dbUser.cf_handle) return;

    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`/api/analytics/${dbUser.cf_handle}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dbUser]);

  if (loading) {
    return (
      <div className="welcome-state">
        <div className="loader-wrap">
          <div className="skeleton title"></div>
          <div className="skeleton badges"></div>
          <div className="skeleton line short"></div>
          <div className="skeleton line long"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-state-icon">❌</div>
        <h3>Analytics Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // Prepare data for recharts
  const difficultyData = Object.entries(data.difficultyDistribution.histogram).map(([rating, count]) => ({
    rating,
    count
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const customTooltipStyle = {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '12px'
  };

  return (
    <div style={{ padding: '32px 40px', color: 'var(--text-primary)', overflowY: 'auto', height: '100%', backgroundColor: 'var(--bg-base)' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LayoutDashboard size={28} color="var(--text-primary)" />
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>AI Coach Dashboard</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{data.handle}</span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Rating: {data.currentRating}</span>
        </div>
      </motion.div>
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Row: Consistency & Report */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          <motion.div variants={itemVariants} className="custom-test" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Calendar size={18} color="var(--text-secondary)" />
              <h3 className="samples-title" style={{ margin: 0 }}>Practice Consistency</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '80px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>{data.practiceConsistency.weeklySolves}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>This Week</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>{data.practiceConsistency.monthlySolves}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>This Month</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>{data.practiceConsistency.totalSolves}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="custom-test" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Activity size={18} color="var(--text-secondary)" />
              <h3 className="samples-title" style={{ margin: 0 }}>Overview</h3>
            </div>
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Strengths</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.strengths.map(s => (
                    <li key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-primary)' }}></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Areas to Improve</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.weaknesses.map(w => (
                    <li key={w} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Middle Row: Distributions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          <motion.div variants={itemVariants} className="custom-test" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <BarChart2 size={18} color="var(--text-secondary)" />
              <h3 className="samples-title" style={{ margin: 0 }}>Skill Distribution</h3>
            </div>
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.skillDistribution} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="tag" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={100} />
                  <Tooltip cursor={{ fill: 'var(--bg-overlay)' }} contentStyle={customTooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                    {data.skillDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="var(--text-primary)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="custom-test" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <TrendingUp size={18} color="var(--text-secondary)" />
              <h3 className="samples-title" style={{ margin: 0 }}>Difficulty Distribution</h3>
            </div>
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={difficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--text-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--text-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="var(--text-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Most Solved: <strong style={{ color: 'var(--text-primary)' }}>{data.difficultyDistribution.mostSolvedDifficulty}</strong></span>
              <span>Highest: <strong style={{ color: 'var(--text-primary)' }}>{data.difficultyDistribution.highestSolvedDifficulty}</strong></span>
            </div>
          </motion.div>
        </div>

        {/* AI Components */}
        <motion.div variants={itemVariants}>
          <AiSkillGap data={data} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <AiRoadmap data={data} />
        </motion.div>

        {/* Recommendations */}
        <motion.div variants={itemVariants} className="custom-test" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <h3 className="samples-title" style={{ margin: 0 }}>Recommended Next Problems</h3>
          </div>
          {data.recommendations.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '13px' }}>No recommendations available at the moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.recommendations.map(r => (
                <div key={`${r.contestId}${r.index}`} style={{ background: 'var(--bg-overlay)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', transition: 'border-color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600' }}>{r.name} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({r.contestId}{r.index})</span></h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.reason}</div>
                    </div>
                    <span className="rating-badge gray" style={{ border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)' }}>{r.rating}</span>
                  </div>
                  <div className="tags-row" style={{ marginTop: '12px', marginBottom: 0 }}>
                    {r.tags.map(t => <span key={t} className="tag-chip" style={{ background: 'transparent' }}>{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}
