# DevHub — Bug Manifest (Evaluator Reference)

> **Keep this file private.** Share only the deployed app URL with candidates.

---

## Scoring Guide

| Bugs found | Coverage | Signal |
|---|---|---|
| 1–5   | Surface-level UI only         | Click-through tester — no systematic approach |
| 6–10  | Mix of UI + some interaction   | Functional tester — needs coaching on API domain knowledge |
| 11–15 | Spec, logic, and state bugs    | Strong QA — understands the domain |
| 16–20 | Cross-module + timing bugs     | Senior QA — methodical, developer-minded |
| 21–25 | All bugs including edge cases  | Exceptional — hire immediately |

**Differentiator bugs** (only found by testers who use the product like a developer):
03, 05, 08, 09, 12, 15, 18, 21, 24, 26, 27

---

## Bug List

### Module 1 — API Reference (spec vs. render mismatches)

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 01 | `create-user-required` | Medium | `POST /users` — `name` param is `required: true` in the spec but the Required column shows **No** | `ApiReference.jsx` ParamsTable → hard-coded `'No'` for `name` |
| 02 | `user-id-type` | Medium | `user_id` response field shown as **string** — spec says **integer** | `ApiReference.jsx` ResponseTable → `field === 'user_id' ? 'string' : f.type` |
| 03 | `path-param-name` | Medium | `GET /users/{userId}` rendered as `/users/{id}` — path parameter name is wrong | `ApiReference.jsx` → `displayPath = endpoint.path.replace('{userId}', '{id}')` |
| 04 | `missing-sort-param` | Low | `GET /users` has 4 query params in spec but only 3 appear in the table (`sort` is silently dropped) | `ApiReference.jsx` → `slice(0, 3)` on `list-users` params |
| 07 | `deprecated-badge` | Low | `GET /api/v1/users` is `deprecated: true` in the spec but no **Deprecated** badge appears | `ApiReference.jsx` → `{false && endpoint.deprecated && ...}` |

### Module 2 — Playground

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 05 | `curl-auth-scheme` | High | cURL snippet uses `Authorization: Basic` — the API requires **Bearer** tokens | `Playground.jsx` `getCurl()` → hardcoded `Basic` |
| 08 | `response-flash-error` | Medium | After clicking Try It, a **500 Internal Server Error** state flashes for ~350 ms before the real response appears | `Playground.jsx` `handleTryIt()` → nested `setTimeout` with `setFlashError(true)` |
| 10 | `content-type-header` | Low | Response `Content-Type` for `GET /users` shows **text/plain** — should be **application/json** | `Playground.jsx` `MOCK_RESPONSES['GET /users'].headers` |
| 21 | `curl-base-url` | Medium | cURL snippet always uses `https://api.devhub.io/v1` even when the version switcher is set to **v2** | `Playground.jsx` `getCurl()` → `const base = 'https://api.devhub.io/v1'` (ignores `version` prop) |

### Module 3 — Markdown Editor

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 09 | `save-not-persistent` | High | Save shows a success toast, but content is **lost on hard refresh** (stored in a module variable, not localStorage) | `Editor.jsx` → `savedContent` module variable; `handleSave()` assigns to it but never calls `localStorage.setItem` |
| 11 | `bold-regex` | Medium | Preview renders `*single asterisk*` as **bold** and `**double asterisk**` incorrectly — bold regex matches single `*` instead of `**` | `Editor.jsx` `renderMarkdown()` → `/\*([^*\n]+)\*/g` should be `/\*\*([^*\n]+)\*\*/g` |
| 13 | `bold-toolbar-insertion` | Medium | Bold toolbar button inserts `***text***` (triple asterisk = bold-italic) instead of `**text**` | `Editor.jsx` `toolbarActions` bold `action` → `insertAt('***', '***')` |
| 16 | `line-count-off-by-one` | Low | Line counter at the bottom always shows **1 fewer line** than reality | `Editor.jsx` → `content.split('\n').length - 1` should be `content.split('\n').length` |

