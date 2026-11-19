export default function SkeletonLoader({ count = 4, variant = 'card' }) {
  return (
    <div className={variant === 'card' ? 'grid' : 'stack'} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton skeleton-${variant}`} />
      ))}
    </div>
  )
}