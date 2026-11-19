import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleCheck, CircleX, Clock } from 'lucide-react'
import { ordersApi } from '../api/endpoints'
import { isCancel } from '../api/client'
import { useCart } from '../context/CartContext'
import { LAST_ORDER_KEY } from '../utils/constants'
import ErrorAlert from '../components/ErrorAlert'

// Informational page only: the status shown ALWAYS comes from GET /orders/:id
export default function PaymentReturn({ variant }) {
  const [params] = useSearchParams()
  const orderId = params.get('orderId') || params.get('order_id') || localStorage.getItem(LAST_ORDER_KEY)
  const { refresh } = useCart()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(Boolean(orderId))
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!orderId) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    ordersApi
      .get(orderId, controller.signal)
      .then(({ data }) => setOrder(data))
      .catch((e) => {
        if (!isCancel(e)) setError(e)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [orderId, attempt])

  const status = order?.status

  useEffect(() => {
    if (status === 'paid') refresh().catch(() => {})
  }, [status, refresh])

  let Icon = Clock
  let title = 'Checking your payment…'
  let text = ''
  if (!loading) {
    if (status === 'paid') {
      Icon = CircleCheck
      title = 'Payment confirmed'
      text = 'Thank you! Your order has been paid.'
    } else if (variant === 'cancelled') {
      Icon = CircleX
      title = 'Payment cancelled'
      text = 'Your order has not been paid.'
    } else {
      title = 'Confirming your payment'
      text = 'We have not received confirmation yet. This can take a few seconds.'
    }
  }

  return (
    <section className="empty" aria-live="polite">
      <Icon size={64} aria-hidden="true" />
      <h1>{title}</h1>
      <p>{text}</p>
      {!orderId && <p>No order found.</p>}
      {order && (
        <p>
          Order <strong>#{order.id}</strong>:{' '}
          <span className={`status status-${order.status}`}>{String(order.status).replaceAll('_', ' ')}</span>
        </p>
      )}
      <ErrorAlert error={error} />
      <div className="stack">
        {orderId && status !== 'paid' && (
          <button type="button" className="btn btn-outline" disabled={loading} onClick={() => setAttempt((a) => a + 1)}>
            Check again
          </button>
        )}
        <Link className="btn" to={orderId ? `/orders/${orderId}` : '/orders'}>View order</Link>
      </div>
    </section>
  )
}