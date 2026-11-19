import { NavLink } from 'react-router-dom'
import { House, Store, Sparkles, ShoppingCart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const { itemCount } = useCart()
  const { isAuthenticated } = useAuth()

  const links = [
    { to: '/', label: 'Home', icon: House, end: true },
    { to: '/products', label: 'Shop', icon: Store },
    { to: '/ai-assistant', label: 'AI', icon: Sparkles },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
    { to: isAuthenticated ? '/orders' : '/login', label: isAuthenticated ? 'Orders' : 'Login', icon: User },
  ]

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {links.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">
            <Icon size={22} aria-hidden="true" />
            {badge > 0 && <span className="badge" aria-label={`${badge} items in cart`}>{badge}</span>}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}