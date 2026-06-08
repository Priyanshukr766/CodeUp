import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Terminal, Link, LogIn, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { user, dbUser, loginWithGoogle, syncCodeforcesHandle, loading } = useAuth();
  const [handle, setHandle] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

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
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '20px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ 
            background: 'var(--bg-surface)', 
            padding: '40px', 
            borderRadius: '16px', 
            border: '1px solid var(--border)',
            width: '100%',
            maxWidth: '440px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
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
            <LogIn size={18} />
            Continue with Google
          </button>
        </motion.div>
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
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '20px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ 
            background: 'var(--bg-surface)', 
            padding: '40px', 
            borderRadius: '16px', 
            border: '1px solid var(--border)',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
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
      </div>
    );
  }

  return null;
}
