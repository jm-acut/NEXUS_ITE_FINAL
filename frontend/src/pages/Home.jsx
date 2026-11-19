import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productsApi } from '../api/endpoints'
import { isCancel } from '../api/client'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorAlert from '../components/ErrorAlert'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    productsApi
      .list({ limit: 6, featured: true }, controller.signal) // ASSUMPTION: featured/limit params
      .then(({ data }) => setProducts(data))
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
      <header className="hero">
        <h1>NEXUS</h1>
        <p>Shop smarter, right from your phone.</p>
        <Link className="btn" to="/products">Browse products</Link>
      </header>

      <section aria-labelledby="featured-title">
        <h2 id="featured-title">Featured</h2>
        <ErrorAlert error={error} />
        {loading ? (
          <SkeletonLoader count={4} />
        ) : (
          <div className="grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <footer className="footer">© NEXUS Store</footer>
    </>
  )
}