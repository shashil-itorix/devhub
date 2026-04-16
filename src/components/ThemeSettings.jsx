import { useState } from 'react'

const PALETTE = [
  { id: 'indigo', name: 'Indigo',  primary: '#6366f1', accent: '#8b5cf6' },
  { id: 'ocean',  name: 'Ocean',   primary: '#0ea5e9', accent: '#06b6d4' },
  { id: 'forest', name: 'Forest',  primary: '#22c55e', accent: '#10b981' },
  { id: 'sunset', name: 'Sunset',  primary: '#f97316', accent: '#ef4444' },
]

const FONT_SIZES   = ['Small', 'Medium', 'Large']
const FONT_FAMILIES = ['Inter', 'System UI', 'JetBrains Mono', 'Serif']

export default function ThemeSettings({ darkMode, setDarkMode }) {
  const [palette,     setPalette]     = useState('indigo')
  const [fontSize,    setFontSize]    = useState('Medium')
  const [fontFamily,  setFontFamily]  = useState('Inter')
  const [compactMode, setCompactMode] = useState(false)
  const [applied,     setApplied]     = useState(false)

  const handleApply = () => {
    /*
      BUG 27 lives in App.jsx — the `darkMode` state is toggled here and passed
      up via setDarkMode, but App.jsx only attaches the .dark class to <Sidebar>.
      The main content wrapper never receives the class, so dark mode visually
      applies only to the sidebar panel.
    */
    setApplied(true)
    setTimeout(() => setApplied(false), 2000)
  }

  const handleReset = () => {
    setPalette('indigo')
    setFontSize('Medium')
    setFontFamily('Inter')
    setCompactMode(false)
    setDarkMode(false)
  }

  return (
    <div className="page theme-page">
      <div className="page-header">
        <h1>Theme Settings</h1>
        <p className="page-subtitle">Customise the look and feel of your documentation.</p>
      </div>

      <div className="settings-stack">

        {/* ── Appearance ─────────────────────────────────── */}
        <section className="settings-card">
          <h2 className="settings-section-title">Appearance</h2>

          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Dark Mode</label>
              <p className="setting-hint">Switch the entire interface to a dark colour scheme.</p>
            </div>
            <div className="toggle-group">
              <button
                className={`toggle-btn${darkMode ? ' on' : ''}`}
                onClick={() => setDarkMode(!darkMode)}
                aria-pressed={darkMode}
              >
                <span className="toggle-knob" />
              </button>
              <span className="toggle-state">{darkMode ? 'On' : 'Off'}</span>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <label className="setting-label">Compact Mode</label>
              <p className="setting-hint">Reduce spacing for denser information display.</p>
            </div>
            <div className="toggle-group">
              <button
                className={`toggle-btn${compactMode ? ' on' : ''}`}
                onClick={() => setCompactMode(!compactMode)}
                aria-pressed={compactMode}
              >
                <span className="toggle-knob" />
              </button>
              <span className="toggle-state">{compactMode ? 'On' : 'Off'}</span>
            </div>
          </div>
        </section>

        {/* ── Colour Palette ─────────────────────────────── */}
        <section className="settings-card">
          <h2 className="settings-section-title">Colour Palette</h2>
          <div className="palette-grid">
            {PALETTE.map((p) => (
              <button
                key={p.id}
                className={`palette-card${palette === p.id ? ' selected' : ''}`}
                onClick={() => setPalette(p.id)}
              >
                <div className="palette-swatches">
                  <span className="swatch" style={{ background: p.primary }} />
                  <span className="swatch" style={{ background: p.accent  }} />
                </div>
                <span className="palette-name">{p.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Typography ─────────────────────────────────── */}
        <section className="settings-card">
          <h2 className="settings-section-title">Typography</h2>

          <div className="setting-row">
            <label className="setting-label">Font Size</label>
            <div className="option-row">
              {FONT_SIZES.map((s) => (
                <button
                  key={s}
                  className={`option-btn${fontSize === s ? ' active' : ''}`}
                  onClick={() => setFontSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-row">
            <label className="setting-label">Font Family</label>
            <select
              className="form-select"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ── Actions ────────────────────────────────────── */}
        <div className="settings-actions">
          <button className="btn-primary" onClick={handleApply}>
            {applied ? '✓ Applied' : 'Apply Changes'}
          </button>
          <button className="btn-secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}
