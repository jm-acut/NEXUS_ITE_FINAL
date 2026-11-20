import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartApi } from "../api/client.js";
import { cartCache } from "../utils/cache.js";
import { useAuth } from "./AuthContext.jsx";
import { useNetworkStatus } from "./NetworkStatusContext.jsx";

const EMPTY_CART = { items: [], itemCount: 0, subtotalCents: 0, hasIssues: false };

const CartContext = createContext(null);

const readSaved = (userId) => {
    const saved = cartCache.get();
    return saved?.userId === userId ? saved.cart : null;
};

export function CartProvider({ children }) {
    const { user } = useAuth();
    const { online } = useNetworkStatus();
    const userId = user?.id;

    const [cart, setCart] = useState(EMPTY_CART);
    const [loading, setLoading] = useState(false);
    // true when the cart on screen is the saved copy, not a fresh server answer
    const [stale, setStale] = useState(false);

    // Load the cart from the server whenever the signed-in user changes.
    useEffect(() => {
        if (!userId) {
            setCart(EMPTY_CART);
            setStale(false);
            return undefined;
        }
        let active = true;
        setLoading(true);

        cartApi
            .get()
            .then((res) => {
                if (!active) return;
                setCart(res.data);
                setStale(false);
                cartCache.set({ userId, cart: res.data });
            })
            .catch(() => {
                if (!active) return;
                const saved = readSaved(userId);
                if (saved) {
                    setCart(saved);
                    setStale(true);
                }
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [userId]);

    // Back online while showing the saved copy: fetch the real cart.
    useEffect(() => {
        if (!online || !stale || !userId) return undefined;
        let active = true;

        cartApi
            .get()
            .then((res) => {
                if (!active) return;
                setCart(res.data);
                setStale(false);
                cartCache.set({ userId, cart: res.data });
            })
            .catch(() => {});

        return () => {
            active = false;
        };
    }, [online, stale, userId]);

    // Every action returns the full updated cart from the server, so the screen matches the database.
    const run = useCallback(
        async (request) => {
            const res = await request();
            setCart(res.data);
            setStale(false);
            if (userId) cartCache.set({ userId, cart: res.data });
            return res.data;
        },
        [userId]
    );

    const value = useMemo(
        () => ({
            cart,
            loading,
            stale,
            refresh: () => run(() => cartApi.get()),
            addItem: (productId, quantity = 1) => run(() => cartApi.add({ productId, quantity })),
            setQuantity: (productId, quantity) => run(() => cartApi.setQuantity(productId, quantity)),
            removeItem: (productId) => run(() => cartApi.remove(productId)),
            clearCart: () => run(() => cartApi.clear())
        }),
        [cart, loading, stale, run]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside <CartProvider>");
    return context;
}