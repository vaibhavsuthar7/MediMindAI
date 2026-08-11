import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui'

export default function AnimatedOtpVerification({
  email,
  onVerify,
  onResend,
  onBack,
  loading,
  error,
  successMsg,
  isSuccess = false,
  length = 6,
}) {
  const { latestOtp } = useAuth() || {}
  const [digits, setDigits] = useState(Array(length).fill(''))
  const [activeIdx, setActiveIdx] = useState(0)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    // Focus first input on mount
    const t = setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
      if (interval) clearInterval(interval)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])

  const handleAutoFill = (codeToFill) => {
    if (!codeToFill) return
    const clean = codeToFill.toString().replace(/[^0-9]/g, '').slice(0, length)
    const newDigits = Array(length).fill('')
    for (let i = 0; i < clean.length; i++) {
      newDigits[i] = clean[i]
    }
    setDigits(newDigits)
    setActiveIdx(Math.min(clean.length, length - 1))
    if (clean.length === length) {
      onVerify(clean)
    }
  }

  const handleDigitChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '')
    if (!cleanValue && value !== '') return

    const char = cleanValue.slice(-1)
    const newDigits = [...digits]
    newDigits[index] = char
    setDigits(newDigits)

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIdx(index + 1)
    }

    const fullCode = newDigits.join('')
    if (fullCode.length === length) {
      onVerify(fullCode)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
        inputRefs.current[index - 1]?.focus()
        setActiveIdx(index - 1)
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setActiveIdx(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIdx(index + 1)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length)
    if (!pastedData) return

    const newDigits = [...digits]
    for (let i = 0; i < length; i++) {
      newDigits[i] = pastedData[i] || ''
    }
    setDigits(newDigits)

    const targetIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[targetIndex]?.focus()
    setActiveIdx(targetIndex)

    if (pastedData.length === length) {
      onVerify(pastedData)
    }
  }

  const handleResendClick = () => {
    if (!canResend) return
    setDigits(Array(length).fill(''))
    setTimer(60)
    setCanResend(false)
    if (onResend) onResend()
    inputRefs.current[0]?.focus()
    setActiveIdx(0)
  }

  const isFormComplete = digits.every((d) => d !== '')
  const radius = length >= 8 ? 85 : 75

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={
        error
          ? { opacity: 1, scale: 1, y: 0, x: [0, -10, 10, -6, 6, -3, 3, 0] }
          : { opacity: 1, scale: 1, y: 0, x: 0 }
      }
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-[#FFFDF7]/90 dark:bg-[#18110E]/90 backdrop-blur-2xl border border-[#E6DCC8] dark:border-[#362A24] rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_30px_90px_rgba(224,122,95,0.14)] dark:shadow-[0_35px_90px_rgba(0,0,0,0.85)] relative overflow-hidden text-[#231B0F] dark:text-[#F7F3E9]"
    >
      {/* Dynamic Ambient Glassmorphism Light Orbs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-[#E07A5F]/20 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-[#2EE6A8]/15 dark:bg-[#E07A5F]/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#EDE5CF]/30 dark:bg-[#E07A5F]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header & Subtitle */}
      <div className="text-center space-y-1.5 relative z-10">
        <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#231B0F] dark:text-[#F7F3E9] drop-shadow-sm">
          {isSuccess ? '✓ Code Verified!' : 'Verify your account'}
        </h2>
        <p className="text-xs sm:text-sm text-[#7C6E59] dark:text-[#A89A84] leading-relaxed max-w-xs mx-auto font-medium">
          {isSuccess ? (
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Account successfully authenticated! Redirecting...</span>
          ) : (
            <>
              Enter the <span className="font-bold text-[#231B0F] dark:text-[#F7F3E9]">{length}-digit code</span> sent to{' '}
              <span className="font-extrabold text-[#E07A5F] underline decoration-[#E07A5F]/50">{email}</span>.
            </>
          )}
        </p>
      </div>

      {/* ORBITAL CIRCULAR INTERFACE */}
      <div className="relative h-48 sm:h-56 w-full flex items-center justify-center my-1">
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="px-8 py-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xl shadow-[0_0_40px_rgba(46,230,168,0.6)] flex items-center gap-3 backdrop-blur-xl"
          >
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base font-black shadow-md">✓</span>
            <span>{digits.join('')} Verified!</span>
          </motion.div>
        ) : (
          <>
            {/* SVG Glass Orbit Track & Glowing Beam Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
              <defs>
                <radialGradient id="glassHubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={error ? "#EF4444" : "#E07A5F"} stopOpacity="0.9" />
                  <stop offset="60%" stopColor={error ? "#EF4444" : "#E07A5F"} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={error ? "#EF4444" : "#E07A5F"} stopOpacity="0" />
                </radialGradient>
                <linearGradient id="glassBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={error ? "#EF4444" : "#E07A5F"} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={error ? "#EF4444" : "#2EE6A8"} stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Outer Dashed Orbit Circle Ring */}
              <circle
                cx="150"
                cy="150"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className={error ? "text-red-400/50" : "text-[#D8CDB6] dark:text-white/20 opacity-80"}
              />

              {/* Active Energy Beam to Active Node */}
              {(() => {
                const angle = (2 * Math.PI * activeIdx) / length - Math.PI / 2
                const targetX = 150 + radius * Math.cos(angle)
                const targetY = 150 + radius * Math.sin(angle)
                return (
                  <motion.g>
                    <motion.line
                      x1="150"
                      y1="150"
                      x2={targetX}
                      y2={targetY}
                      stroke="url(#glassBeamGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <circle cx={targetX} cy={targetY} r="3" fill={error ? "#EF4444" : "#2EE6A8"} />
                  </motion.g>
                )
              })()}

              {/* Glowing Center Glass Hub Dot */}
              <circle cx="150" cy="150" r="18" fill="url(#glassHubGlow)" />
              <circle cx="150" cy="150" r="5" fill={error ? "#EF4444" : "#E07A5F"} />
            </svg>

            {/* Circular Radial Glass Digit Nodes */}
            <div className="relative w-[280px] h-[280px] flex items-center justify-center z-10">
              {Array.from({ length }).map((_, i) => {
                const angle = (2 * Math.PI * i) / length - Math.PI / 2
                const x = radius * Math.cos(angle)
                const y = radius * Math.sin(angle)

                const val = digits[i] || ''
                const isFilled = Boolean(val)
                const isActive = activeIdx === i

                return (
                  <motion.div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `calc(50% + ${x}px - 22px)`,
                      top: `calc(50% + ${y}px - 22px)`,
                    }}
                    animate={{
                      scale: isFilled ? 1.15 : isActive ? 1.1 : 0.95,
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                    onClick={() => {
                      setActiveIdx(i)
                      inputRefs.current[i]?.focus()
                    }}
                    className={`cursor-pointer w-11 h-11 text-base sm:text-lg rounded-2xl flex items-center justify-center font-mono font-black border-2 transition-all duration-300 backdrop-blur-xl ${
                      error
                        ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.6)]'
                        : isFilled
                        ? 'bg-[#2EE6A8]/25 dark:bg-[#2EE6A8]/20 border-[#2EE6A8] text-[#13634B] dark:text-[#2EE6A8] shadow-[0_0_20px_rgba(46,230,168,0.55)]'
                        : isActive
                        ? 'bg-[#E07A5F]/30 dark:bg-[#E07A5F]/25 border-[#E07A5F] text-[#E07A5F] dark:text-[#F7F3E9] shadow-[0_0_20px_rgba(224,122,95,0.65)] ring-4 ring-[#E07A5F]/25'
                        : 'bg-white/50 dark:bg-white/5 border-white/60 dark:border-white/12 text-[#7C6E59] dark:text-[#A89A84] hover:border-[#E07A5F]/60'
                    }`}
                  >
                    {val || '•'}
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* DIRECT VISIBLE 6-BOX DIGIT INPUT ROW */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (isFormComplete) onVerify(digits.join(''))
        }}
        className="space-y-4 relative z-10"
      >
        <div className="flex justify-center items-center gap-2 sm:gap-3 py-1">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onFocus={() => setActiveIdx(idx)}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono font-black text-xl sm:text-2xl rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
                error
                  ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                  : digit
                  ? 'border-[#2EE6A8] bg-[#2EE6A8]/10 text-[#13634B] dark:text-[#2EE6A8] shadow-[0_0_15px_rgba(46,230,168,0.2)]'
                  : activeIdx === idx
                  ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#231B0F] dark:text-white ring-4 ring-[#E07A5F]/20'
                  : 'border-[#E6DCC8] dark:border-white/10 bg-white/60 dark:bg-white/5 text-[#231B0F] dark:text-white'
              }`}
            />
          ))}
        </div>

        {/* ⚡ ONE-CLICK AUTOFILL HELPER */}
        {latestOtp && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              type="button"
              onClick={() => handleAutoFill(latestOtp)}
              className="px-4 py-1.5 rounded-full bg-[#E07A5F]/15 border border-[#E07A5F]/40 text-[#E07A5F] dark:text-[#F29F86] text-xs font-bold hover:bg-[#E07A5F]/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>⚡ Click to Auto-fill Code:</span>
              <span className="font-mono font-black tracking-wider underline">{latestOtp}</span>
            </button>
          </motion.div>
        )}

        {/* Feedback Messages & Hints */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-1.5"
            >
              <p className="text-red-700 dark:text-red-300 text-xs font-bold text-center bg-red-500/15 backdrop-blur-md p-2.5 rounded-2xl border border-red-500/30">
                ⚠️ {error}
              </p>
            </motion.div>
          )}
          {successMsg && !error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20"
            >
              {successMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Helpful Notice */}
        <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/20 rounded-2xl p-3 text-center space-y-1">
          <p className="text-xs font-bold text-[#E07A5F]">📩 Email Verification Active</p>
          <p className="text-[11px] text-[#7C6E59] dark:text-[#A89A84] leading-normal font-medium">
            Verification email sent to <strong className="text-[#231B0F] dark:text-white">{email}</strong>.<br />
            Valid for 10 minutes. (Also check your <strong>Spam / Junk</strong> folder).
          </p>
        </div>

        {/* Submit Action Button */}
        <Button
          type="submit"
          disabled={loading || !isFormComplete}
          className="w-full py-3.5 text-sm font-extrabold shadow-lg bg-[#231B0F] dark:bg-[#E07A5F] hover:bg-[#3D3222] dark:hover:bg-[#C55F44] text-[#FFFDF7] dark:text-white rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-[#E07A5F]/20"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying Code…
            </>
          ) : (
            'Verify & Activate Account'
          )}
        </Button>
      </form>

      {/* Footer Controls */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-white/20 dark:border-white/10 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
        >
          ← Edit Details
        </button>

        <button
          type="button"
          disabled={!canResend}
          onClick={handleResendClick}
          className={`font-bold transition-all ${
            canResend
              ? 'text-[#E07A5F] hover:underline cursor-pointer'
              : 'text-[#7C6E59]/50 dark:text-[#A89A84]/40 cursor-not-allowed'
          }`}
        >
          {canResend ? '🔄 Resend Code' : `Resend in ${timer}s`}
        </button>
      </div>
    </motion.div>
  )
}
