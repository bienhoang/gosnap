import { Link, useLocation } from 'react-router-dom'

const routes = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/components', label: 'Components' },
]

export default function NavBar() {
  const { pathname } = useLocation()

  return (
    <nav style={{ display: 'flex', gap: 8, padding: '16px 40px', background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
      <span style={{ fontWeight: 700, fontSize: 16, marginRight: 16, color: '#111' }}>GoSnap Demo</span>
      {routes.map((r) => (
        <Link
          key={r.path}
          to={r.path}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 14,
            textDecoration: 'none',
            background: pathname === r.path ? '#111' : 'transparent',
            color: pathname === r.path ? '#fff' : '#555',
            border: pathname === r.path ? 'none' : '1px solid #ddd',
          }}
        >
          {r.label}
        </Link>
      ))}
    </nav>
  )
}
