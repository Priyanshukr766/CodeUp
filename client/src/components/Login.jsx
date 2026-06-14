import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Terminal, Link, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { user, dbUser, loginWithGoogle, syncCodeforcesHandle, loading } = useAuth();
  const [handle, setHandle] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const bgStyle = {
    height: '100%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '20px',
    backgroundImage: 'url(/loginBg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 0
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 size={32} color="var(--text-secondary)" />
        </motion.div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div style={bgStyle}>
        <div style={overlayStyle}></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ 
            background: 'rgba(5, 5, 5, 0.7)', 
            backdropFilter: 'blur(32px)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 55%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse at center, black 55%, transparent 100%)',
            padding: '80px 40px', 
            border: 'none',
            width: '100%',
            maxWidth: '520px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <Terminal size={28} color="var(--text-primary)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Welcome to CodeUp</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>Log in to access your personalized AI Coach, practice analytics, and intelligent problem tracking.</p>
          
          <button 
            onClick={loginWithGoogle}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
              width: '100%', padding: '14px', borderRadius: '8px', 
              background: 'var(--text-primary)', color: 'var(--bg-base)', 
              border: 'none', fontSize: '15px', fontWeight: '600', 
              cursor: 'pointer', transition: 'transform 0.1s, opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img src="/googleIcon.png" alt="Google" style={{ width: '18px', height: '18px' }} />
            Continue with Google
          </button>
        </motion.div>

        <div style={{ position: 'absolute', bottom: '24px', width: '100%', textAlign: 'center', zIndex: 1, color: 'rgba(255,255,255,0.6)', fontSize: '12px', padding: '0 20px', lineHeight: '1.5' }}>
          CodeUp is an independent educational project, not affiliated with Codeforces.<br />
          It is built for learning purposes, and problem data is sourced from 
          Codeforces for personal practice, cached temporarily— not 
          permanently stored.
        </div>
      </div>
    );
  }

  // Logged in, but no Codeforces handle
  if (user && dbUser && !dbUser.cf_handle) {
    const handleSync = async () => {
      if (!handle.trim()) return;
      setSyncing(true);
      setError(null);
      
      const { error: syncErr } = await syncCodeforcesHandle(handle.trim());
      if (syncErr) {
        setError(syncErr);
      }
      setSyncing(false);
    };

    return (
      <div style={bgStyle}>
        <div style={overlayStyle}></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ 
            background: 'rgba(5, 5, 5, 0.7)', 
            backdropFilter: 'blur(32px)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse at center, black 60%, transparent 100%)',
            padding: '80px 40px', 
            border: 'none',
            width: '100%',
            maxWidth: '520px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <Link size={24} color="var(--text-primary)" />
            </div>
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: 'var(--text-primary)', textAlign: 'center', letterSpacing: '-0.5px' }}>Link Codeforces</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center', lineHeight: '1.6' }}>Please enter your Codeforces handle to synchronize your problem history and activate the AI Coach.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="e.g. tourist"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSync()}
                disabled={syncing}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
            
            <button 
              onClick={handleSync}
              disabled={syncing || !handle.trim()}
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                width: '100%', padding: '14px', borderRadius: '8px', 
                background: 'var(--text-primary)', color: 'var(--bg-base)', 
                border: 'none', fontSize: '15px', fontWeight: '600', 
                cursor: (syncing || !handle.trim()) ? 'not-allowed' : 'pointer', 
                opacity: (syncing || !handle.trim()) ? 0.5 : 1,
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => { if (!syncing && handle.trim()) e.currentTarget.style.transform = 'scale(0.98)' }}
              onMouseUp={(e) => { if (!syncing && handle.trim()) e.currentTarget.style.transform = 'scale(1)' }}
            >
              {syncing ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 size={18} /></motion.div> Syncing...</>
              ) : (
                <>Connect Account <ArrowRight size={18} /></>
              )}
            </button>
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '16px', textAlign: 'center', background: 'var(--danger-bg)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,123,114,0.2)' }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        <div style={{ position: 'absolute', bottom: '24px', width: '100%', textAlign: 'center', zIndex: 1, color: 'rgba(255,255,255,0.6)', fontSize: '12px', padding: '0 20px', lineHeight: '1.5' }}>
          CodeUp is an independent educational project, not affiliated with Codeforces.<br />
          Problem data is sourced from Codeforces for personal practice and cached temporarily—not permanently stored.
        </div>
      </div>
    );
  }

  return null;
}
