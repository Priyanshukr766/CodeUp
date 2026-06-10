import { useEffect, useRef, useState, memo } from 'react';
import DOMPurify from 'dompurify';
import SampleTestCases from './SampleTestCases';

// ── Rating colour helper (mirrors Codeforces colours) ────────────────────────
function getRatingClass(rating) {
  if (!rating) return 'gray';
  if (rating < 1200) return 'gray';
  if (rating < 1400) return 'green';
  if (rating < 1600) return 'cyan';
  if (rating < 1900) return 'blue';
  if (rating < 2100) return 'purple';
  if (rating < 2400) return 'orange';
  return 'red';
}

// ── Trigger MathJax typeset on the given DOM node ────────────────────────────
async function typesetMath(node) {
  if (!node || !window.MathJax?.typesetPromise) return;
  try {
    await window.MathJax.typesetPromise([node]);
  } catch {
    // MathJax may not be ready yet — ignore
  }
}

// ── Sanitise HTML from the scraper ───────────────────────────────────────────
function sanitize(html) {
  let mathToggle = false;
  // Codeforces uses $$$ for math, which confuses standard MathJax configs.
  // We safely replace $$$ pairs with standard LaTeX \\( and \\)
  const processedHtml = (html ?? '').replace(/\$\$\$/g, () => {
    mathToggle = !mathToggle;
    return mathToggle ? '\\(' : '\\)';
  });

  return DOMPurify.sanitize(processedHtml, {
    ALLOWED_TAGS: [
      'p','br','b','strong','i','em','u','s','ul','ol','li',
      'table','thead','tbody','tr','th','td','pre','code','span','div',
      'h1','h2','h3','h4','sup','sub','a','img',
    ],
    ALLOWED_ATTR: ['class','style','href','src','alt','title'],
    ALLOW_DATA_ATTR: false,
  });
}

// ── Memoized component to safely wrap MathJax rendering ──────────────────────
// This prevents React from overwriting MathJax DOM mutations during re-renders
const MathJaxContent = memo(({ html, className }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) typesetMath(ref.current);
  }, [html]);

  return <div className={className} ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
});

export default function ProblemStatement({ problem, loading, error, onExampleClick }) {
  const [showTags, setShowTags] = useState(false);

  /* ── Loading skeleton ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="skeleton title" />
        <div className="skeleton badges" />
        <div style={{ height: 8 }} />
        {[100, 85, 100, 90, 100, 75, 100].map((w, i) => (
          <div key={i} className="skeleton line" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }

  /* ── Error state ──────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="error-state">
        <div className="error-state-icon">⚠️</div>
        <h3>Failed to load problem</h3>
        <p>{error}</p>
      </div>
    );
  }

  /* ── Welcome / empty state ────────────────────────────────────────────── */
  if (!problem) {
    return (
      <div className="welcome-state">
        <div className="welcome-state-icon">⚡</div>
        <h2>CodeUp Workspace</h2>
        <p>
          Enter any Codeforces problem code or URL above to fetch the full
          statement and start solving.
        </p>
        <div className="welcome-examples">
          {['1A', '1984A', '158B', '2063B'].map(ex => (
            <button key={ex} className="welcome-chip" onClick={() => onExampleClick(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const ratingClass = getRatingClass(problem.rating);

  return (
    <div>
      {/* ── Title ─────────────────────────────────────────────────────── */}
      <h1 className="problem-title">{problem.name}</h1>

      {/* ── Meta badges ───────────────────────────────────────────────── */}
      <div className="problem-meta-row">
        <span className="meta-badge time">
          ⏱ {problem.timeLimit} ms
        </span>
        <span className="meta-badge memory">
          💾 {problem.memoryLimit} MB
        </span>
        {problem.interactive && (
          <span className="meta-badge interactive">🔄 Interactive</span>
        )}
        {problem.rating && (
          <span className={`rating-badge ${ratingClass}`}>
            ★ {problem.rating}
          </span>
        )}
      </div>

      {/* ── Tags ──────────────────────────────────────────────────────── */}
      {problem.tags?.length > 0 && (
        <div>
          <button
            className="icon-btn"
            style={{ marginBottom: 10, fontSize: 11 }}
            onClick={() => setShowTags(t => !t)}
          >
            {showTags ? '▾ Hide tags' : '▸ Show tags'}
          </button>
          {showTags && (
            <div className="tags-row">
              {problem.tags.map(tag => (
                <span key={tag} className="tag-chip">{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="problem-divider" />

      {/* ── Statement body ────────────────────────────────────────────── */}
      {problem.statement && (
        <MathJaxContent className="cf-statement" html={sanitize(problem.statement)} />
      )}

      {/* ── Input specification ───────────────────────────────────────── */}
      {problem.inputSpec && (
        <>
          <div className="problem-divider" />
          <MathJaxContent className="cf-statement" html={sanitize(problem.inputSpec)} />
        </>
      )}

      {/* ── Output specification ──────────────────────────────────────── */}
      {problem.outputSpec && (
        <MathJaxContent className="cf-statement" html={sanitize(problem.outputSpec)} />
      )}

      {/* ── Sample test cases ─────────────────────────────────────────── */}
      {problem.tests?.length > 0 && (
        <SampleTestCases tests={problem.tests} />
      )}

      {/* ── Note ──────────────────────────────────────────────────────── */}
      {problem.note && (
        <>
          <div className="problem-divider" />
          <MathJaxContent className="cf-statement" html={sanitize(problem.note)} />
        </>
      )}
    </div>
  );
}
