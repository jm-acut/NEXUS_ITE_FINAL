import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, PackageX, Search, SlidersHorizontal } from "lucide-react";
import { catalogApi, isAbort } from "../api/client.js";
import useDebounce from "../hooks/useDebounce.js";
import ProductCard from "../components/ProductCard.jsx";
import SkeletonLoader from "../components/SkeletonLoader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FilterSheet from "../components/FilterSheet.jsx";
import { friendlyError } from "../utils/errors.js";

const PAGE_SIZE = 12;
const pesosToCents = (value) => (value === "" ? undefined : Math.round(Number(value) * 100));

export default function Products() {
    // The URL is the single source of truth for filters, so links can be shared and Back works.
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get("page")) || 1);
    const search = params.get("search") ?? "";
    const category = params.get("category") ?? "";
    const sort = params.get("sort") ?? "newest";
    const min = params.get("min") ?? "";
    const max = params.get("max") ?? "";

    const [categories, setCategories] = useState([]);
    const [result, setResult] = useState({ items: null, meta: null });
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Typing feels instant; the URL (and the API call) update after a short pause.
    const [searchText, setSearchText] = useState(search);
    const debouncedSearch = useDebounce(searchText.trim(), 400);

    // Functional update, so a pending change can never overwrite a filter changed meanwhile.
    const update = (patch, { keepPage = false } = {}) => {
        setParams(
            (current) => {
                const next = new URLSearchParams(current);
                for (const [key, value] of Object.entries(patch)) {
                    if (value === "" || value === undefined || value === null) next.delete(key);
                    else next.set(key, String(value));
                }
                if (!keepPage) next.delete("page");
                return next;
            },
            { replace: true }
        );
    };

    useEffect(() => {
        if (debouncedSearch !== search) update({ search: debouncedSearch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        catalogApi
            .categories(controller.signal)
            .then((res) => setCategories(res.data))
            .catch(() => {});
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setResult((prev) => ({ ...prev, items: null }));
        setError("");

        catalogApi
            .products(
                {
                    page,
                    limit: PAGE_SIZE,
                    search,
                    category,
                    sort,
                    minPriceCents: pesosToCents(min),
                    maxPriceCents: pesosToCents(max)
                },
                controller.signal
            )
            .then((res) => setResult({ items: res.data, meta: res.meta }))
            .catch((err) => {
                if (!isAbort(err)) setError(friendlyError(err));
            });

        return () => controller.abort();
    }, [page, search, category, sort, min, max, reloadKey]);

    const { items, meta } = result;
    const activeFilters = (min !== "" || max !== "" ? 1 : 0) + (sort !== "newest" ? 1 : 0);
    const hasQuery = Boolean(search || category || min || max);

    const applyFilters = (values) => {
        update({ sort: values.sort === "newest" ? "" : values.sort, min: values.min, max: values.max });
        setSheetOpen(false);
    };

    const clearFilters = () => {
        setSearchText("");
        setParams({}, { replace: true });
    };

    return (
        <>
            <header className="page-head">
                <h1>Shop</h1>
                <p aria-live="polite">
                    {meta ? `${meta.total} ${meta.total === 1 ? "product" : "products"}` : "Loading products..."}
                </p>
            </header>

            <form className="toolbar" role="search" onSubmit={(e) => e.preventDefault()}>
                <label className="search-field">
                    <Search size={18} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search name or brand"
                        value={searchText}
                        maxLength={60}
                        onChange={(e) => setSearchText(e.target.value)}
                        aria-label="Search products"
                    />
                </label>
                <button type="button" className="btn btn-ghost" onClick={() => setSheetOpen(true)}>
                    <SlidersHorizontal size={18} aria-hidden="true" />
                    Filter
                    {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
                </button>
            </form>

            <div className="pill-scroll" role="group" aria-label="Filter by category">
                <button
                    type="button"
                    className={`pill${category === "" ? " is-active" : ""}`}
                    aria-pressed={category === ""}
                    onClick={() => update({ category: "" })}
                >
                    All
                </button>
                {categories.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        className={`pill${category === c.slug ? " is-active" : ""}`}
                        aria-pressed={category === c.slug}
                        onClick={() => update({ category: c.slug })}
                    >
                        {c.name}
                    </button>
                ))}
            </div>

            {error ? (
                <div className="notice notice-error" role="alert">
                    <p>{error}</p>
                    <button type="button" className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
                        Try again
                    </button>
                </div>
            ) : items === null ? (
                <SkeletonLoader count={6} />
            ) : items.length === 0 ? (
                <EmptyState icon={PackageX} title="No products match" text="Try a different search or remove a filter.">
                    {hasQuery && (
                        <button type="button" className="btn btn-primary" onClick={clearFilters}>
                            Clear filters
                        </button>
                    )}
                </EmptyState>
            ) : (
                <ul className="product-grid">
                    {items.map((product) => (
                        <li key={product.id}>
                            <ProductCard product={product} />
                        </li>
                    ))}
                </ul>
            )}

            {meta && meta.totalPages > 1 && !error && (
                <nav className="pagination" aria-label="Pagination">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={page <= 1}
                        onClick={() => update({ page: page - 1 }, { keepPage: true })}
                    >
                        <ChevronLeft size={18} aria-hidden="true" /> Prev
                    </button>
                    <span>Page {meta.page} of {meta.totalPages}</span>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={page >= meta.totalPages}
                        onClick={() => update({ page: page + 1 }, { keepPage: true })}
                    >
                        Next <ChevronRight size={18} aria-hidden="true" />
                    </button>
                </nav>
            )}

            {sheetOpen && (
                <FilterSheet
                    initial={{ sort, min, max }}
                    onApply={applyFilters}
                    onClose={() => setSheetOpen(false)}
                />
            )}
        </>
    );
}