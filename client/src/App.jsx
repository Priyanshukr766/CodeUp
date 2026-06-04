import { useState, useCallback, useRef } from 'react';
import Split from 'react-split';
import SearchBar from './components/SearchBar';
import ProblemStatement from './components/ProblemStatement';
import EditorPanel from './components/EditorPanel';
import { fetchProblem, runCode } from './utils/api';

// ── Toast helper ──────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  return (
    <div className={`toast ${type}`} onAnimationEnd={onDone}>
      {message}
    </div>
  );
}

export default function App() {
  const [problem,    setProblem]    = useState(null);
  const [fetching,   setFetching]   = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [running,    setRunning]    = useState(false);
  const [results,    setResults]    = useState(null);
  const [toast,      setToast]      = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch problem ───────────────────────────────────────────────────────────
  const handleFetch = useCallback(async (token) => {
    setFetching(true);
    setFetchError(null);
    setProblem(null);
    setResults(null);

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

  // ── Run code ────────────────────────────────────────────────────────────────
  const handleRun = useCallback ( async ({ code, language, tests }) => {

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

  return (
    <div className="app">
      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <header className="topbar">
        <a className="topbar-logo" href="/" aria-label="CodeUp Home">
          <img src="/image.png" alt="CodeUp Logo" className="topbar-logo-icon"/>
          <span className="topbar-logo-text">CodeUp</span>
        </a>

        <div className="topbar-divider" />

        <SearchBar onFetch={handleFetch} loading={fetching} />

        {problem && (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            style={{ marginLeft: 'auto', flexShrink: 0, textDecoration: 'none' }}
            title="Open on Codeforces"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Codeforces
          </a>
        )}
      </header>

      {/* ── Split Workspace ───────────────────────────────────────────────── */}
      <Split
        className="split-container"
        sizes={[45, 55]}
        minSize={[280, 360]}
        gutterSize={5}
        snapOffset={20}
        direction="horizontal"
        style={{ display: 'flex', flex: 1, overflow: 'hidden' }}
      >
        {/* ── LEFT: Problem Statement ──────────────────────────────────── */}
        <div className="panel problem-panel">
          <div className="panel-header">
            <span className="panel-header-title">
              {problem ? problem.group : 'Problem'}
            </span>
            {problem?.url && (
              <span className="text-muted">
                {new URL(problem.url).pathname.split('/').filter(Boolean).slice(-2).join('/')}
              </span>
            )}
          </div>
          <div className="problem-scroll">
            <ProblemStatement
              problem={problem}
              loading={fetching}
              error={fetchError}
              onExampleClick={handleFetch}
            />
          </div>
        </div>

        {/* ── RIGHT: Editor ────────────────────────────────────────────── */}
        <EditorPanel
          problemUrl={problem?.url}
          sampleTests={problem?.tests}
          onRun={handleRun}
          running={running}
          results={results}
        />
      </Split>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => {}}
        />
      )}
    </div>
  );
}