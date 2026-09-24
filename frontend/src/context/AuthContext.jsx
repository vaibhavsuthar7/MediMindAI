import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import api from '../api/client'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const IS_CLERK_CONFIGURED = !isSupabaseConfigured && PUBLISHABLE_KEY && PUBLISHABLE_KEY.startsWith('pk_') && PUBLISHABLE_KEY !== 'pk_test_placeholder_key'

const AuthContext = createContext(null)

function SupabaseAuthConsumer({ children }) {
  const [user, setUser] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [latestOtp, setLatestOtp] = useState(null)

  useEffect(() => {
    let mounted = true

    const handleSession = (session) => {
      if (!mounted) return
      if (session) {
        const u = session.user
        const token = session.access_token
        localStorage.setItem('medimind_token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser({
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Patient',
          email: u.email,
        })
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      } else {
        const localToken = localStorage.getItem('medimind_token')
        const localUserStr = localStorage.getItem('medimind_user')
        if (localToken && localUserStr) {
          api.defaults.headers.common['Authorization'] = `Bearer ${localToken}`
          try {
            setUser(JSON.parse(localUserStr))
          } catch {
            setUser(null)
          }
        } else {
          localStorage.removeItem('medimind_token')
          delete api.defaults.headers.common['Authorization']
          setUser(null)
        }
      }
      setIsLoaded(true)
    }

    // Safety timeout: ensure loading screen unlocks instantly even if Supabase network check is delayed
    const timeoutId = setTimeout(() => {
      if (mounted) setIsLoaded(true)
    }, 200)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeoutId)
      handleSession(session)
    }).catch(() => {
      if (mounted) setIsLoaded(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription?.unsubscribe?.()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    let supaError = null
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data?.session?.access_token) {
        localStorage.setItem('medimind_token', data.session.access_token)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.session.access_token}`
        const u = data.session.user
        setUser({
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Patient',
          email: u.email,
        })
        return data
      }
      supaError = error
    } catch (e) {
      supaError = e
    }

    // Fallback to FastAPI backend database login
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('medimind_token', data.access_token)
      localStorage.setItem('medimind_user', JSON.stringify(data.user))
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
      setUser(data.user)
      return data
    } catch (backendErr) {
      throw new Error(supaError?.message || backendErr?.response?.data?.detail || 'Incorrect email or password')
    }
  }, [])

  const signup = useCallback(async (payload) => {
    const { email, password, name, age, sex } = payload
    const cleanEmail = email?.trim().toLowerCase() || ''
    if (!cleanEmail.endsWith('@gmail.com')) {
      throw new Error('email id is incorrect')
    }

    try {
      const res = await api.post('/auth/signup', { email: cleanEmail, password, name, age, sex })
      const otpCode = res.data?.otp_code || null
      if (otpCode) {
        setLatestOtp(otpCode)
      }
      return { status: 'otp_sent', otp_code: otpCode, user: res.data?.user }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Signup failed.'
      throw new Error(msg)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await supabase?.auth?.signOut()
    } catch {}
    localStorage.removeItem('medimind_token')
    localStorage.removeItem('medimind_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  const resendOtp = useCallback(async (email) => {
    const cleanEmail = email?.trim().toLowerCase() || ''
    try {
      const otpRes = await api.post('/auth/send-otp', { email: cleanEmail })
      const otpCode = otpRes.data?.otp_code || null
      if (otpCode) {
        setLatestOtp(otpCode)
      }
      return { status: 'otp_resent', otp_code: otpCode }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to resend OTP.'
      throw new Error(msg)
    }
  }, [])

  const verifyOtp = useCallback(async (email, token) => {
    const cleanEmail = email?.trim().toLowerCase() || ''
    const codeEntered = token?.trim() || ''

    try {
      const verifyRes = await api.post('/auth/verify-otp', { email: cleanEmail, code: codeEntered })
      if (verifyRes.data?.access_token) {
        const tokenStr = verifyRes.data.access_token
        const u = verifyRes.data.user
        localStorage.setItem('medimind_token', tokenStr)
        localStorage.setItem('medimind_user', JSON.stringify(u))
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenStr}`
        setUser({
          id: u.id,
          name: u.name || cleanEmail.split('@')[0],
          email: u.email,
        })
        return verifyRes.data
      }
      return { status: 'verified' }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Invalid or expired OTP code.'
      throw new Error(msg)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) throw error
    return data
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    const cleanEmail = email?.trim().toLowerCase() || ''
    if (!cleanEmail.endsWith('@gmail.com')) {
      throw new Error('email id is incorrect')
    }
    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail })
      const otpCode = res.data?.otp_code || null
      if (otpCode) setLatestOtp(otpCode)
      return { status: 'otp_sent', otp_code: otpCode }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to send password reset OTP.'
      throw new Error(msg)
    }
  }, [])

  const resetPassword = useCallback(async (email, code, newPassword) => {
    const cleanEmail = email?.trim().toLowerCase() || ''
    try {
      const res = await api.post('/auth/reset-password', { email: cleanEmail, code, new_password: newPassword })
      return res.data
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to reset password.'
      throw new Error(msg)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        signup,
        resendOtp,
        verifyOtp,
        requestPasswordReset,
        resetPassword,
        logout,
        latestOtp,
        isSupabaseActive: true,
        isClerkActive: false,
        isLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function ClerkAuthConsumer({ children }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { getToken, signOut } = useClerkAuth()
  const { signOut: clerkSignOut } = useClerk()
  const [localUser, setLocalUser] = useState(null)

  useEffect(() => {
    if (isLoaded && clerkUser && getToken) {
      getToken()
        .then((token) => {
          if (token) {
            localStorage.setItem('medimind_token', token)
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          }
        })
        .catch(() => {})
    }
  }, [clerkUser, isLoaded, getToken])

  const user = clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Patient',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
      }
    : localUser

  const logout = useCallback(async () => {
    localStorage.removeItem('medimind_token')
    localStorage.removeItem('medimind_user')
    setLocalUser(null)
    if (signOut) {
      await signOut()
    } else if (clerkSignOut) {
      await clerkSignOut()
    }
  }, [signOut, clerkSignOut])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('medimind_token', data.access_token)
    localStorage.setItem('medimind_user', JSON.stringify(data.user))
    setLocalUser(data.user)
  }, [])

  const signup = useCallback(async (payload) => {
    const cleanEmail = payload?.email?.trim().toLowerCase() || ''
    if (!cleanEmail.endsWith('@gmail.com')) {
      throw new Error('email id is incorrect')
    }
    const { data } = await api.post('/auth/signup', payload)
    localStorage.setItem('medimind_token', data.access_token)
    localStorage.setItem('medimind_user', JSON.stringify(data.user))
    setLocalUser(data.user)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    // Clerk handles OAuth automatically via <SignIn /> button or custom strategy
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, isSupabaseActive: false, isClerkActive: true, getToken, isLoaded }}>
      {children}
    </AuthContext.Provider>
  )
}

