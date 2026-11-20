import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, PackageX, ShoppingCart } from "lucide-react";
import { catalogApi, isAbort } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useNetworkStatus } from "../context/NetworkStatusContext.jsx";
import EmptyState from "../components/EmptyState.jsx";
import QuantityStepper from "../components/QuantityStepper.jsx";
import { categoryIcon, formatPrice, SPEC_LABELS, stockStatus } from "../utils/format.js";
import { friendlyError } from "../utils/errors.js";

export default function ProductDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addItem } = useCart();
    const { online } = useNetworkStatus();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: "success" | "error", text }

    useEffect(() => {
        const controller = new AbortController();
        setProduct(null);
        setError(null);
        setQuantity(1);
        setFeedback(null);

        catalogApi
            .product(id, controller.signal)
            .then((res) => setProduct(res.data))
            .catch((err) => {
                if (!isAbort(err)) setError(err);
            });

        return () => controller.abort();
    }, [id]);

    const handleAdd = async () => {
        if (!user) {
            navigate("/login", { state: { from: location.pathname } });
            return;
        }
        setAdding(true);
        setFeedback(null);
        try {
            await addItem(product.id, quantity);
            setFeedback({ type: "success", text: `Added ${quantity} to your cart.` });
        } catch (err) {
            if (err.status === 401) {
                navigate("/login", { state: { from: location.pathname } });
                return;
            }
            setFeedback({ type: "error", text: friendlyError(err) });
        } finally {
            setAdding(false);
        }
    };

    if (error) {
        const missing = error.status === 404 || error.status === 422;
        return (
            <EmptyState
                icon={PackageX}
                title={missing ? "Product not found" : "Could not load this product"}
                text={missing ? "It may have been removed or is no longer sold." : friendlyError(error)}
            >
                <Link to="/products" className="btn btn-primary">Back to shop</Link>
            </EmptyState>
        );
    }

    if (!product) {
        return (
            <div className="detail" aria-busy="true" aria-label="Loading product">
                <div className="detail-media is-skeleton" />
                <span className="sk sk-short" />
                <span className="sk sk-long" style={{ marginTop: 10 }} />
                <span className="sk sk-mid" style={{ marginTop: 10 }} />
            </div>
        );
    }

    const Icon = categoryIcon(product.category?.slug);
    const status = stockStatus(product.stock);
    const maxQty = Math.min(product.stock, 99);
    const soldOut = product.stock <= 0;
    const specs = Object.entries(product.specs ?? {});

    let buttonLabel = "Add to cart";
    if (soldOut) buttonLabel = "Out of stock";
    else if (!online) buttonLabel = "Offline";
    else if (adding) buttonLabel = "Adding...";

    return (
        <article className="detail">
            <Link to="/products" className="back-link">
                <ChevronLeft size={18} aria-hidden="true" /> All products
            </Link>

            <div className="detail-media">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} width="640" height="480" decoding="async" />
                ) : (
                    <Icon size={88} strokeWidth={1.25} aria-hidden="true" />
                )}
            </div>

            <header className="detail-head">
                <p className="product-meta">{product.brand ?? product.category?.name}</p>
                <h1>{product.name}</h1>
                <div className="detail-price">
                    <strong className="price price-lg">{formatPrice(product.priceCents)}</strong>
                    <span className={`stock stock-${status.tone}`}>{status.label}</span>
                </div>
            </header>

            {product.description && <p className="detail-desc">{product.description}</p>}

            {specs.length > 0 && (
                <section aria-labelledby="spec-title">
                    <h2 id="spec-title">Specifications</h2>
                    <dl className="spec-table">
                        {specs.map(([key, value]) => (
                            <div key={key}>
                                <dt>{SPEC_LABELS[key] ?? key}</dt>
                                <dd>{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            <div className="action-bar">
                {!online && <p className="hint">You're offline. Reconnect to add items to your cart.</p>}
                {feedback && (
                    <p className={`feedback feedback-${feedback.type}`} role="status">
                        {feedback.text}{" "}
                        {feedback.type === "success" && <Link to="/cart" className="link">View cart</Link>}
                    </p>
                )}
                <div className="action-row">
                    <QuantityStepper
                        value={quantity}
                        max={Math.max(1, maxQty)}
                        onChange={setQuantity}
                        disabled={soldOut}
                    />
                    <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleAdd}
                        disabled={soldOut || adding || !online}
                        title={!online ? "Adding to cart needs an internet connection" : undefined}
                    >
                        <ShoppingCart size={18} aria-hidden="true" /> {buttonLabel}
                    </button>
                </div>
            </div>
        </article>
    );
}