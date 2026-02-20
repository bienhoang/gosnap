import type { Metadata } from 'next'
import GoSnapWrapper from './components/gosnap-wrapper'

export const metadata: Metadata = {
  title: 'GoSnap — Next.js Example',
  description: 'GoSnap widget with Next.js App Router',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f5f5f5' }}>
        <nav style={{ display: 'flex', gap: 10, padding: '14px 32px', background: '#fff', borderBottom: '1px solid #e5e5e5' }}>
          <span style={{ fontWeight: 700, fontSize: 16, marginRight: 12, color: '#111' }}>GoSnap + Next.js</span>
          <a href="/" style={{ padding: '5px 12px', borderRadius: 6, fontSize: 14, color: '#555', textDecoration: 'none', border: '1px solid #ddd' }}>Home</a>
          <a href="/dashboard" style={{ padding: '5px 12px', borderRadius: 6, fontSize: 14, color: '#555', textDecoration: 'none', border: '1px solid #ddd' }}>Dashboard</a>
        </nav>
        {children}
        <GoSnapWrapper />
      </body>
    </html>
  )
}
