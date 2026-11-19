const BY_CODE = {
  COUPON_EXPIRED: 'That coupon has expired.',
  AI_UNAVAILABLE: 'The AI assistant is unavailable right now.',
}
const BY_STATUS = {
  403: "You don't have permission to do that.",
  409: 'Something changed (stock or order status). Please review and try again.',
  422: 'Please check the highlighted fields.',
  503: 'This service is temporarily unavailable.',
}

export default function ErrorAlert({ error }) {
  if (!error) return null
  const text = BY_CODE[error.code] ?? error.message ?? BY_STATUS[error.status] ?? 'Something went wrong.'
  return (
    <div className="alert" role="alert">
      <p>{text}</p>
      {error.requestId && <p className="muted">Ref: {error.requestId}</p>}
    </div>
  )
}