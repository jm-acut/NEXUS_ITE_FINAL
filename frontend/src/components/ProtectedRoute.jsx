import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EmptyState from './EmptyState'

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (role && user?.role !== role) {
    return <EmptyState title="Access denied" message="You don't have permission to view this page." />
  }
  return <Outlet />
}