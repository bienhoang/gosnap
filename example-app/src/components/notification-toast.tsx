interface NotificationToastProps {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
}

const colorMap = {
  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
}

export default function NotificationToast({ title, message, type = 'info' }: NotificationToastProps) {
  const colors = colorMap[type]

  return (
    <div style={{ padding: '12px 16px', borderRadius: 8, background: colors.bg, border: `1px solid ${colors.border}`, maxWidth: 320 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: colors.text }}>{title}</div>
      <div style={{ fontSize: 13, color: colors.text, opacity: 0.8, marginTop: 4 }}>{message}</div>
    </div>
  )
}
