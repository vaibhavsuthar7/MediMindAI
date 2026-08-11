import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'

import MediMindLoader from './MediMindLoader'

export default function Layout({ children }) {
  const { user, isLoaded } = useAuth()

  if (!isLoaded) {
    return <MediMindLoader />
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen theme-bg-page theme-text-main font-sans selection:bg-[#E07A5F] selection:text-white transition-colors duration-300">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 lg:pt-24 pb-12">
        {children || <Outlet />}
      </main>
    </div>
  )
}



