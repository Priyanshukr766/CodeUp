import { useState, useRef, useCallback, useEffect } from 'react';

// ── Default / min panel height ────────────────────────────────────────────────
const DEFAULT_HEIGHT = 260;
const MIN_HEIGHT     = 120;

// ═══════════════════════════════════════════════════════════════════════════════
// VerdictCard — one card per test case
// ═══════════════════════════════════════════════════════════════════════════════
function VerdictCard({ result }) {
  const [expanded, setExpanded] = useState(true);

  const passed  = result.passed;
  const isError = !passed && (
    result.status === 'Time Limit Exceeded' ||
    result.status === 'Runtime Error'       ||
    result.status === 'Error'               ||
    result.status === 'Compilation Error'
  );

  const cardClass = passed ? 'pass' : isError ? 'warn' : 'fail';
  const icon      = passed ? '✓'   : isError ? '⚠'   : '✗';
  const label     = passed
    ? `Sample ${result.id} — Accepted`
    : `Sample ${result.id} — ${result.status}`;

  const receivedTrimmed = (result.stdout || '').trim();
  const expectedTrimmed = (result.expected || '').trim();
  const mismatch = !passed && receivedTrimmed !== expectedTrimmed;

  return (
    <div className={`verdict-card ${cardClass}`}>
      <div className="verdict-card-header" onClick={() => setExpanded(e => !e)}>
        <span className="verdict-icon">{icon}</span>
        <span className="verdict-label">{label}</span>
        {result.time && <span className="verdict-timing">{result.time}</span>}
        <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 4 }}>
          {expanded ? '▾' : '▸'}
        </span>
      </div>

      {expanded && (
        <>
          <div className="verdict-body">
            <div className="verdict-pane">
              <div className="verdict-pane-label">Your Output</div>
              <pre className={`verdict-pane-pre ${mismatch ? 'mismatch' : ''}`}>
                {result.stdout || '(empty)'}
              </pre>
            </div>
            <div className="verdict-pane">
              <div className="verdict-pane-label">Expected Output</div>
              <pre className="verdict-pane-pre">
                {result.expected || '(not provided)'}
              </pre>
            </div>
          </div>
          {result.stderr && (
            <div className="verdict-stderr">{result.stderr}</div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VerdictPanel — draggable from top edge to resize vertically
// ═══════════════════════════════════════════════════════════════════════════════
export default function VerdictPanel({ results }) {
  const [collapsed, setCollapsed] = useState(false);
  const [height, setHeight]       = useState(DEFAULT_HEIGHT);
  const [dragging, setDragging]   = useState(false);

  // Track drag state in refs so event handlers never go stale
  const dragStartY      = useRef(0);
  const dragStartHeight = useRef(0);

  // ── mousedown on the handle ─────────────────────────────────────────────
  const onHandleMouseDown = useCallback((e) => {
    e.preventDefault();               // stop text selection during drag
    dragStartY.current      = e.clientY;
    dragStartHeight.current = height;
    setDragging(true);
  }, [height]);

  // ── global mousemove / mouseup while dragging ───────────────────────────
  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e) => {
      // Dragging UP (negative delta) = panel grows taller
      const delta     = dragStartY.current - e.clientY;
      const newHeight = Math.max(MIN_HEIGHT, dragStartHeight.current + delta);
      setHeight(newHeight);
    };

    const onMouseUp = () => setDragging(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    };
  }, [dragging]);

  // ── nothing to show yet ─────────────────────────────────────────────────
  if (!results || results.length === 0) return null;

  const passCount = results.filter(r => r.passed).length;
  const failCount = results.length - passCount;

  return (
    <div
      className="verdict-panel"
      style={{ height: collapsed ? 'auto' : height }}
    >
      {/* ── Drag handle — grab and pull up/down to resize ─────────────── */}
      {!collapsed && (
        <div
          className={`verdict-resize-handle${dragging ? ' dragging' : ''}`}
          onMouseDown={onHandleMouseDown}
          title="Drag to resize"
        />
      )}

      {/* ── Header row — click to collapse/expand ─────────────────────── */}
      <div
        className="verdict-panel-header"
        onClick={() => setCollapsed(c => !c)}
      >
        <span className="verdict-panel-title">Test Results</span>
        <div className="verdict-summary">
          {passCount > 0 && <span className="pass">✓ {passCount} passed</span>}
          {failCount > 0 && <span className="fail">✗ {failCount} failed</span>}
        </div>
        <span
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}
        >
          {collapsed ? '▸' : '▾'}
        </span>
      </div>

      {/* ── Scrollable result list ────────────────────────────────────── */}
      {!collapsed && (
        <div className="verdict-scroll">
          {results.map(r => (
            <VerdictCard key={r.id} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}
