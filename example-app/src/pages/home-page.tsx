import UserCard from '../components/user-card'
import NotificationToast from '../components/notification-toast'

export default function HomePage() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>GoSnap Example</h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: 15 }}>
        Test the widget and <strong>Component X-Ray</strong> inspect mode. Use the X-Ray button (Cmd+Shift+X) to toggle.
      </p>

      {/* Instruction card */}
      <div style={{ padding: 24, background: '#fff', borderRadius: 10, border: '1px solid #e5e5e5', marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Quick Start</h2>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, fontSize: 14, color: '#444' }}>
          <li>Click the GoSnap button (bottom-right) to expand toolbar</li>
          <li>Click <strong>Start</strong> to activate the inspector</li>
          <li>Hover elements — see CSS selectors and dimensions</li>
          <li>Click the <strong>X-Ray</strong> button (ScanEye icon) or press <kbd style={{ padding: '2px 6px', background: '#f0f0f0', borderRadius: 3, fontSize: 12 }}>Cmd+Shift+X</kbd> to switch to Component mode</li>
          <li>Now hover to see React component names, props, and boundaries</li>
          <li>Click an element → type feedback → submit (Cmd+Enter)</li>
          <li>Press <kbd style={{ padding: '2px 6px', background: '#f0f0f0', borderRadius: 3, fontSize: 12 }}>Cmd+Shift+C</kbd> to copy all feedbacks</li>
        </ol>
      </div>

      {/* Team section — tests nested components */}
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 14px', color: '#111' }}>Team</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 28 }}>
        <UserCard name="Alice Chen" role="Frontend Engineer" email="alice@example.com" />
        <UserCard name="Bob Kim" role="Designer" email="bob@example.com" />
        <UserCard name="Carol Wu" role="Product Manager" email="carol@example.com" />
      </div>

      {/* Notification section — tests variant props */}
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 14px', color: '#111' }}>Notifications</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <NotificationToast type="success" title="Deploy complete" message="v1.0.1 deployed to production" />
        <NotificationToast type="warning" title="Slow query" message="Dashboard query taking >2s" />
        <NotificationToast type="error" title="Build failed" message="TypeScript errors in 3 files" />
        <NotificationToast type="info" title="New feature" message="Component X-Ray mode is now available" />
      </div>
    </div>
  )
}
