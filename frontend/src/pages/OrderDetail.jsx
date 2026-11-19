import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ordersApi } from '../api/endpoints'
import { isCancel } from '../api/client'
import { formatPrice } from '../utils/currency'
import PageHeader from '../components/PageHeader'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorAlert from '../components/ErrorAlert'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    ordersApi
      .get(id, controller.signal)
      .then(({ data }) => setOrder(data))
      .catch((e) => {
        if (!isCancel(e)) setError(e)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  const ship = order?.shippingAddress

  return (
    <>
      <PageHeader title={`Order #${id}`} back />
      <ErrorAlert error={error} />
      {loading && <SkeletonLoader variant="row" count={3} />}
      {order && (
        <article className="stack">
          <p>
            Status: <span className={`status status-${order.status}`}>{String(order.status).replaceAll('_', ' ')}</span>
          </p>
          <ul className="stack">
            {(order.items ?? []).map((i) => (
              <li key={i.productId ?? i.id} className="order-card">
                <span>{i.name} × {i.quantity}</span>
                <span>{formatPrice(i.price)}</span>
              </li>
            ))}
          </ul>
          <section className="summary" aria-label="Order total">
            <div className="total"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </section>
          {ship && (
            <section>
              <h2>Ship to</h2>
              <p>{ship.fullName}<br />{ship.address}, {ship.city} {ship.postalCode}<br />{ship.phone}</p>
            </section>
          )}
        </article>
      )}
    </>
  )
}