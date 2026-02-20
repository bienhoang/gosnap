import StatCard from '../components/stat-card'
import ProductList from '../components/product-list'

export default function DashboardPage() {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Dashboard</h1>
      <p style={{ color: '#666', margin: '0 0 28px', fontSize: 15 }}>
        Stats and product data — test component inspect on <code>StatCard</code> and <code>ProductList</code>.
      </p>

      {/* Stats row — tests StatCard component boundary */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Total Users" value="2,847" trend="up" />
        <StatCard label="Active Sessions" value="142" trend="up" />
        <StatCard label="Revenue" value="$18,430" trend="down" />
        <StatCard label="Conversion" value="3.2%" />
      </div>

      {/* Product table — tests nested ProductRow components */}
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 14px', color: '#111' }}>Products</h2>
      <ProductList />

      {/* Action bar */}
      <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
        <button style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#111', color: '#fff', cursor: 'pointer', fontSize: 14 }}>
          Export CSV
        </button>
        <button style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}>
          Refresh
        </button>
        <select style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 }}>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>All time</option>
        </select>
      </div>
    </div>
  )
}
