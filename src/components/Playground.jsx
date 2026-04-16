import { useState } from 'react'
import { SPEC } from '../data/spec'

const MOCK_RESPONSES = {
  'GET /users': {
    status: 200,
    headers: {
      // BUG 10: Content-Type is text/plain — it should be application/json
      'Content-Type': 'text/plain',
      'X-RateLimit-Remaining': '987',
      'X-Request-Id': 'req_7f3a2b1c',
    },
    body: {
      users: [
        { user_id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin',  created_at: '2024-01-15T10:30:00Z' },
        { user_id: 2, name: 'Bob Smith',     email: 'bob@example.com',   role: 'member', created_at: '2024-02-20T14:22:00Z' },
      ],
      total: 2,
      page: 1,
    },
  },
  'GET /users/{userId}': {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '986' },
    body: { user_id: 42, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', created_at: '2024-01-15T10:30:00Z' },
  },
  'POST /users': {
    status: 201,
    headers: { 'Content-Type': 'application/json', 'Location': '/users/43' },
    body: { user_id: 43, name: 'Carol Davis', email: 'carol@example.com', role: 'member' },
  },
  'GET /posts': {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { posts: [], total: 0, page: 1 },
  },
  'GET /api/v1/users': {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'X-Deprecated': 'true' },
    body: { data: [], count: 0 },
  },
  'GET /webhooks': {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { webhooks: [], total: 0 },
  },
  'POST /webhooks': {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
    body: { id: 'wh_abc123', url: 'https://example.com/hook', active: true },
  },
}

export default function Playground({ version }) {
  const [selectedId, setSelectedId] = useState(SPEC.endpoints[0].id)
  const [token, setToken] = useState('')
  const [pathParams, setPathParams] = useState({})
  const [bodyParams, setBodyParams] = useState({})
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [flashError, setFlashError] = useState(false)

  const endpoint = SPEC.endpoints.find((e) => e.id === selectedId)

  const handleTryIt = () => {
    setLoading(true)
    setResponse(null)
    setFlashError(false)

    /*
      BUG 08: A spurious 500 error flashes for ~350 ms before the real response
      appears. This happens because setFlashError(true) fires first, then a nested
      timeout clears it and shows the real mock response. A careful tester watching
      the response panel will see the error state briefly — a real timing/race bug.
    */
    setTimeout(() => {
      setFlashError(true)
      setTimeout(() => {
        setFlashError(false)
        setLoading(false)
        const key = `${endpoint.method} ${endpoint.path}`
        setResponse(MOCK_RESPONSES[key] ?? { status: 200, headers: {}, body: {} })
      }, 350)
    }, 650)
  }

  const getCurl = () => {
    /*
      BUG 05: cURL snippet uses "Basic" auth scheme.
      The API spec (and auth section) specifies Bearer tokens.
      A developer copying this snippet will get 401 errors.
      BUG 21: Base URL is hardcoded to v1 regardless of the version switcher.
    */
    const base = 'https://api.devhub.io/v1'   // BUG 21: should use version prop
    let path = endpoint.path
    Object.entries(pathParams).forEach(([k, v]) => {
      if (v) path = path.replace(`{${k}}`, v)
    })
    const bodyStr = Object.keys(bodyParams).length
      ? `\\\n  -d '${JSON.stringify(bodyParams)}'`
      : ''
    return `curl -X ${endpoint.method} "${base}${path}" \\
  -H "Authorization: Basic ${token || 'YOUR_API_TOKEN'}" \\
  -H "Content-Type: application/json"${bodyStr ? ' ' + bodyStr : ''}`
  }

  const pathParamDefs = endpoint.parameters.filter((p) => p.in === 'path')
  const bodyParamDefs = endpoint.parameters.filter((p) => p.in === 'body')

  return (
    <div className="page playground-page">
      <div className="page-header">
        <h1>API Playground</h1>
        <p className="page-subtitle">Send live requests to mock endpoints and inspect responses.</p>
      </div>

      <div className="playground-grid">
        {/* ── Request panel ─────────────────────────────── */}
        <div className="request-panel">
          <div className="form-group">
            <label className="form-label">Endpoint</label>
            <select
              className="form-select"
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setResponse(null) }}
            >
              {SPEC.endpoints.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.method} {ep.path}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">API Token</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter your API token…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          {pathParamDefs.map((p) => (
            <div className="form-group" key={p.name}>
              <label className="form-label">
                {p.name} <span className="req-star">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                placeholder={p.description}
                value={pathParams[p.name] || ''}
                onChange={(e) => setPathParams({ ...pathParams, [p.name]: e.target.value })}
              />
            </div>
          ))}

          {bodyParamDefs.length > 0 && (
            <div className="form-group">
              <label className="form-label">Request Body</label>
              {bodyParamDefs.map((p) => (
                <div key={p.name} className="body-param">
                  <span className="body-param-name">
                    {p.name}{p.required && <span className="req-star"> *</span>}
                  </span>
                  <input
                    className="form-input"
                    type="text"
                    placeholder={p.description}
                    value={bodyParams[p.name] || ''}
                    onChange={(e) => setBodyParams({ ...bodyParams, [p.name]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-primary try-btn"
            onClick={handleTryIt}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : '▷ Try It'}
          </button>

          <div className="curl-block">
            <div className="curl-header">
              <span>cURL</span>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(getCurl())}
              >
                Copy
              </button>
            </div>
            <pre className="code-block">{getCurl()}</pre>
          </div>
        </div>

        {/* ── Response panel ────────────────────────────── */}
        <div className="response-panel">
          <h3 className="panel-title">Response</h3>

          {!response && !loading && !flashError && (
            <div className="response-empty">
              <span className="empty-icon">◎</span>
              <p>Click <strong>Try It</strong> to send a request</p>
            </div>
          )}

          {(loading && !flashError) && (
            <div className="response-loading">
              <div className="pulse-ring" />
              <p>Sending request…</p>
            </div>
          )}

          {flashError && (
            <div className="response-error-flash">
              <span className="status-badge status-5xx">500</span>
              <p>Internal Server Error</p>
            </div>
          )}

          {response && (
            <div className="response-body">
              <div className="response-status-row">
                <span className={`status-badge status-${String(response.status)[0]}xx`}>
                  {response.status}
                </span>
                <span className="status-text">
                  {response.status === 200 ? 'OK' : response.status === 201 ? 'Created' : 'Response'}
                </span>
              </div>

              <div className="response-headers-block">
                <p className="block-label">Headers</p>
                {Object.entries(response.headers).map(([k, v]) => (
                  <div key={k} className="header-row">
                    <span className="hdr-key">{k}:</span>
                    <span className="hdr-val">{v}</span>
                  </div>
                ))}
              </div>

              <div className="response-body-block">
                <p className="block-label">Body</p>
                <pre className="code-block response-json">
                  {JSON.stringify(response.body, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
