import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const AppRoot = () => {
  const isClerkEnabled = PUBLISHABLE_KEY && PUBLISHABLE_KEY.startsWith('pk_') && PUBLISHABLE_KEY !== 'pk_test_placeholder_key'

  if (isClerkEnabled) {
    return (
      <React.StrictMode>
        <ThemeProvider>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/login">
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ClerkProvider>
        </ThemeProvider>
      </React.StrictMode>
    )
  }

  return (
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot />)


