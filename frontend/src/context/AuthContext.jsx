import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, tokenStore } from "../api/client.js";
import { cartCache, userCache } from "../utils/cache.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // true while we check a saved token on first load
    const [loading, setLoading] = useState(Boolean(tokenStore.get()));

    useEffect(() => {
        if (!tokenStore.get()) return undefined;
        let active = true;

        authApi
            .me()
            .then((res) => {
                if (!active) return;
                setUser(res.data.user);
                userCache.set(res.data.user);
            })
            .catch((err) => {
                if (!active) return;
                if (err.status === 401) {
                    // The server says this session is not valid
                    tokenStore.clear();
                    userCache.clear();
                    cartCache.clear();
                } else {
                    // Offline or server down: keep the saved session so cached pages stay viewable
                    const saved = userCache.get();
                    if (saved) setUser(saved);
                }
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const onExpired = () => {
            userCache.clear();
            cartCache.clear();
            setUser(null);
        };
        window.addEventListener("auth:expired", onExpired);
        return () => window.removeEventListener("auth:expired", onExpired);
    }, []);

    const login = useCallback(async (credentials) => {
        const res = await authApi.login(credentials);
        tokenStore.set(res.data.token);
        userCache.set(res.data.user);
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const register = useCallback(async (details) => {
        const res = await authApi.register(details);
        tokenStore.set(res.data.token);
        userCache.set(res.data.user);
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const logout = useCallback(() => {
        tokenStore.clear();
        userCache.clear();
        cartCache.clear();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, loading, isAdmin: user?.role === "admin", login, register, logout }),
        [user, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
    return context;
}