import { useState, useEffect, useRef } from 'react'
import { SEARCH_INDEX } from '../data/spec'

/*
  BUG 15: highlightMatch lowercases the matched portion before wrapping it in <mark>.
  "Authentication" searched with "auth" → highlights "auth" but shows "auth" (lowercase)
  instead of preserving the original casing "Auth". Visually subtle but wrong.
*/
function highlightMatch(text, query) {
  if (!query || !query.trim()) return text
  const lower = text.toLowerCase()
  const q = query.toLowerCase().trim()
  const idx = lower.indexOf(q)
  if (idx === -1) return text
  // BUG 15: slices from the lowercased string instead of the original
  return (
    text.slice(0, idx) +
    `<mark>${lower.slice(idx, idx + q.length)}</mark>` +
    text.slice(idx + q.length)
  )
}

export default function SearchBar({ query, setQuery, open, setOpen, version, navigate }) {
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    /*
      BUG 17: When query is '' the component should show an empty/placeholder state,
      but instead it pushes a fake "No results found" sentinel into results.
      Opening the search box without typing anything shows "No results found".
    */
    if (query === '') {
      setResults([{ _empty: true, title: 'No results found', page: null }])
      return
    }

    /*
      BUG 12: Always searches the v1 index regardless of the `version` prop.
      When the user has switched to v2, they should see v2-only results
      (e.g. "GET /webhooks") but they never appear.
    */
    const index = SEARCH_INDEX['v1']  // BUG 12: should be SEARCH_INDEX[version]

    /*
      BUG 24: No .trim() on the query before matching.
      Searching for "pagination " (trailing space) returns zero results
      even though "pagination" would match several entries.
    */
    const q = query.toLowerCase()     // BUG 24: should be query.trim().toLowerCase()

    const hits = index.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q)
    )
    setResults(hits)
  }, [query, version])

  return (
    <div className="search-wrapper">
      <div className="search-box">
        <span className="search-icon">⌕</span>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Search documentation…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      {open && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <p className="search-no-results">No results for "{query}"</p>
          ) : results[0]?._empty ? (
            <p className="search-no-results">{results[0].title}</p>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                className="search-result-item"
                onMouseDown={() => navigate(r.page)}
              >
                <span
                  className="result-title"
                  dangerouslySetInnerHTML={{ __html: highlightMatch(r.title, query) }}
                />
                <span
                  className="result-excerpt"
                  dangerouslySetInnerHTML={{ __html: highlightMatch(r.excerpt, query) }}
                />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
