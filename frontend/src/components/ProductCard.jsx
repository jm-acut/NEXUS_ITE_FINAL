import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/currency'

export default function ProductCard({ product }) {
  return (
    <article className="card">
      <Link to={`/products/${product.id}`} className="card-link">
        <img src={product.imageUrl} alt={product.name} width="300" height="300" loading="lazy" decoding="async" />
        <h3>{product.name}</h3>
      </Link>
      <p className="price">{formatPrice(product.price)}</p>
      {product.stock === 0 && <p className="muted card-note">Out of stock</p>}
    </article>
  )
}