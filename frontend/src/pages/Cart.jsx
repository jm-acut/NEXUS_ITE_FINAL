import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNetwork } from '../context/NetworkStatusContext'
import { formatPrice } from '../utils/currency'
import PageHeader from '../components/PageHeader'
import QuantityStepper from '../components/QuantityStepper'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isOnline } = useNetwork()
  const { cart, loading, updateQuantity, removeItem } = useCart()
  const [error, setError] = useState(null)

  const run = async (fn) => {
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(e)
    }
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Log in to see your cart"
        message="Your cart is saved to your account."
        action={<Link className="btn" to="/login" state={{ from: '/cart' }}>Log in</Link>}
      />
    )
  }

  return (
    <>
      <PageHeader title="Your cart" />
      <ErrorAlert error={error} />

      {loading && cart.items.length === 0 ? (
        <SkeletonLoader variant="row" count={3} />
      ) : cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add something you like and it will show up here."
          action={<Link className="btn" to="/products">Start shopping</Link>}
        />
      ) : (
        <>
          <ul className="stack">
            {cart.items.map((item) => (
              <li key={item.productId} className="row-card">
                <img src={item.imageUrl} alt={item.name} width="72" height="72" loading="lazy" />
                <div>
                  <h2 className="item-name">{item.name}</h2>
                  <p className="price">{formatPrice(item.price)}</p>
                  <QuantityStepper
                    value={item.quantity}
                    disabled={!isOnline}
                    onChange={(q) => run(() => updateQuantity(item.productId, q))}
                  />
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove ${item.name}`}
                  disabled={!isOnline}
                  onClick={() => run(() => removeItem(item.productId))}
                >
                  <Trash2 size={20} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          {/* Totals come from the server response, not computed here */}
          <section className="summary" aria-label="Order summary">
            <div><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div>
            {cart.discount > 0 && <div><span>Discount</span><span>-{formatPrice(cart.discount)}</span></div>}
            <div className="total"><span>Total</span><span>{formatPrice(cart.total)}</span></div>
          </section>

          <div className="action-bar">
            <button type="button" className="btn grow" disabled={!isOnline} onClick={() => navigate('/checkout')}>
              {isOnline ? 'Checkout' : 'Offline: checkout unavailable'}
            </button>
          </div>
        </>
      )}
    </>
  )
}