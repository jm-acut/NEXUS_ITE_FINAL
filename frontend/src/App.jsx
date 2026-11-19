import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import OfflineBanner from './components/OfflineBanner'
import BottomNav from './components/BottomNav'
import ReloadPrompt from './components/ReloadPrompt'
import ProtectedRoute from './components/ProtectedRoute'
import SkeletonLoader from './components/SkeletonLoader'

// Route-level code splitting (Lighthouse performance)
const Home = lazy(() => import('./pages/Home'))
const Catalog = lazy(() => import('./pages/Catalog'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const PaymentReturn = lazy(() => import('./pages/PaymentReturn'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <div className="app-shell">
      <OfflineBanner />
      <main className="app-main">
        <Suspense fallback={<SkeletonLoader count={4} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Catalog />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment/success" element={<PaymentReturn variant="success" />} />
              <Route path="/payment/cancelled" element={<PaymentReturn variant="cancelled" />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
            </Route>

            {/* Optional admin: <Route element={<ProtectedRoute role="admin" />}> <Route path="/admin/*" .../> </Route> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
      <ReloadPrompt />
    </div>
  )
}