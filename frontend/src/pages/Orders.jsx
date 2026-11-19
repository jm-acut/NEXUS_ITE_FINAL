import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import { ordersApi } from '../api/endpoints'
import { isCancel } from '../api/client'
import { formatPrice } from '../utils/currency'
import PageHeader from '../components/PageHeader'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    ordersApi
      .list(controller.signal)
      .then(({ data }) => setOrders(data))
      .catch((e) => {
        if (!isCancel(e)) setError(e)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <>
      <PageHeader title="My orders" />
      <ErrorAlert error={error} />
      {loading ? (
        <SkeletonLoader variant="row" count={3} />
      ) : orders.length === 0 && !error ? (
        <EmptyState
          icon={PackageOpen}
          title="No orders yet"
          message="Your orders will appear here."
          action={<Link className="btn" to="/products">Start shopping</Link>}
        />
      ) : (
        <ul className="stack">
          {orders.map((o) => (
            <li key={o.id}>
              <Link className="order-card" to={`/orders/${o.id}`}>
                <span>
                  <strong>Order #{o.id}</strong>
                  <br />
                  <span className={`status status-${o.status}`}>{String(o.status).replaceAll('_', ' ')}</span>
                </span>
                <span className="price">{formatPrice(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}