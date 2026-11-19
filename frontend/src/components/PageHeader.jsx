import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function PageHeader({ title, back = false }) {
  const navigate = useNavigate()
  return (
    <header className="page-header">
      {back && (
        <button type="button" className="icon-btn" aria-label="Go back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
      )}
      <h1>{title}</h1>
    </header>
  )
}