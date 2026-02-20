export default function Dashboard() {
  const stats = [
    { label: 'Visitors', value: '4,231' },
    { label: 'Page Views', value: '12,847' },
    { label: 'Bounce Rate', value: '34%' },
    { label: 'Avg. Session', value: '2m 45s' },
  ]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 24px' }}>Dashboard</h1>

      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ flex: '1 1 150px', padding: 18, background: '#fff', borderRadius: 10, border: '1px solid #e5e5e5', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e5e5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#fafafa', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>Page</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>Views</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>Avg. Time</th>
            </tr>
          </thead>
          <tbody>
            {[
              { page: '/home', views: '3,421', time: '1m 30s' },
              { page: '/products', views: '2,105', time: '2m 15s' },
              { page: '/about', views: '987', time: '45s' },
            ].map((row) => (
              <tr key={row.page}>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{row.page}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{row.views}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
