import { useState } from 'react';

export default function SearchBar({ onFetch, loading }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = value.trim();
    if (token) onFetch(token);
  };

  const fillExample = (ex) => {
    setValue(ex);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <div className="search-input-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          id="problem-search-input"
          className="search-input"
          type="text"
          placeholder="Enter problem code or URL  (e.g. 1984A)"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <button
        id="fetch-btn"
        className="search-btn"
        type="submit"
        disabled={loading || !value.trim()}
      >
        {loading ? (
          <>
            <Spinner />
            Fetching…
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Fetch
          </>
        )}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}
