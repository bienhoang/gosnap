import ContactForm from '../components/contact-form'
import ModalDialog from '../components/modal-dialog'
import UserCard from '../components/user-card'
import NotificationToast from '../components/notification-toast'

export default function ComponentsPage() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Components Showcase</h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: 15 }}>
        All custom React components — switch to <strong>Component</strong> inspect mode to see boundaries and props.
      </p>

      {/* Contact Form */}
      <Section title="ContactForm">
        <ContactForm />
      </Section>

      {/* Modal */}
      <Section title="ModalDialog">
        <ModalDialog triggerLabel="Open Sample Modal" />
      </Section>

      {/* Cards with different props */}
      <Section title="UserCard (different props)">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <UserCard name="Dan Lee" role="CTO" email="dan@startup.io" />
          <UserCard name="Eve Zhang" role="Security Engineer" email="eve@corp.dev" />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="NotificationToast (all types)">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <NotificationToast type="info" title="Info" message="Check this out" />
          <NotificationToast type="success" title="Done" message="All green" />
          <NotificationToast type="warning" title="Heads up" message="Watch out" />
          <NotificationToast type="error" title="Failed" message="Something broke" />
        </div>
      </Section>

      {/* Nested composition */}
      <Section title="Nested Composition">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 250, padding: 16, background: '#fafafa', borderRadius: 10, border: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 14, color: '#888' }}>Card inside container</h4>
            <UserCard name="Nested User" role="Tester" email="nested@test.com" />
          </div>
          <div style={{ flex: 1, minWidth: 250, padding: 16, background: '#fafafa', borderRadius: 10, border: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 14, color: '#888' }}>Toast inside container</h4>
            <NotificationToast type="success" title="Nested" message="Inside a wrapper div" />
          </div>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px', color: '#111' }}>
        <code style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: 4, fontSize: 14 }}>{title}</code>
      </h2>
      {children}
    </div>
  )
}
