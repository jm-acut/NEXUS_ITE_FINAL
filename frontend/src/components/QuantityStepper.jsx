import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({ value, min = 1, max = 99, onChange, disabled = false, label = "Quantity" }) {
    return (
        <div className="stepper" role="group" aria-label={label}>
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={disabled || value <= min}
                aria-label="Decrease quantity"
            >
                <Minus size={18} aria-hidden="true" />
            </button>
            <span aria-live="polite">{value}</span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={disabled || value >= max}
                aria-label="Increase quantity"
            >
                <Plus size={18} aria-hidden="true" />
            </button>
        </div>
    );
}