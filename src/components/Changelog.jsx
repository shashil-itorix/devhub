import { useState } from 'react'
import { CHANGELOG } from '../data/changelog'

const TYPE_META = {
  feature:  { label: 'Feature',  bg: '#dcfce7', color: '#166534' },
  fix:      { label: 'Fix',      bg: '#dbeafe', color: '#1e40af' },
  breaking: { label: 'Breaking', bg: '#fee2e2', color: '#991b1b' },
}

const FILTER_OPTIONS = ['All', 'Feature', 'Fix', 'Breaking']

export default function Changelog() {
  const [activeFilter, setActiveFilter] = useState('All')

  /*
    BUG 22: Sort comparator uses (a.date - b.date) which sorts ASCENDING.
    The feed should show newest entries first (descending).
    Candidates must scroll to the bottom to find the most recent release.
  */
  const sorted = [...CHANGELOG].sort(
    (a, b) => new Date(a.date) - new Date(b.date)  // BUG: should be b - a
  )

  /*
    BUG 25: Filter comparison is case-sensitive.
    The filter chips display capitalised labels ("Feature", "Fix", "Breaking")
    but the data uses lowercase type values ("feature", "fix", "breaking").
    Clicking any filter chip other than "All" always returns zero results.
  */
  const entries =
    activeFilter === 'All'
      ? sorted
      : sorted.filter((e) => e.type === activeFilter)  // BUG 25: "Feature" !== "feature"

  return (
    <div className="page changelog-page">
      <div className="page-header">
        <h1>Changelog</h1>
        <p className="page-subtitle">
          A complete history of all notable API changes and releases.
        </p>
      </div>

      <div className="filter-chips">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            className={`chip${activeFilter === f ? ' active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="changelog-feed">
        {entries.length === 0 && (
          <div className="empty-state">No entries match this filter.</div>
        )}

        {entries.map((entry) => {
          const meta = TYPE_META[entry.type] || TYPE_META.feature
          return (
            <div key={entry.id} className="changelog-entry">
              <div className="entry-meta-row">
                <time className="entry-date">{entry.date}</time>
                <span className="entry-version">{entry.version}</span>
                <span
                  className="entry-type-badge"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <h3 className="entry-title">{entry.title}</h3>
              <p className="entry-body">{entry.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
