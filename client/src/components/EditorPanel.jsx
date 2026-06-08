import { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { LANGUAGES, BOILERPLATES } from '../utils/boilerplates';
import CustomTestCase from './CustomTestCase';
import VerdictPanel from './VerdictPanel';

const MONACO_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'off',
  lineNumbers: 'on',
  renderLineHighlight: 'line',
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  smoothScrolling: true,
  padding: { top: 12, bottom: 12 },
  bracketPairColorization: { enabled: true },
  autoClosingBrackets: 'always',
  formatOnPaste: false,
  tabSize: 4,
};

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

export default function EditorPanel({
  problemUrl,
  sampleTests,
  onRun,
  running,
  results,
  // Contest-mode hydration — set when switching tabs
  initialCode,
  initialLang,
  onStateChange,
}) {
  const [langId,  setLangId]  = useState('cpp');
  const [code,    setCode]    = useState(() => BOILERPLATES['cpp']);
  const [copied,  setCopied]  = useState(false);
  const [customTests, setCustomTests] = useState([]);
  const [nextId, setNextId]  = useState(1);
  const editorRef = useRef(null);

  // ── Hydrate from contest cache when tab switches ─────────────────────
  // initialCode / initialLang change whenever the parent switches the active tab.
  useEffect(() => {
    if (initialCode !== undefined) setCode(initialCode || BOILERPLATES[langId]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  useEffect(() => {
    if (initialLang !== undefined) setLangId(initialLang || 'cpp');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLang]);

  // ── Report editor state upward whenever it changes ──────────────────────
  useEffect(() => {
    if (onStateChange) onStateChange({ code, language: langId });
  }, [code, langId, onStateChange]);

  // ── localStorage auto-save / restore ──────────────────────────────────
  const storageKey = problemUrl ? `codeup:${problemUrl}:${langId}` : null;

  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) setCode(saved);
    else setCode(BOILERPLATES[langId]);
  }, [storageKey, langId]);

  const handleCodeChange = useCallback((value) => {
    setCode(value ?? '');
    if (storageKey) localStorage.setItem(storageKey, value ?? '');
  }, [storageKey]);

  // ── Language switch ────────────────────────────────────────────────────
  const handleLangChange = (newLang) => {
    const saved = problemUrl ? localStorage.getItem(`codeup:${problemUrl}:${newLang}`) : null;
    setCode(saved ?? BOILERPLATES[newLang]);
    setLangId(newLang);
  };

  // ── Copy code ─────────────────────────────────────────────────────────
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── Build full test suite and trigger run ──────────────────────────────
  const handleRun = () => {
    const allTests = [
      ...(sampleTests || []).map(t => ({
        input: t.input,
        expectedOutput: t.output,
      })),
      ...customTests.map(t => ({
        input: t.input,
        expectedOutput: t.expectedOutput || '',
      })),
    ];
    onRun({ code, language: langId, tests: allTests });
  };

  // ── Custom test management ─────────────────────────────────────────────
  const addCustomTest = () => {
    setCustomTests(prev => [
      ...prev,
      { id: nextId, input: '', expectedOutput: '' },
    ]);
    setNextId(n => n + 1);
  };

  const removeCustomTest = (id) => {
    setCustomTests(prev => prev.filter(t => t.id !== id));
  };

  const updateCustomTest = (id, data) => {
    setCustomTests(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const currentLang = LANGUAGES.find(l => l.id === langId);

  return (
    <div className="editor-panel">
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="editor-toolbar">
        {/* Language selector */}
        <div className="lang-select-wrap">
          <select
            id="language-selector"
            className="lang-select"
            value={langId}
            onChange={e => handleLangChange(e.target.value)}
          >
            {LANGUAGES.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <span className="lang-select-arrow">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>
        </div>

        <div className="editor-spacer" />

        {/* Copy button */}
        <button className="icon-btn" onClick={handleCopy} id="copy-code-btn">
          <CopyIcon />
          {copied ? 'Copied!' : 'Copy'}
        </button>

        {/* Reset to boilerplate */}
        <button
          className="icon-btn"
          id="reset-boilerplate-btn"
          onClick={() => {
            if (confirm('Reset code to boilerplate?')) {
              setCode(BOILERPLATES[langId]);
              if (storageKey) localStorage.removeItem(storageKey);
            }
          }}
          title="Reset to boilerplate"
        >
          ↺ Reset
        </button>
      </div>

      {/* ── Monaco Editor ─────────────────────────────────────────── */}
      <div className="monaco-wrap">
        <Editor
          height="100%"
          theme="vs-dark"
          language={currentLang?.monacoId}
          value={code}
          onChange={handleCodeChange}
          onMount={(editor) => { editorRef.current = editor; }}
          options={MONACO_OPTIONS}
          loading={
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', color: 'var(--text-muted)', fontSize: 13,
            }}>
              Loading editor…
            </div>
          }
        />
      </div>

      {/* ── Custom test cases ─────────────────────────────────────── */}
      {customTests.length > 0 && (
        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)', maxHeight: 200, overflowY: 'auto' }}>
          {customTests.map(tc => (
            <CustomTestCase
              key={tc.id}
              id={tc.id}
              onRemove={removeCustomTest}
              onChange={updateCustomTest}
            />
          ))}
        </div>
      )}

      {/* ── Run Bar ───────────────────────────────────────────────── */}
      <div className="run-bar">
        <button
          id="run-btn"
          className={`run-btn ${running ? 'running' : ''}`}
          onClick={handleRun}
          disabled={running || !sampleTests?.length}
          title={!sampleTests?.length ? 'Fetch a problem first' : ''}
        >
          {running ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
              Running…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
              Run
            </>
          )}
        </button>

        <button className="add-test-btn" id="add-test-btn" onClick={addCustomTest}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Test Case
        </button>

        {sampleTests?.length > 0 && (
          <span className="text-muted" style={{ marginLeft: 'auto' }}>
            {sampleTests.length} sample{sampleTests.length !== 1 ? 's' : ''}
            {customTests.length > 0 && ` + ${customTests.length} custom`}
          </span>
        )}
      </div>

      {/* ── Verdict Panel ─────────────────────────────────────────── */}
      <VerdictPanel results={results} />
    </div>
  );
}
