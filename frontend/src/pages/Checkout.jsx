import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { checkoutApi } from '../api/endpoints'
import { useCart } from '../context/CartContext'
import { useNetwork } from '../context/NetworkStatusContext'
import { formatPrice } from '../utils/currency'
import { newIdempotencyKey } from '../utils/idempotency'
import { validateShipping, fieldErrorsFromApi } from '../utils/validators'
import { LAST_ORDER_KEY } from '../utils/constants'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'

const INITIAL = { fullName: '', phone: '', address: '', city: '', postalCode: '' }

export default function Checkout() {
  const { cart } = useCart()
  const { isOnline } = useNetwork()
  const [form, setForm] = useState(INITIAL)
  const [coupon, setCoupon] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    const v = validateShipping(form)
    setErrors(v)
    setApiError(null)
    if (Object.keys(v).length) return

    setSubmitting(true) // button stays disabled while the request is in flight
    try {
      const key = newIdempotencyKey() // one unique key per checkout attempt
      const { data } = await checkoutApi.create(
        { shippingAddress: form, couponCode: coupon.trim() || undefined }, // ASSUMPTION: body field names
        key,
      )
      if (data.orderId) localStorage.setItem(LAST_ORDER_KEY, String(data.orderId))
      window.location.href = data.checkoutUrl // hosted PayMongo/Maya page
    } catch (err) {
      setApiError(err) // 409 stock conflict, 422 COUPON_EXPIRED / field errors...
      if (err.status === 422) setErrors(fieldErrorsFromApi(err.details))
      setSubmitting(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out"
        message="Your cart is empty."
        action={<Link className="btn" to="/products">Browse products</Link>}
      />
    )
  }

  return (
    <>
      <PageHeader title="Checkout" back />
      <form className="stack" onSubmit={handleSubmit} noValidate>
        <h2>Shipping details</h2>
        <FormField id="fullName" label="Full name" autoComplete="name" value={form.fullName} onChange={onChange} error={errors.fullName} />
        <FormField id="phone" label="Mobile number" type="tel" autoComplete="tel" value={form.phone} onChange={onChange} error={errors.phone} />
        <FormField id="address" label="Street address" autoComplete="street-address" value={form.address} onChange={onChange} error={errors.address} />
        <FormField id="city" label="City" autoComplete="address-level2" value={form.city} onChange={onChange} error={errors.city} />
        <FormField id="postalCode" label="Postal code" inputMode="numeric" maxLength={4} autoComplete="postal-code" value={form.postalCode} onChange={onChange} error={errors.postalCode} />

        <h2>Coupon</h2>
        <FormField id="couponCode" label="Coupon code (optional)" maxLength={30} value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} error={errors.couponCode} />

        <ErrorAlert error={apiError} />

        <section className="summary" aria-label="Order summary">
          <div><span>Subtotal</span><span>{formatPrice(cart.subtotal)}</span></div>
          <div className="total"><span>Total</span><span>{formatPrice(cart.total)}</span></div>
          <p className="muted">The final amount (including any coupon) is confirmed by the server.</p>
        </section>

        <div className="action-bar">
          <button type="submit" className="btn grow" disabled={!isOnline || submitting}>
            {!isOnline ? 'Offline: checkout unavailable' : submitting ? 'Redirecting to payment…' : 'Place order & pay'}
          </button>
        </div>
      </form>
    </>
  )
}