function LocalAuthConsumer({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('medimind_user')
      if (!raw || raw === 'undefined' || raw === 'null') return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  })
  const [pendingAuth, setPendingAuth] = useState(null)
  const [latestOtp, setLatestOtp] = useState(null)

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('medimind_token', data.access_token)
    localStorage.setItem('medimind_user', JSON.stringify(data.user))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
    setUser(data.user)
  }, [])

  const signup = useCallback(async (payload) => {
    const cleanEmail = payload?.email?.trim().toLowerCase() || ''
    if (!cleanEmail.endsWith('@gmail.com')) {
      throw new Error('email id is incorrect')
    }
    const { data } = await api.post('/auth/signup', payload)
    if (data?.otp_code) {
      setLatestOtp(data.otp_code)
    }
    setPendingAuth({ user: data.user, token: data.access_token })
    return data
  }, [])

  const resendOtp = useCallback(async (email) => {
    const res = await api.post('/auth/send-otp', { email })
    if (res.data?.otp_code) {
      setLatestOtp(res.data.otp_code)
    }
    return res.data
  }, [])

  const verifyOtp = useCallback(async (email, otpCode) => {
    await api.post('/auth/verify-otp', { email, code: otpCode })
    const targetUser = pendingAuth?.user || { id: Date.now(), email, name: email.split('@')[0] }
    const targetToken = pendingAuth?.token || 'local_session_token'

    localStorage.setItem('medimind_token', targetToken)
    localStorage.setItem('medimind_user', JSON.stringify(targetUser))
    api.defaults.headers.common['Authorization'] = `Bearer ${targetToken}`
    setUser(targetUser)
    setPendingAuth(null)
  }, [pendingAuth])

  const logout = useCallback(() => {
    localStorage.removeItem('medimind_token')
    localStorage.removeItem('medimind_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setPendingAuth(null)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
      return
    }

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '526222261599-2qijpduo1o3m7kteguf0hd94kpp2icqj.apps.googleusercontent.com'

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        return reject(new Error('Google Sign-In service is loading. Please try again in a moment.'))
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse?.error) {
            return reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google Login cancelled.'))
          }
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            })
            const profile = await res.json()
            if (!profile?.email) {
              throw new Error('Could not retrieve email from your Google account.')
            }

            const backendRes = await api.post('/auth/google', {
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              google_id: profile.sub,
            })

            const { access_token, user: loggedUser } = backendRes.data
            localStorage.setItem('medimind_token', access_token)
            localStorage.setItem('medimind_user', JSON.stringify(loggedUser))
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            setUser(loggedUser)
            resolve(loggedUser)
          } catch (err) {
            reject(new Error(err?.response?.data?.detail || err?.message || 'Google authentication failed.'))
          }
        },
        error_callback: (err) => {
          reject(new Error(err?.message || 'Google login popup closed or blocked.'))
        },
      })

      client.requestAccessToken({ prompt: 'select_account' })
    })
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    const cleanEmail = email?.trim().toLowerCase() || ''
    if (!cleanEmail.endsWith('@gmail.com')) {
      throw new Error('email id is incorrect')
    }
    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail })
      const otpCode = res.data?.otp_code || null
      if (otpCode) setLatestOtp(otpCode)
      return { status: 'otp_sent', otp_code: otpCode }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to send password reset OTP.'
      throw new Error(msg)
    }
  }, [])

  const resetPassword = useCallback(async (email, code, newPassword) => {
    const cleanEmail = email?.trim().toLowerCase() || ''
    try {
      const res = await api.post('/auth/reset-password', { email: cleanEmail, code, new_password: newPassword })
      return res.data
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to reset password.'
      throw new Error(msg)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, resendOtp, verifyOtp, requestPasswordReset, resetPassword, logout, latestOtp, isSupabaseActive: false, isClerkActive: false, isLoaded: true }}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }) {
  if (isSupabaseConfigured) {
    return <SupabaseAuthConsumer>{children}</SupabaseAuthConsumer>
  }
  if (IS_CLERK_CONFIGURED) {
    return <ClerkAuthConsumer>{children}</ClerkAuthConsumer>
  }
  return <LocalAuthConsumer>{children}</LocalAuthConsumer>
}

export function useAuth() {
  return useContext(AuthContext)
}
