export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <section className="empty">
      {Icon && <Icon size={56} aria-hidden="true" />}
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </section>
  )
}