### Module 4 — Navigation / Sidebar

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 06 | `active-nav-highlight` | High | Sidebar **active highlight never moves** — it always stays on API Reference regardless of which page is open | `Sidebar.jsx` → `activeRef.current` (stale ref, never updated) used instead of `activePage` prop |
| 14 | `section-toggle-broken` | Medium | Clicking **Endpoints** section header does nothing — it cannot be collapsed or re-expanded | `Sidebar.jsx` → `onClick={() => setEndpointsOpen(endpointsOpen)}` passes current value (no-op) |
| 20 | `breadcrumb-wrong-label` | Low | Breadcrumb for Theme Settings shows **Home › Settings** instead of **Home › Theme Settings** | `Sidebar.jsx` `BREADCRUMBS` map → `'theme': 'Home › Settings'` |
| 23 | `keyboard-nav-skipped` | Medium | Tab key **skips all sidebar nav items** — they are invisible to keyboard users | `Sidebar.jsx` → `tabIndex={-1}` on every `.nav-item` button |

### Module 5 — Search

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 12 | `search-wrong-version` | Medium | Searching while on **v2** still returns v1-only results — v2-only entries (webhooks) never appear | `SearchBar.jsx` → `const index = SEARCH_INDEX['v1']` (hardcoded, ignores `version` prop) |
| 15 | `highlight-casing` | Low | Search result highlights **lowercase the matched text** — "Authentication" matched by "auth" shows "auth" in the highlight instead of "Auth" | `SearchBar.jsx` `highlightMatch()` → `lower.slice(...)` instead of `text.slice(...)` |
| 17 | `empty-query-state` | Low | Opening the search box without typing shows **"No results found"** — should show a neutral placeholder | `SearchBar.jsx` → `if (query === '') { setResults([{ _empty: true, ... }]) }` |
| 24 | `trailing-space-no-match` | Medium | Searching `"pagination "` (trailing space) returns **no results** — `trim()` is missing from the query | `SearchBar.jsx` → `const q = query.toLowerCase()` should be `query.trim().toLowerCase()` |

### Module 6 — Versioning

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 19 | `sidebar-version-filter` | Medium | Switching to **v1** still shows v2-only endpoints (webhooks) in the sidebar endpoint list | `Sidebar.jsx` → `const visibleEndpoints = SPEC.endpoints` (no version filter applied) |
| 21 | (see Playground above) | — | cURL base URL doesn't respect version switcher | `Playground.jsx` |

### Module 7 — Changelog

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 22 | `changelog-sort-order` | Medium | Changelog feed shows **oldest entries first** — sort comparator uses `a.date - b.date` instead of `b.date - a.date` | `Changelog.jsx` → `.sort((a, b) => new Date(a.date) - new Date(b.date))` |
| 25 | `filter-case-sensitive` | Medium | Clicking any filter chip (Feature / Fix / Breaking) shows **zero results** — filter compares capitalised chip labels against lowercase data type strings | `Changelog.jsx` → `e.type === activeFilter` ("feature" !== "Feature") |

### Module 8 — Analytics

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 18 | `page-views-not-updating` | Medium | Session page-view counts in the stats grid **never increment** regardless of how many pages are visited | `App.jsx` → `const [pageViews] = useState(...)` — no setter; `navigate()` never updates counts |
| 26 | `chart-tooltip-off-by-one` | Low | Hovering a bar shows the **next bar's data** — tooltip for January shows February's numbers | `Analytics.jsx` `BarChart` → `onMouseEnter={() => setTooltip(data[index + 1] ?? null)}` |

### Module 9 — Theming

| # | ID | Severity | Description | Where to look |
|---|---|---|---|---|
| 27 | `dark-mode-partial` | High | **Dark Mode only applies to the sidebar** — the main content area (header, page content) stays white when dark mode is toggled on | `App.jsx` → `darkMode` prop forwarded only to `<Sidebar>`; `.main-wrapper` never receives a dark class |

---

## Severity legend

| Level | Impact |
|---|---|
| **High** | Breaks expected functionality; user cannot accomplish the task or gets wrong data |
| **Medium** | Misleading output or degraded experience; likely to cause developer errors in production |
| **Low** | Visual/cosmetic inconsistency or minor UX friction |

---

## What to look for in candidate reports

A **strong report** for each bug should include:
1. **Steps to reproduce** (specific enough for a developer to follow without asking)
2. **Expected vs. actual behaviour**
3. **Severity classification** with a brief justification
4. **Module** (API Reference, Playground, Editor, etc.)

Watch for candidates who link bugs across modules (e.g. Bug 12 + Bug 19 together show a systemic version-awareness problem) — that's cross-feature thinking and a strong signal.
