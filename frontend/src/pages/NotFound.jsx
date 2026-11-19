import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import EmptyState from '../components/EmptyState'

export default function NotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="404: Page not found"
      message="The page you're looking for doesn't exist."
      action={<Link className="btn" to="/">Back to home</Link>}
    />
  )
}