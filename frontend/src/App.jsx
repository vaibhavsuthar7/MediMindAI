import { Component } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Imaging from './pages/Imaging'
import Symptoms from './pages/Symptoms'
import Reports from './pages/Reports'
import Medications from './pages/Medications'
import Chat from './pages/Chat'
import Profile from './pages/Profile'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo)
  }

  handleReset = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#15100E] text-[#F7F3E9] flex items-center justify-center p-6 text-center">
          <div className="max-w-lg bg-[#1A1412] border border-[#E07A5F]/40 p-8 rounded-3xl shadow-2xl space-y-4 text-left">
            <div className="text-4xl text-center mb-2">⚠️</div>
            <h1 className="font-display text-2xl text-[#F7F3E9] text-center font-bold">MediMind AI Recovery</h1>
            <p className="text-xs text-[#A89A84] leading-relaxed text-center font-medium">
              Something unexpectedly interrupted rendering. Click below to clear stored sessions and reload cleanly.
            </p>

            {this.state.error && (
              <div className="bg-[#120D0B] p-3 rounded-xl border border-red-500/30 text-xs font-mono text-red-300 overflow-x-auto max-h-40">
                {this.state.error.toString()}
                <pre className="text-[10px] opacity-75 mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-4 bg-[#E07A5F] text-white font-extrabold rounded-full hover:bg-[#C55F44] transition-all shadow-lg text-center cursor-pointer"
            >
              Reset Session & Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

import MediMindLoader from './components/MediMindLoader'

function HomeRoute() {
  const { user, isLoaded } = useAuth()

  if (!isLoaded) {
    return <MediMindLoader />
  }

  if (user) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    )
  }

  return <Landing />
}

function PublicRoute({ children }) {
  const { user, isLoaded } = useAuth()

  if (!isLoaded) {
    return <MediMindLoader />
  }

  if (user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      <Route element={<Layout />}>
        <Route path="/imaging" element={<Imaging />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  )
}
