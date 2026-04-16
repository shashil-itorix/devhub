import { useState } from 'react'
import { SPEC } from '../data/spec'

const METHOD_COLOR = {
  GET:    '#22c55e',
  POST:   '#3b82f6',
  PUT:    '#f59e0b',
  DELETE: '#ef4444',
  PATCH:  '#8b5cf6',
}

function ParamsTable({ endpoint }) {
  // BUG 04: slice(0, 3) hard-coded for list-users — the 4th param "sort" is silently dropped
  const params = endpoint.id === 'list-users'
    ? endpoint.parameters.slice(0, 3)
    : endpoint.parameters

  if (params.length === 0) return null

  return (
    <div className="doc-section">
      <h4 className="section-title">Parameters</h4>
      <table className="doc-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>In</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name}>
              <td><code>{p.name}</code></td>
              <td><span className="badge-in">{p.in}</span></td>
              <td><span className="type-label">{p.type}</span></td>
              <td>
                {/*
                  BUG 01: create-user's "name" parameter has required: true in the spec
                  but the UI hard-codes it to render "No" — hiding a required constraint.
                */}
                {endpoint.id === 'create-user' && p.name === 'name'
                  ? <span className="req-no">No</span>
                  : p.required
                    ? <span className="req-yes">Yes</span>
                    : <span className="req-no">No</span>
                }
              </td>
              <td className="desc-cell">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ResponseTable({ endpoint }) {
  return (
    <div className="doc-section">
      <h4 className="section-title">Response Schema</h4>
      {Object.entries(endpoint.responses).map(([status, fields]) => (
        <div key={status}>
          <span className={`status-badge status-${status[0]}xx`}>{status}</span>
          <table className="doc-table" style={{ marginTop: '0.5rem' }}>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.field}>
                  <td><code>{f.field}</code></td>
                  <td>
                    {/*
                      BUG 02: user_id has type "integer" in the spec.
                      The UI always renders it as "string" — a type mismatch that
                      would mislead developers who parse the response.
                    */}
                    <span className="type-label">
                      {f.field === 'user_id' ? 'string' : f.type}
                    </span>
                  </td>
                  <td className="desc-cell">{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function EndpointCard({ endpoint }) {
  const [open, setOpen] = useState(true)

  /*
    BUG 03: The path display replaces {userId} with {id}.
    Spec: /users/{userId}  →  UI renders: /users/{id}
    This breaks generated cURL examples and confuses consumers about
    the actual path parameter name.
  */
  const displayPath = endpoint.path.replace('{userId}', '{id}')

  return (
    <div className="endpoint-card" id={endpoint.id}>
      <button className="endpoint-header" onClick={() => setOpen(!open)}>
        <span
          className="method-tag"
          style={{ background: METHOD_COLOR[endpoint.method] }}
        >
          {endpoint.method}
        </span>
        <code className="endpoint-path-display">{displayPath}</code>

        {/*
          BUG 07: `endpoint.deprecated` is true for legacy-users, but the condition
          is `false && endpoint.deprecated` — the badge is permanently suppressed.
        */}
        {false && endpoint.deprecated && (
          <span className="deprecated-tag">Deprecated</span>
        )}

        <span className="endpoint-summary">{endpoint.summary}</span>
        <span className="expand-arrow">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="endpoint-body">
          <ParamsTable endpoint={endpoint} />
          <ResponseTable endpoint={endpoint} />
        </div>
      )}
    </div>
  )
}

export default function ApiReference({ version }) {
  return (
    <div className="page api-reference-page">
      <div className="page-header">
        <h1>API Reference</h1>
        <p className="page-subtitle">
          Complete reference for the DevHub API&nbsp;
          <span className="version-tag">{version}</span>.
        </p>
      </div>

      <section className="doc-prose">
        <h2>Authentication</h2>
        <p>
          Every request must include a valid Bearer token in the{' '}
          <code>Authorization</code> header:
        </p>
        <pre className="code-block">
{`Authorization: Bearer YOUR_API_TOKEN`}
        </pre>
        <p>
          Tokens can be generated from your account dashboard under{' '}
          <strong>Settings → API Keys</strong>.
        </p>
      </section>

      <section>
        <h2>Endpoints</h2>
        <div className="endpoint-stack">
          {SPEC.endpoints.map((ep) => (
            <EndpointCard key={ep.id} endpoint={ep} />
          ))}
        </div>
      </section>
    </div>
  )
}
