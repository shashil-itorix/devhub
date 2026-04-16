import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ApiReference from './components/ApiReference'
import Playground from './components/Playground'
import Editor from './components/Editor'
import Changelog from './components/Changelog'
import Analytics from './components/Analytics'
import ThemeSettings from './components/ThemeSettings'
import SearchBar from './components/SearchBar'

export default function App() {
  const [activePage, setActivePage] = useState('api-reference')
  const [version, setVersion] = useState('v2')
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // BUG 18: pageViews object is initialized once and NEVER updated when the user
  // navigates between pages. The Analytics dashboard will always show the same
  // stale counts no matter how many pages the user visits.
  const [pageViews] = useState({
    'api-reference': 42,
    'playground': 18,
    'editor': 7,
    'changelog': 23,
    'analytics': 12,
    'theme': 5,
  })

  const navigate = (page) => {
    setActivePage(page)
    setSearchOpen(false)
    // The line below should increment pageViews[page] but is intentionally absent:
    // setPageViews(prev => ({ ...prev, [page]: prev[page] + 1 }))
  }

  const renderPage = () => {
    switch (activePage) {
      case 'api-reference': return <ApiReference version={version} />
      case 'playground':    return <Playground version={version} />
      case 'editor':        return <Editor />
      case 'changelog':     return <Changelog />
      case 'analytics':     return <Analytics pageViews={pageViews} />
      case 'theme':         return <ThemeSettings darkMode={darkMode} setDarkMode={setDarkMode} />
      default:              return <ApiReference version={version} />
    }
  }

  return (
    // BUG 27: The `darkMode` state is passed to Sidebar (which adds a .dark class
    // to itself), but the main content wrapper here never receives a dark class.
    // Toggling dark mode visually changes the sidebar but leaves the main area white.
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        navigate={navigate}
        version={version}
        setVersion={setVersion}
        darkMode={darkMode}
      />
      <div className="main-wrapper">
        <header className="top-bar">
          <SearchBar
            query={searchQuery}
            setQuery={setSearchQuery}
            open={searchOpen}
            setOpen={setSearchOpen}
            version={version}
            navigate={navigate}
          />
          <div className="top-bar-actions">
            <span className="version-pill">{version}</span>
          </div>
        </header>
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
