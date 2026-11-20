// Turns an ApiError into a short message a shopper can understand.
export function friendlyError(err) {
    if (!err) return "Something went wrong. Please try again.";
    if (err.code === "OFFLINE") return err.message;
    if (err.status === 401 && ["TOKEN_EXPIRED", "INVALID_TOKEN"].includes(err.code)) {
        return "Your session expired. Please sign in again.";
    }
    if (err.status === 403) return "You don't have permission to do that.";
    if (err.status === 409) return err.message || "That item changed while you were shopping. Please review your cart.";
    if (err.status === 503 && err.code === "AI_UNAVAILABLE") {
        return "The AI assistant is unavailable right now. You can use regular search instead.";
    }
    if (err.status >= 500) return "The server had a problem. Please try again in a moment.";
    return err.message || "Something went wrong. Please try again.";
}