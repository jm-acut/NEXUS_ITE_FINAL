export default function FormField({ id, label, error, as: Tag = 'input', ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  )
}