import { useRef, useState } from 'react'
import { SPEC } from '../data/spec'

const NAV_ITEMS = [
  { id: 'api-reference', label: 'API Reference',   icon: '◈' },
  { id: 'playground',    label: 'Playground',       icon: '▷' },
  { id: 'editor',        label: 'Markdown Editor',  icon: '✎' },
  { id: 'changelog',     label: 'Changelog',        icon: '◎' },
  { id: 'analytics',     label: 'Analytics',        icon: '▦' },
  { id: 'theme',         label: 'Theme Settings',   icon: '◑' },
]

export default function Sidebar({ activePage, navigate, version, setVersion, darkMode }) {
  // BUG 06: activeRef is initialised once from activePage and NEVER updated.
  // nav-item.active is based on activeRef.current (always 'api-reference'),
  // so the highlight never moves when the user clicks a different page.
  const activeRef = useRef(activePage)

  // BUG 14: endpointsOpen toggle sets state to the CURRENT value — it never flips.
  // The Endpoints section can be collapsed by initialising to false but can never
  // be re-opened because the handler is onClick={() => setEndpointsOpen(endpointsOpen)}.
  const [endpointsOpen, setEndpointsOpen] = useState(true)

  // BUG 20: Breadcrumb map uses "Settings" for the theme page instead of "Theme Settings"
  const BREADCRUMBS = {
    'api-reference': 'Home › API Reference',
    'playground':    'Home › Playground',
    'editor':        'Home › Markdown Editor',
    'changelog':     'Home › Changelog',
    'analytics':     'Home › Analytics',
    'theme':         'Home › Settings',   // ← should be "Theme Settings"
  }

  // BUG 19: No version filtering — all endpoints render regardless of the
  // version switcher. v2-only endpoints (webhooks) appear even when v1 is selected.
  const visibleEndpoints = SPEC.endpoints

  return (
    <aside className={`sidebar${darkMode ? ' dark' : ''}`}>
      <div className="sidebar-logo">
        <span className="logo-mark">⬡</span>
        <span className="logo-name">DevHub</span>
      </div>

      <div className="version-switcher">
        <label className="version-label">Version</label>
        <select
          className="version-select"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        >
          <option value="v1">v1 — Stable</option>
          <option value="v2">v2 — Latest</option>
        </select>
      </div>

      <div className="breadcrumb-bar">
        {BREADCRUMBS[activePage] || 'Home'}
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            // BUG 06: compares against stale ref — active class always stays on 'api-reference'
            className={`nav-item${activeRef.current === item.id ? ' active' : ''}`}
            onClick={() => navigate(item.id)}
            // BUG 23: tabIndex={-1} removes these buttons from the Tab order entirely
            tabIndex={-1}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="endpoint-tree">
        <button
          className="tree-header"
          // BUG 14: passes current value back — toggle never fires
          onClick={() => setEndpointsOpen(endpointsOpen)}
        >
          <span>Endpoints</span>
          <span className={`tree-arrow${endpointsOpen ? ' open' : ''}`}>▾</span>
        </button>

        {endpointsOpen && (
          <ul className="endpoint-list">
            {visibleEndpoints.map((ep) => (
              <li key={ep.id} className="endpoint-entry">
                <span className={`method-pip method-${ep.method.toLowerCase()}`}>
                  {ep.method}
                </span>
                <span className="endpoint-path-small">{ep.path}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
