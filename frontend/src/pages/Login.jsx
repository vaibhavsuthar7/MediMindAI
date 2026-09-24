import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SignIn } from '@clerk/clerk-react'
import { useAuth } from '../context/AuthContext'
import InteractiveCreamCharacters from '../components/InteractiveCreamCharacters'
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const { login, loginWithGoogle, requestPasswordReset, resetPassword, isClerkActive, isSupabaseActive } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(true)

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState(1) // 1: enter email, 2: enter OTP & new password
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [demoOtpCode, setDemoOtpCode] = useState(null)

  // Field focus tracking for character mood state
  const [activeInput, setActiveInput] = useState(null) // 'email' | 'password' | null

  // Derived mood of characters
  const mood = (() => {
    if (showPassword && form.password.length > 0) return 'exposed'
    if (activeInput === 'password') return 'shy'
    if (activeInput === 'email') return 'nosy'
    return 'idle'
  })()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err?.message || err?.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setSuccessMsg('')
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err?.message || 'Google Login failed.')
    }
  }

  function openForgotModal(e) {
    e.preventDefault()
    setForgotEmail(form.email || '')
    setForgotOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setForgotError('')
    setForgotSuccess('')
    setDemoOtpCode(null)
    setForgotStep(1)
    setIsForgotModalOpen(true)
  }

  function closeForgotModal() {
    setIsForgotModalOpen(false)
    setForgotStep(1)
    setForgotError('')
    setForgotSuccess('')
  }

  async function handleRequestResetOtp(e) {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')

    const cleanEmail = forgotEmail.trim().toLowerCase()
    if (!cleanEmail) {
      setForgotError('Please enter your email address.')
      return
    }
    if (!cleanEmail.endsWith('@gmail.com')) {
      setForgotError('email id is incorrect (must be @gmail.com)')
      return
    }

    setForgotLoading(true)
    try {
      const res = await requestPasswordReset(cleanEmail)
      const code = res?.otp_code || null
      setDemoOtpCode(code)
      setForgotSuccess(`Verification code sent to ${cleanEmail}! Check your inbox.`)
      setForgotStep(2)
    } catch (err) {
      setForgotError(err?.message || 'Failed to send verification code. Make sure the email is registered.')
    } finally {
      setForgotLoading(false)
    }
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')

    const cleanEmail = forgotEmail.trim().toLowerCase()
    const codeEntered = forgotOtp.trim()

    if (!codeEntered) {
      setForgotError('Please enter the 6-digit OTP code.')
      return
    }
    if (newPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setForgotError('New passwords do not match.')
      return
    }

    setForgotLoading(true)
    try {
      await resetPassword(cleanEmail, codeEntered, newPassword)
      setForm({ email: cleanEmail, password: newPassword })
      closeForgotModal()
      setSuccessMsg('✅ Password reset successfully! Please log in with your new password.')
    } catch (err) {
      setForgotError(err?.message || 'Failed to reset password. Please check your OTP code.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen theme-bg-page theme-text-main flex flex-col items-center justify-center font-sans selection:bg-[#E07A5F] selection:text-white p-4 sm:p-6 md:p-8 relative transition-colors duration-300">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E07A5F]/15 rounded-full blur-[130px] pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500" />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ---------------- MAIN CONTAINER ---------------- */}
      <main className="w-full max-w-4xl py-6 flex flex-col items-center my-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-6">
          <Link
            to="/"
            title="Go to Landing Page"
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full theme-bg-header backdrop-blur-xl theme-border border shadow-[0_8px_30px_rgba(100,80,50,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-bold text-xs shadow-[0_2px_10px_rgba(224,122,95,0.45)] group-hover:rotate-12 transition-transform">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight theme-text-main">
              MediMind <span className="text-[#E07A5F] font-black">Auth</span>
            </h1>
          </Link>
        </div>

        {/* SPLIT CARD CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full theme-bg-card backdrop-blur-2xl theme-border border rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(100,80,50,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col md:flex-row min-h-[500px] transition-colors duration-300"
        >

          {/* LEFT PANEL — INTERACTIVE CHARACTERS */}
          <div className="w-full md:w-1/2 min-h-[280px] md:min-h-full border-b md:border-b-0 md:border-r theme-border theme-bg-stage">
            <InteractiveCreamCharacters mood={mood} />
          </div>

          {/* RIGHT PANEL — LOGIN FORM */}
          <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center theme-bg-card transition-colors duration-300">
            {isClerkActive ? (
              <div className="w-full flex justify-center">
                <SignIn routing="path" path="/login" signUpUrl="/signup" fallbackRedirectUrl="/" />
              </div>
            ) : (
              <div>
                {/* Header Icon + Welcome */}
                <div className="mb-6">
                  <div className="w-8 h-8 rounded-full theme-bg-badge flex items-center justify-center mb-3 theme-text-main font-bold text-lg border theme-border">
                    <svg className="w-4 h-4 text-[#E07A5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold theme-text-main tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-sm font-medium theme-text-sub mt-1">
                    Please enter your details.
                  </p>
                </div>

                {isSupabaseActive && (
                  <div className="mb-4 bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-xl p-2.5 text-xs font-bold text-[#E07A5F] text-center">
                    ⚡ Supabase Auth Active
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* EMAIL FIELD */}
                  <div>
                    <label className="block text-xs font-bold theme-text-sub mb-1.5 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onFocus={() => setActiveInput('email')}
                      onBlur={() => setActiveInput(null)}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="hasib@gmail.com"
                      className="w-full px-3.5 py-2.5 theme-bg-card border-b-2 theme-border focus:border-[#E07A5F] theme-text-main font-medium text-sm focus:outline-none transition-colors placeholder:text-[#A89A84] dark:placeholder:text-[#6E6050]"
                    />
                  </div>

                  {/* PASSWORD FIELD WITH SHOW/HIDE TOGGLE */}
                  <div>
                    <label className="block text-xs font-bold theme-text-sub mb-1.5 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onFocus={() => setActiveInput('password')}
                        onBlur={() => setActiveInput(null)}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 pr-10 theme-bg-card border-b-2 theme-border focus:border-[#E07A5F] theme-text-main font-medium text-sm focus:outline-none transition-colors placeholder:text-[#A89A84] dark:placeholder:text-[#6E6050]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 theme-text-sub hover:theme-text-main p-1 text-sm transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.03 10.03 0 013.122-.463c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-6.115-6.115a3 3 0 104.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* REMEMBER & FORGOT PASSWORD */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 font-medium theme-text-sub cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="rounded theme-border text-[#E07A5F] focus:ring-[#E07A5F] w-4 h-4 accent-[#E07A5F]"
                      />
                      Remember for 30 days
                    </label>
                    <button
                      type="button"
                      onClick={openForgotModal}
                      className="font-semibold text-[#E07A5F] hover:underline cursor-pointer focus:outline-none"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {error && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-bold text-red-700 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  {/* PRIMARY LOG IN BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 theme-btn-primary hover:opacity-90 active:scale-[0.99] font-semibold text-sm rounded-full transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Logging in…
                      </>
                    ) : (
                      'Log in'
                    )}
                  </button>

                  {/* DIVIDER */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t theme-border" />
                    </div>
                    <span className="relative theme-bg-card px-3 text-xs font-medium theme-text-sub">
                      or
                    </span>
                  </div>

                  {/* GOOGLE BUTTON */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 theme-bg-badge border theme-border theme-text-main font-semibold text-xs rounded-full transition-colors flex items-center justify-center gap-2.5 shadow-sm hover:opacity-90"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.8 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                    </svg>
                    Log in with Google
                  </button>
                </form>

                {/* SIGN UP LINK */}
                <p className="text-center text-xs font-semibold theme-text-sub mt-6">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-[#E07A5F] hover:text-[#C55F44] font-bold underline ml-1">
                    Sign up
                  </Link>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* ---------------- FORGOT PASSWORD MODAL ---------------- */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForgotModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md theme-bg-card border theme-border rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={closeForgotModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#E07A5F]/15 border border-[#E07A5F]/30 flex items-center justify-center mb-3 text-[#E07A5F]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold theme-text-main tracking-tight">
                  {forgotStep === 1 ? 'Reset Password' : 'Verify OTP & Set Password'}
                </h3>
                <p className="text-xs font-medium theme-text-sub mt-1">
                  {forgotStep === 1
                    ? 'Enter your registered @gmail.com email to receive a 6-digit OTP code.'
                    : `Enter the 6-digit OTP code sent to ${forgotEmail}`}
                </p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-bold text-red-700 dark:text-red-400">
                  {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {forgotSuccess}
                </div>
              )}

              {forgotStep === 1 ? (
                /* STEP 1: REQUEST OTP FORM */
                <form onSubmit={handleRequestResetOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold theme-text-sub mb-1.5 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full px-3.5 py-2.5 theme-bg-card border theme-border rounded-xl focus:border-[#E07A5F] theme-text-main font-medium text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 theme-btn-primary font-semibold text-sm rounded-full transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send Verification OTP'
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: ENTER OTP & NEW PASSWORD */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* OTP CODE FIELD */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold theme-text-sub uppercase tracking-wider">
                        6-Digit OTP Code
                      </label>
                      {demoOtpCode && (
                        <button
                          type="button"
                          onClick={() => setForgotOtp(demoOtpCode)}
                          className="text-[11px] font-bold text-[#E07A5F] hover:underline"
                        >
                          Auto-fill Code ({demoOtpCode})
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 text-center tracking-[6px] font-mono text-lg theme-bg-card border theme-border rounded-xl focus:border-[#E07A5F] theme-text-main focus:outline-none transition-colors"
                    />
                  </div>

                  {/* NEW PASSWORD */}
                  <div>
                    <label className="block text-xs font-bold theme-text-sub mb-1.5 uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3.5 py-2.5 theme-bg-card border theme-border rounded-xl focus:border-[#E07A5F] theme-text-main font-medium text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  {/* CONFIRM NEW PASSWORD */}
                  <div>
                    <label className="block text-xs font-bold theme-text-sub mb-1.5 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 theme-bg-card border theme-border rounded-xl focus:border-[#E07A5F] theme-text-main font-medium text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="w-1/3 py-2.5 theme-bg-badge border theme-border font-semibold text-xs rounded-full theme-text-main hover:opacity-80 transition-opacity"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-2/3 py-2.5 theme-btn-primary font-semibold text-xs rounded-full transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
