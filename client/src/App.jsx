import { useState, useCallback, useRef } from 'react';
import Split from 'react-split';
import SearchBar from './components/SearchBar';
import ProblemStatement from './components/ProblemStatement';
import EditorPanel from './components/EditorPanel';
import ContestTabs from './components/ContestTabs';
import ContestTimer from './components/ContestTimer';
import Login from './components/Login';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { useAuth } from './contexts/AuthContext';
import { fetchProblem, runCode, fetchContest } from './utils/api';
import { Terminal } from 'lucide-react';

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, type }) {
  return <div className={`toast ${type}`}>{message}</div>;
}

// ── Regex helpers for input classification ────────────────────────────────────
// Matches pure contest URLs:  .../contest/1984  (no /problem/ suffix)
const CONTEST_URL_RE = /codeforces\.com\/contest\/(\d+)\/?$/i;
// Matches a bare number like "1984" (only digits, no letters)
const BARE_ID_RE     = /^\d+$/;

export default function App() {
  // ── Single-problem state ────────────────────────────────────────────────
  const [problem,    setProblem]    = useState(null);
  const [fetching,   setFetching]   = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [running,    setRunning]    = useState(false);
  const [results,    setResults]    = useState(null);
  const [toast,      setToast]      = useState(null);
  const toastTimer = useRef(null);
  const [viewMode,   setViewMode]   = useState('practice'); // 'practice' | 'analytics'
  const { user, dbUser, loading: authLoading, logout } = useAuth();

  // ── Contest state ───────────────────────────────────────────────────────
  // contestMode: null  |  { id, name, phase, startTimeSeconds, durationSeconds, problems }
  const [contestMode,        setContestMode]        = useState(null);
  const [activeProblemIndex, setActiveProblemIndex] = useState(null);
  // problemCache[index] = { details: {...}, code: "...", language: "cpp", results: [...] }
  const [problemCache,       setProblemCache]       = useState({});

  // ── Ref to read current editor state before saving (see handleTabSwitch) ─
  // EditorPanel exposes its current code/language via an imperative handle.
  // Instead of a ref we keep a lightweight shadow in the cache and update it
  // through the onStateChange callback passed down to EditorPanel.
  const editorStateRef = useRef({ code: '', language: 'cpp' });

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // Single-problem fetch (existing flow)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleProblemFetch = useCallback(async (token) => {
    setFetching(true);
    setFetchError(null);
    setProblem(null);
    setResults(null);
    setContestMode(null);       // leave contest mode
    setActiveProblemIndex(null);
    setProblemCache({});

    try {
      const data = await fetchProblem(token);
      setProblem(data);
      showToast(`✓ Loaded: ${data.name}`, 'success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setFetchError(msg);
      showToast(`✗ ${msg}`, 'error');
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Contest fetch + first-problem auto-load
  // ═══════════════════════════════════════════════════════════════════════════
  const handleContestFetch = useCallback(async (contestId) => {
    setFetching(true);
    setFetchError(null);
    setProblem(null);
    setResults(null);
    setContestMode(null);
    setActiveProblemIndex(null);
    setProblemCache({});

    try {
      const contestData = await fetchContest(contestId);
      setContestMode(contestData);
      showToast(`✓ Contest: ${contestData.name}`, 'success');

      // Auto-load first problem (Problem A)
      if (contestData.problems.length > 0) {
        const firstIndex = contestData.problems[0].index;
        // Load its details directly (no existing cache yet)
        await _loadProblemIntoCache(contestId, firstIndex, {});
        setActiveProblemIndex(firstIndex);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load contest';
      setFetchError(msg);
      showToast(`✗ ${msg}`, 'error');
    } finally {
      setFetching(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  // ── Internal: fetch a single problem and store it in the cache ────────────
  // Returns the updated cache object.
  async function _loadProblemIntoCache(contestId, index, currentCache) {
    const token = `${contestId}${index}`;
    const details = await fetchProblem(token);
    const updated = {
      ...currentCache,
      [index]: {
        details,
        code:     currentCache[index]?.code     ?? '',
        language: currentCache[index]?.language ?? 'cpp',
        results:  currentCache[index]?.results  ?? null,
      },
    };
    setProblemCache(updated);
    return updated;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Tab switching with save → load → hydrate
  // ═══════════════════════════════════════════════════════════════════════════
  const handleTabSwitch = useCallback(async (newIndex) => {
    if (!contestMode || newIndex === activeProblemIndex) return;

    // 1. Save current editor state into the cache for the problem we're leaving
    setProblemCache(prev => {
      if (!activeProblemIndex) return prev;
      return {
        ...prev,
        [activeProblemIndex]: {
          ...prev[activeProblemIndex],
          code:     editorStateRef.current.code,
          language: editorStateRef.current.language,
          results:  results,
        },
      };
    });

    // 2. Switch the active tab immediately so the UI responds
    setActiveProblemIndex(newIndex);
    setResults(null);

    // 3. Load problem details if not already cached
    setProblemCache(prev => {
      if (prev[newIndex]?.details) return prev; // already loaded, no-op
      // Kick off async load — we return prev unchanged here and update
      // via the async path below
      return prev;
    });

    // Check if we need to fetch
    setProblemCache(prev => {
      if (!prev[newIndex]?.details) {
        // Async load
        setFetching(true);
        _loadProblemIntoCache(contestMode.id, newIndex, prev)
          .catch(err => {
            showToast(`✗ Failed to load problem ${newIndex}: ${err.message}`, 'error');
          })
          .finally(() => setFetching(false));
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestMode, activeProblemIndex, results, showToast]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SearchBar dispatcher — classify input as contest or problem
  // ═══════════════════════════════════════════════════════════════════════════
  const handleFetch = useCallback((token) => {
    const trimmed = token.trim();

    // Pure contest URL: https://codeforces.com/contest/1984
    const urlMatch = trimmed.match(CONTEST_URL_RE);
    if (urlMatch) {
      return handleContestFetch(urlMatch[1]);
    }

    // Bare number: "1984" (no letter suffix → treat as contest)
    if (BARE_ID_RE.test(trimmed)) {
      return handleContestFetch(trimmed);
    }

    // Everything else → individual problem
    return handleProblemFetch(trimmed);
  }, [handleContestFetch, handleProblemFetch]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Run code
  // ═══════════════════════════════════════════════════════════════════════════
  const handleRun = useCallback(async ({ code, language, tests }) => {
    if (!tests.length) return;
    setRunning(true);
    setResults(null);

    try {
      const data = await runCode({ code, language, tests });
      setResults(data);
      const passed = data.filter(r => r.passed).length;
      const total  = data.length;
      if (passed === total) {
        showToast(`✓ All ${total} test(s) passed!`, 'success');
      } else {
        showToast(`✗ ${passed}/${total} passed`, 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Run failed';
      showToast(`✗ ${msg}`, 'error');
    } finally {
      setRunning(false);
    }
  }, [showToast]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Derive active problem for rendering
  // ═══════════════════════════════════════════════════════════════════════════
  // In contest mode the active problem comes from the cache; otherwise use state.
  const activeCached  = contestMode && activeProblemIndex
    ? problemCache[activeProblemIndex]
    : null;
  const displayProblem = contestMode ? (activeCached?.details ?? null) : problem;

  // Callback so EditorPanel can report its current code/language to us
  const handleEditorStateChange = useCallback(({ code, language }) => {
    editorStateRef.current = { code, language };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  // Show login/onboarding if not fully authenticated and synced
  if (authLoading) {
    return (
      <div className="welcome-state">
        <div className="loader-wrap">
          <div className="skeleton title"></div>
          <div className="skeleton line"></div>
        </div>
      </div>
    );
  }

  if (!user || !dbUser?.cf_handle) {
    return <Login />;
  }

  return (
    <div className="app">
      {/* ── Top Bar ────────────────────────────────────────────────────── */}
      <header className="topbar">
        <a className="topbar-logo" href="/" aria-label="CodeUp Home">
          <Terminal size={28} color="var(--text-primary)" />
          <span className="topbar-logo-text">CodeUp</span>
        </a>

        <div className="topbar-divider" />

        <SearchBar onFetch={handleFetch} loading={fetching} />

        {/* Contest timer — only visible in contest mode */}
        {contestMode && (
          <ContestTimer
            startTimeSeconds={contestMode.startTimeSeconds}
            durationSeconds={contestMode.durationSeconds}
            phase={contestMode.phase}
          />
        )}

        {/* CF link for single-problem mode */}
        {!contestMode && problem && (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            style={{ marginLeft: 'auto', flexShrink: 0, textDecoration: 'none' }}
            title="Open on Codeforces"
            onClick={(e) => {
              if (editorStateRef.current?.code) {
                navigator.clipboard.writeText(editorStateRef.current.code);
                showToast('Code copied to clipboard!', 'success');
              }
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Codeforces
          </a>
        )}

        {/* View Toggle & Logout */}
        <div style={{ display: 'flex', gap: 12, marginLeft: !contestMode && problem ? '16px' : 'auto' }}>
          <button 
            className={`icon-btn ${viewMode === 'practice' ? 'active' : ''}`}
            onClick={() => setViewMode('practice')}
          >
            Practice
          </button>
          <button 
            className={`icon-btn ${viewMode === 'analytics' ? 'active' : ''}`}
            onClick={() => setViewMode('analytics')}
          >
            AI Coach
          </button>
          <button className="icon-btn" onClick={logout} title="Sign Out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      {viewMode === 'analytics' ? (
        <AnalyticsDashboard />
      ) : (
        <>
          {/* ── Contest Tab Bar — shown below topbar when in contest mode ─── */}
          {contestMode && (
            <ContestTabs
              problems={contestMode.problems}
              activeIndex={activeProblemIndex}
              onSelectProblem={handleTabSwitch}
            />
          )}

          {/* ── Split Workspace ─────────────────────────────────────────────── */}
          <Split
            className="split-container"
            sizes={[45, 55]}
            minSize={[280, 360]}
            gutterSize={5}
            snapOffset={20}
            direction="horizontal"
            style={{ display: 'flex', flex: 1, overflow: 'hidden' }}
          >
        {/* LEFT: Problem Statement */}
        <div className="panel problem-panel">
          <div className="panel-header">
            <span className="panel-header-title">
              {contestMode
                ? (contestMode.name)
                : (displayProblem ? displayProblem.group : 'Problem')}
            </span>
            {!contestMode && displayProblem?.url && (
              <span className="text-muted">
                {new URL(displayProblem.url).pathname.split('/').filter(Boolean).slice(-2).join('/')}
              </span>
            )}
          </div>
          <div className="problem-scroll">
            <ProblemStatement
              problem={displayProblem}
              loading={fetching}
              error={fetchError}
              onExampleClick={handleFetch}
            />
          </div>
        </div>

        {/* RIGHT: Editor */}
        <EditorPanel
          problemUrl={displayProblem?.url}
          sampleTests={displayProblem?.tests}
          onRun={handleRun}
          running={running}
          results={results}
          // Contest-mode hydration props
          initialCode={activeCached?.code     ?? undefined}
          initialLang={activeCached?.language ?? undefined}
          onStateChange={handleEditorStateChange}
        />
      </Split>
        </>
      )}

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}