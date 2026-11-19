import { Minus, Plus } from 'lucide-react'

export default function QuantityStepper({ value, min = 1, max = 99, onChange, disabled }) {
  return (
    <div className="stepper" role="group" aria-label="Quantity">
      <button type="button" aria-label="Decrease quantity" disabled={disabled || value <= min} onClick={() => onChange(value - 1)}>
        <Minus size={18} aria-hidden="true" />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label="Increase quantity" disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={18} aria-hidden="true" />
      </button>
    </div>
  )
}