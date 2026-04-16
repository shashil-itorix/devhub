import { useState, useRef } from 'react'

/*
  BUG 09: `savedContent` is a plain module-level variable — not localStorage.
  When the user saves, the variable is updated and a success toast fires.
  But as soon as they navigate to another page and come back, the Editor
  component unmounts and remounts, re-initialising `content` from `savedContent`.
  Because JS modules ARE cached within a session, the content survives tab
  navigation… but a hard refresh (F5) loses everything. More importantly,
  opening the app in a new tab always shows the original default text,
  making it appear that Save did nothing persistent.
*/
let savedContent = `# Welcome to the Editor

Start writing your documentation here.

## Getting Started

This is a **markdown** editor with live preview.

- Write content on the **left**
- See the rendered preview on the **right**
- Use the toolbar buttons for quick formatting

## Code Example

\`\`\`javascript
const client = new DevHubClient({ token: 'YOUR_API_TOKEN' })
const users = await client.users.list({ limit: 10 })
\`\`\`

## Notes

> Use blockquotes to highlight important information for your readers.
`

/*
  BUG 11: The markdown parser regex for bold is \*([^*]+)\* (single asterisk)
  instead of \*\*([^*]+)\*\* (double asterisk).
  Result: *italic-looking text* renders as <strong> (bold) in the preview,
  while **bold text** is processed by matching the outer asterisks and leaving
  one stray asterisk in the output — visually wrong and confusing.
*/
function renderMarkdown(text) {
  return text
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
    .replace(/^> (.+)$/gm,    '<blockquote>$1</blockquote>')
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g,    '<code>$1</code>')
    // BUG 11: single-asterisk pattern — should be \*\*([^*]+)\*\*
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_\n]+)_/g,  '<em>$1</em>')
    .replace(/^- (.+)$/gm,    '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g,       '</p><p>')
    .replace(/\n/g,           '<br/>')
}

export default function Editor() {
  const [content, setContent] = useState(savedContent)
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saving' | 'saved'
  const textareaRef = useRef(null)

  const handleSave = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      savedContent = content   // BUG 09: in-memory only, lost on hard refresh
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2500)
    }, 400)
  }

  const insertAt = (before, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e } = ta
    const selected = content.slice(s, e) || (before === '**' ? 'bold text' : before === '_' ? 'italic text' : 'text')
    const next = content.slice(0, s) + before + selected + after + content.slice(e)
    setContent(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(s + before.length, s + before.length + selected.length)
    })
  }

  const toolbarActions = [
    {
      label: 'B', title: 'Bold',
      // BUG 13: Inserts *** (triple asterisk) instead of ** (double asterisk).
      // Text wrapped in *** renders as italic-bold in most parsers, not plain bold.
      // Selecting text and clicking Bold produces ***selected*** instead of **selected**.
      action: () => insertAt('***', '***'),
    },
    { label: 'I',   title: 'Italic',  action: () => insertAt('_', '_')    },
    { label: 'H2',  title: 'Heading', action: () => insertAt('\n## ', '')  },
    { label: '</>',  title: 'Inline code', action: () => insertAt('`', '`') },
    { label: '❝',   title: 'Blockquote', action: () => insertAt('\n> ', '') },
    { label: '—',   title: 'List item',  action: () => insertAt('\n- ', '') },
  ]

  /*
    BUG 16: Line count is computed as split('\n').length - 1.
    A file with 1 line has split result ['line'] → length 1 - 1 = 0.
    A file with 3 lines shows 2. The counter is always one less than reality.
  */
  const lineCount = content.split('\n').length - 1

  return (
    <div className="page editor-page">
      <div className="page-header">
        <h1>Markdown Editor</h1>
        <p className="page-subtitle">Write documentation with live preview.</p>
      </div>

      <div className="editor-toolbar">
        {toolbarActions.map((btn) => (
          <button
            key={btn.label}
            className="toolbar-btn"
            title={btn.title}
            onClick={btn.action}
          >
            {btn.label}
          </button>
        ))}
        <div className="toolbar-spacer" />
        <button
          className={`btn-save${saveStatus === 'saved' ? ' saved' : ''}`}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' && <span className="btn-spinner" />}
          {saveStatus === 'saved'  && '✓ '}
          {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="editor-split">
        <div className="editor-pane">
          <div className="pane-label">Markdown</div>
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
          />
          <div className="editor-status">
            {/* BUG 16: shows lineCount which is always 1 less than the real line count */}
            <span>{lineCount} lines</span>
            <span>{content.length} characters</span>
          </div>
        </div>

        <div className="preview-pane">
          <div className="pane-label">Preview</div>
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        </div>
      </div>
    </div>
  )
}
