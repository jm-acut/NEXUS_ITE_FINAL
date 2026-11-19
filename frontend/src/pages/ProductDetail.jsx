import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productsApi } from '../api/endpoints'
import { isCancel } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNetwork } from '../context/NetworkStatusContext'
import { formatPrice } from '../utils/currency'
import PageHeader from '../components/PageHeader'
import QuantityStepper from '../components/QuantityStepper'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorAlert from '../components/ErrorAlert'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isOnline } = useNetwork()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    productsApi
      .get(id, controller.signal)
      .then(({ data }) => setProduct(data))
      .catch((e) => {
        if (!isCancel(e)) setError(e)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }
    setAdding(true)
    setError(null)
    try {
      await addItem(product, qty)
      setAdded(true)
    } catch (e) {
      setError(e) // e.g. 409 stock conflict
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <PageHeader title={product?.name ?? 'Product'} back />
      <ErrorAlert error={error} />
      {loading && <SkeletonLoader count={1} variant="row" />}

      {product && (
        <>
          <article className="stack">
            <img className="detail-img" src={product.imageUrl} alt={product.name} width="480" height="480" decoding="async" />
            <p className="price price-lg">{formatPrice(product.price)}</p>
            <p>{product.description}</p>
            <p className="muted">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
            {added && (
              <p role="status">Added to cart. <Link to="/cart">View cart</Link></p>
            )}
          </article>

          <div className="action-bar">
            <QuantityStepper value={qty} max={product.stock || 1} onChange={setQty} />
            <button
              type="button"
              className="btn grow"
              disabled={!isOnline || adding || product.stock === 0}
              onClick={handleAdd}
            >
              {!isOnline ? 'Offline: go online to add' : adding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </>
      )}
    </>
  )
}