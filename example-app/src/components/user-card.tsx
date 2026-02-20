interface UserCardProps {
  name: string
  role: string
  email: string
  avatar?: string
}

export default function UserCard({ name, role, email, avatar }: UserCardProps) {
  const initials = name.split(' ').map((n) => n[0]).join('')

  return (
    <div style={{ display: 'flex', gap: 14, padding: 16, background: '#fff', borderRadius: 10, border: '1px solid #e5e5e5', alignItems: 'center' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: avatar ? `url(${avatar})` : '#6366f1',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 16,
        backgroundSize: 'cover',
      }}>
        {!avatar && initials}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>{name}</div>
        <div style={{ fontSize: 13, color: '#888' }}>{role}</div>
        <div style={{ fontSize: 12, color: '#6366f1' }}>{email}</div>
      </div>
    </div>
  )
}
