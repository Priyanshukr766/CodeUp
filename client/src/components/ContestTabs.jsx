// ContestTabs.jsx
// Horizontal scrollable tab strip showing each problem letter.
// Hovering a tab reveals the full problem name as a tooltip.

export default function ContestTabs({ problems, activeIndex, onSelectProblem }) {
  if (!problems || problems.length === 0) return null;

  return (
    <div className="contest-tabs">
      {problems.map(p => (
        <button
          key={p.index}
          className={`contest-tab${activeIndex === p.index ? ' active' : ''}`}
          onClick={() => onSelectProblem(p.index)}
          title={p.name}
        >
          {p.index}
        </button>
      ))}
    </div>
  );
}
