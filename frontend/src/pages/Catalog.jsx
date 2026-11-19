import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageOpen, SlidersHorizontal } from 'lucide-react'
import { productsApi } from '../api/endpoints'
import { isCancel } from '../api/client'
import useDebounce from '../hooks/useDebounce'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import SkeletonLoader from '../components/SkeletonLoader'
import EmptyState from '../components/EmptyState'
import ErrorAlert from '../components/ErrorAlert'

const PAGE_SIZE = 8

export default function Catalog() {
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const [sort, setSort] = useState('newest')
  const [inStock, setInStock] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    productsApi
      .list(
        { search: debouncedSearch || undefined, sort, inStock: inStock || undefined, page, limit: PAGE_SIZE },
        controller.signal,
      )
      .then(({ data, meta }) => {
        setItems((prev) => (page === 1 ? data : [...prev, ...data]))
        setMeta(meta)
      })
      .catch((e) => {
        if (!isCancel(e)) setError(e)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [debouncedSearch, sort, inStock, page])

  // ASSUMPTION: meta = { page, totalPages }
  const hasMore = meta?.totalPages ? page < meta.totalPages : items.length >= page * PAGE_SIZE

  return (
    <>
      <PageHeader title="Shop" />

      <form className="search-row" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search" className="sr-only">Search products</label>
        <input
          id="search"
          type="search"
          placeholder="Search products"
          maxLength={60}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <button type="button" className="icon-btn" aria-label="Open filters" onClick={() => setDrawerOpen(true)}>
          <SlidersHorizontal size={20} aria-hidden="true" />
        </button>
      </form>

      <ErrorAlert error={error} />

      {items.length === 0 && loading ? (
        <SkeletonLoader count={6} />
      ) : items.length === 0 && !error ? (
        <EmptyState icon={PackageOpen} title="No products found" message="Try a different search or filter." />
      ) : (
        <div className="grid">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {hasMore && items.length > 0 && (
        <button type="button" className="btn btn-outline" disabled={loading} onClick={() => setPage((p) => p + 1)}>
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}

      {drawerOpen && (
        <div className="sheet-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="filters-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="filters-title">Filters</h2>
            <div className="field">
              <label htmlFor="sort">Sort by</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setPage(1)
                }}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => {
                  setInStock(e.target.checked)
                  setPage(1)
                }}
              />
              In stock only
            </label>
            <button type="button" className="btn" onClick={() => setDrawerOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </>
  )
}