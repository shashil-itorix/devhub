import { useState } from 'react'
import { ANALYTICS_DATA } from '../data/analytics'

/*
  BUG 26: Bar chart tooltip is off by one.
  onMouseEnter for bar at index i shows data[i + 1] instead of data[i].
  Hovering over January shows February's numbers; hovering over the last bar
  shows undefined and the tooltip silently disappears.
*/
function BarChart({ data }) {
  const [tooltip, setTooltip] = useState(null)
  const max = Math.max(...data.map((d) => d.views))

  return (
    <div className="chart-outer">
      <div className="bar-chart">
        {data.map((item, index) => (
          <div
            key={item.month}
            className="bar-col"
            // BUG 26: index + 1 — always shows next bar's data
            onMouseEnter={() => setTooltip(data[index + 1] ?? null)}
            onMouseLeave={() => setTooltip(null)}
          >
            <div
              className="bar-fill"
              style={{ height: `${Math.round((item.views / max) * 160)}px` }}
            />
            <span className="bar-month">{item.month}</span>
          </div>
        ))}
      </div>
      {tooltip && (
        <div className="chart-tooltip">
          <strong>{tooltip.month}</strong>: {tooltip.views.toLocaleString()} views
        </div>
      )}
    </div>
  )
}

export default function Analytics({ pageViews }) {
  /*
    BUG 18: pageViews is passed from App.jsx where it is initialised once with
    useState and never updated on navigation. No matter how many pages the user
    visits during the session, the counts here always show the initial values.
    A tester who navigates to three pages and checks back here will see no change.
  */
  const totalViews = Object.values(pageViews).reduce((a, b) => a + b, 0)

  return (
    <div className="page analytics-page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p className="page-subtitle">Usage insights for your documentation.</p>
      </div>

      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-value">{totalViews}</span>
          <span className="kpi-label">Total Page Views (session)</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{ANALYTICS_DATA.topSearches.reduce((a, b) => a + b.count, 0).toLocaleString()}</span>
          <span className="kpi-label">Total Searches</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-value">{ANALYTICS_DATA.topPages.length}</span>
          <span className="kpi-label">Tracked Pages</span>
        </div>
      </div>

      <div className="page-views-grid">
        {Object.entries(pageViews).map(([page, count]) => (
          <div key={page} className="pv-card">
            <span className="pv-count">{count}</span>
            <span className="pv-page">{page.replace(/-/g, ' ')}</span>
          </div>
        ))}
      </div>

      <section className="chart-section">
        <h2>Monthly Page Views</h2>
        <p className="section-hint">Hover a bar to see the exact count for that month.</p>
        <BarChart data={ANALYTICS_DATA.monthlyViews} />
      </section>

      <div className="analytics-tables">
        <section className="table-section">
          <h2>Top Pages</h2>
          <table className="data-table">
            <thead>
              <tr><th>Page</th><th>Views</th><th>Avg. Time</th></tr>
            </thead>
            <tbody>
              {ANALYTICS_DATA.topPages.map((row) => (
                <tr key={row.page}>
                  <td><code>{row.page}</code></td>
                  <td>{row.views.toLocaleString()}</td>
                  <td>{row.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="table-section">
          <h2>Top Searches</h2>
          <table className="data-table">
            <thead>
              <tr><th>Query</th><th>Count</th></tr>
            </thead>
            <tbody>
              {ANALYTICS_DATA.topSearches.map((row) => (
                <tr key={row.query}>
                  <td>{row.query}</td>
                  <td>{row.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
