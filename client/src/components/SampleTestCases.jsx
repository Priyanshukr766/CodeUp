import { useState } from 'react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
      {copied ? (
        <>✓ Copied</>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

export default function SampleTestCases({ tests }) {
  return (
    <div className="samples-section">
      <div className="samples-title">Sample Test Cases</div>
      {tests.map((tc, i) => (
        <div key={i} className="sample-card">
          <div className="sample-card-header">
            <span>Sample {i + 1}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <CopyButton text={tc.input} />
            </div>
          </div>
          <div className="sample-io">
            <div className="sample-io-pane">
              <div className="sample-io-label">Input</div>
              <pre className="sample-io-pre">{tc.input}</pre>
            </div>
            <div className="sample-io-pane">
              <div className="sample-io-label">Output</div>
              <pre className="sample-io-pre">{tc.output}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
