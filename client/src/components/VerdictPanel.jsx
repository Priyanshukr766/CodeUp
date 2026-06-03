import { useState } from 'react';

function VerdictCard({ result }) {
  const [expanded, setExpanded] = useState(true);

  const passed = result.passed;
  const isError = !passed && (
    result.status === 'Time Limit Exceeded' ||
    result.status === 'Runtime Error'       ||
    result.status === 'Error'               ||
    result.status === 'Compilation Error'
  );

  const cardClass = passed ? 'pass' : isError ? 'warn' : 'fail';
  const icon      = passed ? '✓'   : isError ? '⚠'   : '✗';
  const label     = passed ? `Sample ${result.id} — Accepted`
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

export default function VerdictPanel({ results }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!results || results.length === 0) return null;

  const passCount = results.filter(r => r.passed).length;
  const failCount = results.length - passCount;

  return (
    <div className="verdict-panel">
      <div
        className="verdict-panel-header"
        onClick={() => setCollapsed(c => !c)}
      >
        <span className="verdict-panel-title">Test Results</span>
        <div className="verdict-summary">
          {passCount > 0 && <span className="pass">✓ {passCount} passed</span>}
          {failCount > 0 && <span className="fail">✗ {failCount} failed</span>}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>
          {collapsed ? '▸' : '▾'}
        </span>
      </div>

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
