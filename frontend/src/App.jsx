import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";

// Route-level code splitting (React.lazy). Each page becomes its own JS chunk.
const Home = lazy(() => import("./pages/Home.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                {/* More routes are added in the next steps */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}