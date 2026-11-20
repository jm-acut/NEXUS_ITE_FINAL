// Local copies used ONLY for showing things offline. They are untrusted:
// the server decides prices, stock, totals and who you are.
const USER_KEY = "nexus_user_cache";
const CART_KEY = "nexus_cart_cache";

function makeCache(key) {
    return {
        get() {
            try {
                return JSON.parse(localStorage.getItem(key));
            } catch {
                return null;
            }
        },
        set(value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch {
                /* storage full or blocked: skip */
            }
        },
        clear() {
            try {
                localStorage.removeItem(key);
            } catch {
                /* ignore */
            }
        }
    };
}

export const userCache = makeCache(USER_KEY);
export const cartCache = makeCache(CART_KEY);