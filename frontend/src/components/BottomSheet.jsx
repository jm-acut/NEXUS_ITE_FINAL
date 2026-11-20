import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// A slide-up drawer. Closes on backdrop tap, the X button, or the Escape key.
export default function BottomSheet({ title, onClose, children }) {
    const sheetRef = useRef(null);
    const closeRef = useRef(onClose);

    useEffect(() => {
        closeRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const onKey = (event) => {
            if (event.key === "Escape") closeRef.current();
        };
        document.addEventListener("keydown", onKey);

        // Lock page scroll behind the sheet, then restore it
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        sheetRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <div className="sheet-root">
            <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
            <section
                className="sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sheet-title"
                tabIndex={-1}
                ref={sheetRef}
            >
                <div className="sheet-grab" aria-hidden="true" />
                <header className="sheet-head">
                    <h2 id="sheet-title">{title}</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
                        <X size={22} aria-hidden="true" />
                    </button>
                </header>
                <div className="sheet-body">{children}</div>
            </section>
        </div>
    );
}