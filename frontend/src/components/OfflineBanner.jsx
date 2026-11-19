import { WifiOff } from 'lucide-react'
import { useNetwork } from '../context/NetworkStatusContext'

export default function OfflineBanner() {
  const { isOnline } = useNetwork()
  if (isOnline) return null
  return (
    <div className="offline-banner" role="status">
      <WifiOff size={16} aria-hidden="true" />
      You&apos;re offline. Showing saved items; checkout, login and AI are unavailable.
    </div>
  )
}