import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { cartApi } from '../api/endpoints'
import { isCancel } from '../api/client'
import { useAuth } from './AuthContext'
import { useNetwork } from './NetworkStatusContext'

const CartContext = createContext(null)
const CACHE_KEY = 'nexus_cart_cache'
const EMPTY = { items: [], subtotal: 0, discount: 0, total: 0 }

// ASSUMPTION: item = { productId, name, price, imageUrl, quantity }
const normalize = (d) => ({
  items: d?.items ?? [],
  subtotal: d?.subtotal ?? 0,
  discount: d?.discount ?? 0,
  total: d?.total ?? 0,
})

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? EMPTY
  } catch {
    return EMPTY
  }
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const { isOnline } = useNetwork()
  const [cart, setCart] = useState(readCache) // localStorage = untrusted cache only
  const [loading, setLoading] = useState(false)

  // Sync with the server (the source of truth) when logged in and online
  useEffect(() => {
    if (!isAuthenticated) {
      setCart(EMPTY)
      return
    }
    if (!isOnline) return
    const controller = new AbortController()
    setLoading(true)
    cartApi
      .get(controller.signal)
      .then(({ data }) => setCart(normalize(data)))
      .catch((e) => {
        if (!isCancel(e)) return // keep showing the cached cart on failure
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [isAuthenticated, isOnline])

  // Mirror to localStorage so the cart can be viewed offline
  useEffect(() => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cart))
  }, [cart])

  // Optimistic update, then replace with the server's authoritative cart (rollback on error)
  const mutate = async (optimistic, request) => {
    const previous = cart
    if (optimistic) setCart(optimistic)
    try {
      const { data } = await request()
      setCart(normalize(data))
    } catch (err) {
      setCart(previous)
      throw err
    }
  }

  const addItem = (product, quantity = 1) => mutate(null, () => cartApi.add(product.id, quantity))

  const updateQuantity = (productId, quantity) =>
    mutate(
      (c) => ({ ...c, items: c.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) }),
      () => cartApi.update(productId, quantity),
    )

  const removeItem = (productId) =>
    mutate(
      (c) => ({ ...c, items: c.items.filter((i) => i.productId !== productId) }),
      () => cartApi.remove(productId),
    )

  const refresh = useCallback(async () => {
    const { data } = await cartApi.get()
    setCart(normalize(data))
  }, [])

  const itemCount = cart.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, addItem, updateQuantity, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)