export default function Home() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Next.js + GoSnap</h1>
      <p style={{ color: '#666', margin: '0 0 24px', fontSize: 15 }}>
        Server-rendered page with GoSnap widget. Toggle <strong>Component</strong> mode in Settings to inspect React components.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { title: 'Server Components', desc: 'This page is a React Server Component' },
          { title: 'Client Widget', desc: 'GoSnap runs as a client component' },
          { title: 'App Router', desc: 'Using Next.js 15 App Router' },
        ].map((item) => (
          <div key={item.title} style={{ padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e5e5e5' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, color: '#111' }}>{item.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e5e5e5' }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Sample Form</h2>
        <form style={{ display: 'flex', gap: 10 }}>
          <input style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }} placeholder="Search..." />
          <button type="submit" style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: 14 }}>
            Search
          </button>
        </form>
      </div>
    </div>
  )
}
