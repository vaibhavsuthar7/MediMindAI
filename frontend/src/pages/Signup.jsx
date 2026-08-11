import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SignUp } from '@clerk/clerk-react'
import { useAuth } from '../context/AuthContext'
import { Button, TextInput } from '../components/ui'
import PulseLine from '../components/PulseLine'
import AnimatedOtpVerification from '../components/AnimatedOtpVerification'
import ThemeToggle from '../components/ThemeToggle'
import api from '../api/client'

export default function Signup() {
  const { signup, resendOtp, verifyOtp, isClerkActive, isSupabaseActive } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', age: '', sex: '' })
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [emailStatus, setEmailStatus] = useState('idle') // 'idle' | 'checking' | 'available' | 'taken'
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Live debounced email check
  useEffect(() => {
    const cleanEmail = form.email.trim().toLowerCase()
    if (!cleanEmail) {
      setEmailStatus('idle')
      return
    }
    if (!cleanEmail.endsWith('@gmail.com')) {
      setEmailStatus('invalid_domain')
      return
    }
    setEmailStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-email?email=${encodeURIComponent(cleanEmail)}`)
        if (res.data?.exists) {
          setEmailStatus('taken')
        } else {
          setEmailStatus('available')
        }
      } catch {
        setEmailStatus('idle')
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [form.email])

  const pwdRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  }
  const isPasswordStrong = Object.values(pwdRules).every(Boolean)

  const handleNameChange = (e) => {
    const val = e.target.value
    if (val.length <= 30) {
      setForm((prev) => ({ ...prev, name: val }))
    }
  }

  const handleAgeChange = (e) => {
    const val = e.target.value
    if (val === '') {
      setForm((prev) => ({ ...prev, age: '' }))
      return
    }
    if (!/^\d+$/.test(val)) return
    const num = parseInt(val, 10)
    if (num > 100) {
      setForm((prev) => ({ ...prev, age: '100' }))
      return
    }
    if (num < 1) {
      setForm((prev) => ({ ...prev, age: '' }))
      return
    }
    setForm((prev) => ({ ...prev, age: String(num) }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Full name is required.')
      return
    }
    if (form.name.trim().length > 30) {
      setError('Full name cannot exceed 30 characters.')
      return
    }

    const cleanEmail = form.email.trim().toLowerCase()
    if (!cleanEmail.endsWith('@gmail.com')) {
      setError('email id is incorrect')
      return
    }
    if (emailStatus === 'taken') {
      setError('This email is already registered. Please sign in.')
      return
    }

    if (form.age) {
      const numAge = Number(form.age)
      if (isNaN(numAge) || numAge < 1 || numAge > 100) {
        setError('Age must be between 1 and 100.')
        return
      }
    }

    if (form.sex && !['F', 'M', 'Other'].includes(form.sex)) {
      setError('Sex must be F, M, or Other.')
      return
    }

    if (!isPasswordStrong) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, & special character (!@#$%^&*).')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please re-enter.')
      return
    }

    setError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      const res = await signup({ ...form, age: form.age ? Number(form.age) : null })
      setShowOtpStep(true)
      setSuccessMsg(`📩 6-digit OTP sent to ${form.email}! Please enter the code.`)
    } catch (err) {
      const msg = err?.message || err?.response?.data?.detail || 'Signup failed.'
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        setEmailStatus('taken')
        setError('⚠️ This email is already registered! Please sign in.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const [otpSuccess, setOtpSuccess] = useState(false)

  async function handleVerifyOtpCode(otpCode) {
    setError('')
    setLoading(true)
    try {
      if (verifyOtp) {
        await verifyOtp(form.email, otpCode.trim(), 'signup', form.password)
      }
      setOtpSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 1200)
    } catch (err) {
      setError(err?.message || 'Invalid or expired OTP code.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOtp() {
    setError('')
    try {
      if (resendOtp) {
        await resendOtp(form.email)
      } else {
        await signup({ ...form, age: form.age ? Number(form.age) : null })
      }
      setSuccessMsg(`📩 Fresh 6-digit OTP code sent to ${form.email}!`)
    } catch (err) {
      setError(err?.message || 'Failed to resend OTP.')
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center theme-bg-page theme-text-main px-4 sm:px-6 py-10 font-sans selection:bg-[#E07A5F] selection:text-white relative transition-colors duration-300">

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex flex-col items-center justify-center relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Link
            to="/"
            title="Go to Landing Page"
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#FFFDF7]/70 dark:bg-[#1A1412]/70 backdrop-blur-xl border border-[#E6DCC8] dark:border-[#362A24] shadow-[0_8px_30px_rgba(100,80,50,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] mb-2 hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-bold text-xs shadow-[0_2px_10px_rgba(224,122,95,0.45)] group-hover:rotate-12 transition-transform">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight theme-text-main">
              MediMind <span className="text-[#E07A5F] font-black">AI</span>
            </h1>
          </Link>
          <p className="theme-text-sub font-semibold text-sm mt-1">Create your health profile</p>
          <PulseLine className="w-44 h-6 mx-auto mt-2 text-[#E07A5F]" color="#E07A5F" />
        </div>

        <AnimatePresence mode="wait">
          {isClerkActive ? (
            <div className="w-full flex justify-center shadow-xl rounded-3xl overflow-hidden theme-border theme-bg-card p-4">
              <SignUp routing="path" path="/signup" signInUrl="/login" fallbackRedirectUrl="/" />
            </div>

          ) : showOtpStep ? (
            <AnimatedOtpVerification
              key="otp-step"
              email={form.email}
              length={6}
              onVerify={handleVerifyOtpCode}
              onResend={handleResendOtp}
              onBack={() => setShowOtpStep(false)}
              loading={loading}
              error={error}
              successMsg={successMsg}
              isSuccess={otpSuccess}
            />
          ) : (
            <motion.div key="signup-form" className="w-full">
              <form onSubmit={handleSubmit} className="w-full bg-[#FFFDF7] dark:bg-[#1A1412] border border-[#E6DCC8] dark:border-[#362A24] rounded-[28px] p-7 space-y-4 shadow-[0_20px_50px_rgba(100,80,50,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#594C38] dark:text-[#C5B5A2] block uppercase tracking-wider">
                      Full name (Max 30 chars)
                    </label>
                    <span className={`text-[11px] font-mono font-bold ${form.name.length >= 30 ? 'text-[#E07A5F]' : 'text-[#7C6E59] dark:text-[#A89A84]'}`}>
                      {form.name.length}/30
                    </span>
                  </div>
                  <TextInput
                    required
                    maxLength={30}
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="Vaibhav Suthar"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#594C38] dark:text-[#C5B5A2] mb-1.5 block uppercase tracking-wider">Email</label>
                  <TextInput type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />

                  {/* Live Email Status Badges */}
                  {emailStatus === 'invalid_domain' && (
                    <p className="text-[11px] font-bold text-[#E07A5F] mt-1.5 flex items-center gap-1">
                      ⚠️ email id is incorrect
                    </p>
                  )}

                  {emailStatus === 'checking' && (
                    <p className="text-[11px] font-bold text-[#7C6E59] dark:text-[#A89A84] mt-1.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 border-2 border-[#E07A5F] border-t-transparent rounded-full animate-spin"></span>
                      Checking email availability…
                    </p>
                  )}

                  {emailStatus === 'available' && (
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                      ✓ Email is available
                    </p>
                  )}

                  {emailStatus === 'taken' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="text-[#E07A5F] font-bold">⚠️ Account already exists!</span>
                      <Link to="/login" className="text-[#E07A5F] font-extrabold underline hover:opacity-80">
                        Sign In →
                      </Link>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#594C38] dark:text-[#C5B5A2] mb-1.5 block uppercase tracking-wider">
                      Age (1-100)
                    </label>
                    <TextInput
                      type="number"
                      min="1"
                      max="100"
                      value={form.age}
                      onChange={handleAgeChange}
                      placeholder="1 - 100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#594C38] dark:text-[#C5B5A2] mb-1.5 block uppercase tracking-wider">
                      Sex
                    </label>
                    <select
                      value={form.sex}
                      onChange={(e) => setForm({ ...form, sex: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#EDE5CF]/30 dark:bg-white/5 border border-[#E6DCC8] dark:border-white/10 text-[#231B0F] dark:text-[#F7F3E9] font-medium text-sm focus:outline-none focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20 transition-all cursor-pointer"
                    >
                      <option value="" disabled>F / M / Other</option>
                      <option value="F">F (Female)</option>
                      <option value="M">M (Male)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#594C38] dark:text-[#C5B5A2] mb-1.5 block uppercase tracking-wider">
                    Password
                  </label>
                  <TextInput
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                  />

                  {/* Live Strong Password Requirements Checklist */}
                  {form.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2.5 p-3 bg-[#E07A5F]/10 border border-[#E07A5F]/20 rounded-2xl space-y-1.5 text-xs"
                    >
                      <p className="font-bold text-[#E07A5F] text-[11px] uppercase tracking-wider">
                        Strong Password Checklist:
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <div className={pwdRules.length ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-[#7C6E59] dark:text-[#A89A84]"}>
                          {pwdRules.length ? "✓" : "○"} Min 8 characters
                        </div>
                        <div className={pwdRules.uppercase ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-[#7C6E59] dark:text-[#A89A84]"}>
                          {pwdRules.uppercase ? "✓" : "○"} 1 Uppercase (A-Z)
                        </div>
                        <div className={pwdRules.lowercase ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-[#7C6E59] dark:text-[#A89A84]"}>
                          {pwdRules.lowercase ? "✓" : "○"} 1 Lowercase (a-z)
                        </div>
                        <div className={pwdRules.number ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-[#7C6E59] dark:text-[#A89A84]"}>
                          {pwdRules.number ? "✓" : "○"} 1 Number (0-9)
                        </div>
                        <div className={pwdRules.special ? "text-emerald-700 dark:text-emerald-400 font-bold col-span-2" : "text-[#7C6E59] dark:text-[#A89A84] col-span-2"}>
                          {pwdRules.special ? "✓" : "○"} 1 Special character (!@#$%^&*)
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#594C38] dark:text-[#C5B5A2] mb-1.5 block uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <TextInput
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />

                  {/* Live Password Match Indicator */}
                  {form.confirmPassword.length > 0 && (
                    form.password === form.confirmPassword ? (
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                        ✓ Passwords match
                      </p>
                    ) : (
                      <p className="text-[11px] font-bold text-[#E07A5F] mt-1.5 flex items-center gap-1">
                        ⚠️ Passwords do not match
                      </p>
                    )
                  )}
                </div>

                {error && <p className="text-[#E07A5F] text-xs font-bold bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">{error}</p>}
                {successMsg && (
                  <div className="bg-emerald-500/15 border border-emerald-600/40 rounded-xl p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 text-center leading-relaxed">
                    {successMsg}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    emailStatus === 'taken' ||
                    emailStatus === 'invalid_domain' ||
                    (form.password.length > 0 && !isPasswordStrong) ||
                    (form.confirmPassword.length > 0 && form.password !== form.confirmPassword)
                  }
                  className="w-full py-3 text-sm"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </Button>
              </form>

              <p className="text-center text-xs font-semibold text-[#7C6E59] dark:text-[#A89A84] mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-[#E07A5F] font-bold hover:underline ml-1">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  )
}




