import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AnimatedContactUs() {
  const [isOpen, setIsOpen] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate paper plane takeoff animation
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setForm({ name: '', email: '', message: '' })
    }, 1200)
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8 relative z-10 flex flex-col items-center">
      {/* TOGGLE FLOATING ENVELOPE BUTTON (Click Envelope To Toggle) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="mb-6 px-5 py-2.5 rounded-full bg-[#E07A5F] text-white font-extrabold text-xs shadow-lg shadow-[#E07A5F]/30 flex items-center gap-2 cursor-pointer border border-white/20"
      >
        <span className="text-base">{isOpen ? '📬' : '✉️'}</span>
        {isOpen ? 'Close Contact Form' : 'Click Envelope To Contact Us'}
      </motion.button>

      {/* CONTACT US CARD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full bg-white dark:bg-[#15100E] rounded-[36px] p-8 sm:p-12 shadow-[0_25px_70px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.7)] border border-gray-100 dark:border-white/10 relative overflow-visible text-[#1E1E1E] dark:text-[#F7F3E9]"
          >
            {/* FLOATING BACKGROUND PINK BUBBLES (MATCHING VIDEO) */}
            <div className="absolute top-12 left-12 w-16 h-16 rounded-full bg-[#FFD0C7]/40 dark:bg-[#E07A5F]/15 blur-sm pointer-events-none" />
            <div className="absolute top-36 left-32 w-10 h-10 rounded-full bg-[#FFD0C7]/50 dark:bg-[#E07A5F]/20 blur-xs pointer-events-none" />
            <div className="absolute bottom-16 left-16 w-24 h-24 rounded-full bg-[#FFD0C7]/30 dark:bg-[#E07A5F]/10 blur-md pointer-events-none" />
            <div className="absolute bottom-8 left-36 w-6 h-6 rounded-full bg-[#FFD0C7]/60 dark:bg-[#E07A5F]/30 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* LEFT COLUMN: PAPER PLANE ILLUSTRATION */}
              <div className="relative flex flex-col items-center justify-center min-h-[280px] p-6 rounded-3xl overflow-hidden">
                {/* FLOATING PAPER PLANE VECTOR (MATCHING CODE.XR EXACT SHAPE & EYE DOT) */}
                <motion.div
                  animate={
                    isSubmitting
                      ? { x: [0, 100, 300], y: [0, -80, -220], rotate: [0, -18, -40], scale: [1, 1.15, 0.3], opacity: [1, 0.9, 0] }
                      : { y: [0, -14, 0], rotate: [-3, 4, -3] }
                  }
                  transition={
                    isSubmitting
                      ? { duration: 1.1, ease: 'easeIn' }
                      : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                  }
                  className="relative z-10"
                >
                  <svg className="w-44 h-44 sm:w-52 sm:h-52 drop-shadow-xl" viewBox="0 0 120 120" fill="none">
                    {/* Main Wing Body */}
                    <path
                      d="M20 60L95 20L65 95L48 68L20 60Z"
                      fill="#7BE2A4"
                      stroke="#1E1E1E"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />
                    {/* Folded Inner Wing */}
                    <path
                      d="M95 20L48 68L35 62L95 20Z"
                      fill="#50C880"
                      stroke="#1E1E1E"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />
                    {/* Eye Dot (Signature Code.XR Detail) */}
                    <circle cx="58" cy="62" r="3" fill="#1E1E1E" />
                    {/* Motion Speed Lines */}
                    <motion.line
                      x1="12"
                      y1="78"
                      x2="32"
                      y2="68"
                      stroke="#1E1E1E"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      animate={{ opacity: [0.3, 1, 0.3], x: [-5, 5, -5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </svg>
                </motion.div>
              </div>

              {/* RIGHT COLUMN: CONTACT FORM */}
              <div className="space-y-6">
                <div className="text-right sm:text-right space-y-1">
                  <h3 className="font-display text-2xl font-black text-[#1E1E1E] dark:text-[#F7F3E9]">
                    Contact us
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* FULL NAME INPUT */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A89A84]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="TEST"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F0EFF4] dark:bg-[#251D19] border border-transparent dark:border-white/10 rounded-2xl text-xs font-bold text-[#1E1E1E] dark:text-[#F7F3E9] placeholder:text-gray-400 dark:placeholder:text-[#9A8A77] focus:bg-white focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* EMAIL INPUT */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#A89A84]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="test@gmail.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F0EFF4] dark:bg-[#251D19] border border-transparent dark:border-white/10 rounded-2xl text-xs font-bold text-[#1E1E1E] dark:text-[#F7F3E9] placeholder:text-gray-400 dark:placeholder:text-[#9A8A77] focus:bg-white focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20 focus:outline-none transition-all"
                    />
                  </div>

                  {/* MESSAGE TEXTAREA */}
                  <div>
                    <textarea
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Test"
                      className="w-full p-4 bg-[#F0EFF4] dark:bg-[#251D19] border border-transparent dark:border-white/10 rounded-2xl text-xs font-bold text-[#1E1E1E] dark:text-[#F7F3E9] placeholder:text-gray-400 dark:placeholder:text-[#9A8A77] focus:bg-white focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* SUCCESS FEEDBACK */}
                  <AnimatePresence>
                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 bg-emerald-500/15 border border-emerald-600/30 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 text-center"
                      >
                        ✓ Thank you! Your message has been sent successfully.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* SUBMIT BUTTON WITH ARROW (MATCHING VIDEO PILL STYLING) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#E07A5F] hover:bg-[#C55F44] text-white font-extrabold text-xs shadow-lg shadow-[#E07A5F]/30 hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending…
                      </>
                    ) : (
                      <>
                        Submit <span className="text-sm">→</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* FLOATING SOCIAL ICONS OVERLAPPING BOTTOM CENTER BORDER (PIXEL-PERFECT TO VIDEO) */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#3B5998] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform border-2 border-white dark:border-[#15100E]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#00ACEE] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform border-2 border-white dark:border-[#15100E]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#3F729B] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform border-2 border-white dark:border-[#15100E]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
