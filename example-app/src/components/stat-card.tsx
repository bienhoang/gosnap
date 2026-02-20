interface StatCardProps {
  label: string
  value: string
  trend?: 'up' | 'down'
}

export default function StatCard({ label, value, trend }: StatCardProps) {
  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#888'

  return (
    <div style={{ flex: '1 1 160px', padding: 20, background: '#fff', borderRadius: 10, border: '1px solid #e5e5e5' }}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 12, color: trendColor, marginTop: 4 }}>
          {trend === 'up' ? '↑ +12%' : '↓ -5%'} vs last week
        </div>
      )}
    </div>
  )
}
