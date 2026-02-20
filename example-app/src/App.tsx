import { Routes, Route } from 'react-router-dom'
import { GoSnap } from 'gosnap-widget'
import type { InspectedElement, FeedbackItem } from 'gosnap-widget'
import NavBar from './components/nav-bar'
import HomePage from './pages/home-page'
import DashboardPage from './pages/dashboard-page'
import ComponentsPage from './pages/components-page'

function App() {
  const handleInspect = (el: InspectedElement) => {
    console.log('[GoSnap] Inspected:', el.selector, `${el.dimensions.width}x${el.dimensions.height}`)
    if (el.componentInfo) {
      console.log('[GoSnap] Component:', el.componentInfo.name, el.componentInfo.treePath)
    }
  }

  const handleFeedbackSubmit = (fb: FeedbackItem) => {
    console.log(`[GoSnap] Feedback #${fb.stepNumber}:`, fb.content)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/components" element={<ComponentsPage />} />
      </Routes>

      <GoSnap
        position="bottom-right"
        theme="dark"
        persist
        defaultInspectMode="dom"
        onToggle={(active) => console.log('[GoSnap] Inspector:', active ? 'ON' : 'OFF')}
        onInspect={handleInspect}
        onFeedbackSubmit={handleFeedbackSubmit}
        onFeedbackDelete={(id) => console.log('[GoSnap] Deleted:', id)}
        onCopy={() => console.log('[GoSnap] Feedbacks copied')}
      />
    </div>
  )
}

export default App
