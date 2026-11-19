import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { NetworkStatusProvider } from './context/NetworkStatusContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Service worker registration happens in <ReloadPrompt /> via useRegisterSW
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NetworkStatusProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </NetworkStatusProvider>
    </BrowserRouter>
  </StrictMode>,
)