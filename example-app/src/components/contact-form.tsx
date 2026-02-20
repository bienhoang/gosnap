import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const inputStyle = { padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, width: '100%', boxSizing: 'border-box' as const }

  return (
    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Name</label>
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Email</label>
        <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Message</label>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the issue..." />
      </div>
      <button
        type="submit"
        style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start' }}
      >
        Send Feedback
      </button>
    </form>
  )
}
