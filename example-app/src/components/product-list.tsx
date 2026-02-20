interface Product {
  id: number
  name: string
  price: string
  category: string
}

const products: Product[] = [
  { id: 1, name: 'Wireless Headphones', price: '$79.99', category: 'Audio' },
  { id: 2, name: 'Mechanical Keyboard', price: '$129.00', category: 'Peripherals' },
  { id: 3, name: 'USB-C Hub', price: '$45.00', category: 'Accessories' },
  { id: 4, name: '4K Monitor', price: '$399.00', category: 'Displays' },
]

function ProductRow({ product }: { product: Product }) {
  return (
    <tr>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{product.name}</td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>{product.price}</td>
      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, background: '#f0f0ff', color: '#4338ca' }}>
          {product.category}
        </span>
      </td>
    </tr>
  )
}

export default function ProductList() {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e5e5', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#fafafa', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', fontWeight: 600 }}>Product</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', fontWeight: 600 }}>Price</th>
            <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', fontWeight: 600 }}>Category</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => <ProductRow key={p.id} product={p} />)}
        </tbody>
      </table>
    </div>
  )
}
