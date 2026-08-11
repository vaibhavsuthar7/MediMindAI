import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InteractiveCreamCharacters({ mood = 'idle' }) {
  // Moods: 'idle' | 'nosy' (email focus) | 'shy' (password focus hidden) | 'exposed' (password visible)

  const stageRef = useRef(null)
  const [mousePos, setMousePos] = useState({
    pupilX: 0,
    pupilY: 0,
    normX: 0,
    normY: 0
  })

  // Periodic natural blinking state
  const [isBlinking, setIsBlinking] = useState(false)

  // Interactive click bounce trigger for characters
  const [jumpCount, setJumpCount] = useState(0)

  // Global mouse tracking effect with smooth physics
  useEffect(() => {
    function handleMouseMove(e) {
      if (!stageRef.current) return
      const rect = stageRef.current.getBoundingClientRect()
      const stageCenterX = rect.left + rect.width / 2
      const stageCenterY = rect.top + rect.height / 2

      const dx = e.clientX - stageCenterX
      const dy = e.clientY - stageCenterY
      const dist = Math.hypot(dx, dy) || 1

      // Pupil offset radius (Max 8.5px movement)
      const maxRadius = 8.5
      const scale = Math.min(dist / 40, maxRadius)
      const angle = Math.atan2(dy, dx)
      const pupilX = Math.cos(angle) * scale
      const pupilY = Math.sin(angle) * scale

      // Normalized screen offsets (-1 to 1) for exaggerated body tilt & movement
      const normX = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2.2)))
      const normY = Math.max(-1, Math.min(1, dy / (window.innerHeight / 2.2)))

      setMousePos({ pupilX, pupilY, normX, normY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Natural random blinking interval (every 3 to 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 160)
    }, 3600)
    return () => clearInterval(interval)
  }, [])

  // Character body movement calculations based on mood + mouse position
  const getOrangeTransform = () => {
    if (mood === 'shy') return { x: -14, y: 6, rotate: -12, scaleY: 0.95 }
    if (mood === 'nosy') return { x: 18 + mousePos.normX * 12, y: -4 + mousePos.normY * 6, rotate: 8 + mousePos.normX * 8, scaleY: 1.02 }
    if (mood === 'exposed') return { x: mousePos.normX * 14, y: -16 + mousePos.normY * 6, rotate: mousePos.normX * 10, scale: 1.06 }
    return {
      x: mousePos.normX * 18,
      y: [0, -4, 0, mousePos.normY * 8],
      rotate: mousePos.normX * 12,
      scaleY: [1, 1.04, 0.97, 1]
    }
  }

  const getPurpleTransform = () => {
    if (mood === 'shy') return { x: -22, y: 10, rotate: -18, scaleY: 0.92 }
    if (mood === 'nosy') return { x: 24 + mousePos.normX * 16, y: -8 + mousePos.normY * 8, rotate: 12 + mousePos.normX * 12, scaleY: 1.04 }
    if (mood === 'exposed') return { x: mousePos.normX * 18, y: -20 + mousePos.normY * 8, rotate: mousePos.normX * 14, scale: 1.08 }
    return {
      x: mousePos.normX * 26,
      y: [0, -6, 0, mousePos.normY * 12],
      rotate: mousePos.normX * 16,
      scaleY: [1, 1.05, 0.96, 1]
    }
  }

  const getDarkTransform = () => {
    if (mood === 'shy') return { x: -16, y: 8, rotate: -14, scaleY: 0.94 }
    if (mood === 'nosy') return { x: 14 + mousePos.normX * 10, y: -3 + mousePos.normY * 5, rotate: 7 + mousePos.normX * 7, scaleY: 1.02 }
    if (mood === 'exposed') return { x: mousePos.normX * 12, y: -12 + mousePos.normY * 5, rotate: mousePos.normX * 8, scale: 1.05 }
    return {
      x: mousePos.normX * 20,
      y: [0, -3, 0, mousePos.normY * 8],
      rotate: mousePos.normX * 12,
      scaleY: [1, 1.03, 0.98, 1]
    }
  }

  const getYellowTransform = () => {
    if (mood === 'shy') return { x: -18, y: 7, rotate: -12, scaleY: 0.93 }
    if (mood === 'nosy') return { x: 20 + mousePos.normX * 14, y: -6 + mousePos.normY * 6, rotate: 10 + mousePos.normX * 10, scaleY: 1.03 }
    if (mood === 'exposed') return { x: mousePos.normX * 16, y: -16 + mousePos.normY * 6, rotate: mousePos.normX * 12, scale: 1.07 }
    return {
      x: mousePos.normX * 24,
      y: [0, -5, 0, mousePos.normY * 10],
      rotate: mousePos.normX * 14,
      scaleY: [1, 1.04, 0.97, 1]
    }
  }

  // Pupil offsets combining mood presets & cursor tracking
  const getPupilOffset = () => {
    switch (mood) {
      case 'nosy':
        return { cxOffset: 5 + mousePos.pupilX * 0.6, cyOffset: mousePos.pupilY * 0.6 }
      case 'shy':
        return { cxOffset: -6, cyOffset: -5 }
      case 'exposed':
        return { cxOffset: mousePos.pupilX * 0.9, cyOffset: mousePos.pupilY * 0.9 }
      default:
        return { cxOffset: mousePos.pupilX * 1.1, cyOffset: mousePos.pupilY * 1.1 }
    }
  }

  const { cxOffset, cyOffset } = getPupilOffset()
  const springBouncy = { type: 'spring', stiffness: 260, damping: 12 }

  return (
    <div
      ref={stageRef}
      onClick={() => setJumpCount((prev) => prev + 1)}
      className="w-full h-full flex flex-col items-center justify-between p-6 select-none relative overflow-hidden theme-bg-stage theme-text-main cursor-pointer group transition-colors duration-300"
      title="Hover or click characters to make them bounce!"
    >
      {/* Subtle background glow/patterns in cream theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/5 pointer-events-none" />

      {/* Floating sparkles background */}
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [0, 15, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-8 right-8 text-[#E07A5F] pointer-events-none"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ y: [6, -6, 6], scale: [0.9, 1.2, 0.9], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-16 left-8 text-[#E07A5F]/70 text-sm pointer-events-none"
      >
        ✧
      </motion.div>

      {/* Top Status Tag */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold theme-text-main theme-bg-badge px-3.5 py-1.5 rounded-full theme-border border shadow-sm backdrop-blur-md">
        <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F] animate-ping" />
        Interactive Animated Cast
      </div>

      {/* SVG STAGE */}
      <div className="w-full max-w-[360px] h-[270px] relative mt-auto flex items-end justify-center">
        <svg viewBox="0 0 340 240" className="w-full h-full overflow-visible">
          {/* Dynamic Ground Shadow */}
          <motion.ellipse
            cx="170"
            cy="225"
            rx="145"
            ry="12"
            className="fill-[#C5B899] opacity-50"
            animate={{ rx: [140, 152, 140], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ---------------- 1. ORANGE DOME MATE (Front Left) ---------------- */}
          <motion.g
            key={`orange-${jumpCount}`}
            animate={getOrangeTransform()}
            transition={springBouncy}
            whileHover={{ scale: 1.14, y: -16, rotate: -4 }}
            className="origin-bottom cursor-pointer"
          >
            {/* Body */}
            <path d="M 20 220 A 70 65 0 0 1 160 220 Z" fill="#E07A5F" />

            {/* Cheeks / Blush */}
            <circle cx="52" cy="188" r="6" fill="#D25032" opacity="0.35" />
            <circle cx="128" cy="188" r="6" fill="#D25032" opacity="0.35" />

            {/* Eyes */}
            {mood === 'shy' || isBlinking ? (
              <g stroke="#3D261D" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M 62 175 Q 70 168 78 175" />
                <path d="M 102 175 Q 110 168 118 175" />
              </g>
            ) : mood === 'exposed' ? (
              <g>
                <circle cx="70" cy="172" r="10" fill="#FFFDF7" />
                <circle cx="110" cy="172" r="10" fill="#FFFDF7" />
                <motion.circle
                  animate={{ cx: 70 + cxOffset, cy: 172 + cyOffset }}
                  r="4.5"
                  fill="#3D261D"
                />
                <motion.circle
                  animate={{ cx: 110 + cxOffset, cy: 172 + cyOffset }}
                  r="4.5"
                  fill="#3D261D"
                />
              </g>
            ) : (
              <g>
                <circle cx="70" cy="172" r="7.5" fill="#3D261D" />
                <circle cx="110" cy="172" r="7.5" fill="#3D261D" />
                <motion.circle
                  animate={{ cx: 70 + cxOffset, cy: 172 + cyOffset }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  r="3"
                  fill="#FFFDF7"
                />
                <motion.circle
                  animate={{ cx: 110 + cxOffset, cy: 172 + cyOffset }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  r="3"
                  fill="#FFFDF7"
                />
              </g>
            )}

            {/* Mouth */}
            {mood === 'exposed' ? (
              <motion.circle animate={{ r: [6, 9, 6] }} transition={{ duration: 0.8, repeat: Infinity }} cx="90" cy="192" fill="#3D261D" />
            ) : mood === 'nosy' ? (
              <path d="M 82 188 Q 90 196 98 188" stroke="#3D261D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            ) : mood === 'shy' ? (
              <path d="M 85 188 Q 90 184 95 188" stroke="#3D261D" strokeWidth="3" strokeLinecap="round" fill="none" />
            ) : (
              <g>
                <path d="M 81 188 Q 90 197 99 188" stroke="#3D261D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <circle cx="62" cy="186" r="1.5" fill="#3D261D" opacity="0.4" />
                <circle cx="118" cy="186" r="1.5" fill="#3D261D" opacity="0.4" />
              </g>
            )}
          </motion.g>

          {/* ---------------- 2. PURPLE TALL MATE (Back Center Left) ---------------- */}
          <motion.g
            key={`purple-${jumpCount}`}
            animate={getPurpleTransform()}
            transition={{ ...springBouncy, delay: 0.03 }}
            whileHover={{ scale: 1.15, y: -20, rotate: 5 }}
            className="origin-bottom cursor-pointer"
          >
            {/* Body */}
            <rect x="110" y="80" width="75" height="140" rx="18" fill="#6C5CE7" />

            {/* Antenna / Crown Ornament */}
            <motion.circle
              cx="147.5"
              cy="74"
              r="5"
              fill="#A29BFE"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Eyes */}
            {mood === 'shy' || isBlinking ? (
              <g stroke="#FFFDF7" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <line x1="130" y1="120" x2="142" y2="120" />
                <line x1="156" y1="120" x2="168" y2="120" />
              </g>
            ) : mood === 'exposed' ? (
              <g>
                <circle cx="136" cy="118" r="11" fill="#FFFDF7" />
                <circle cx="162" cy="118" r="11" fill="#FFFDF7" />
                <motion.circle
                  animate={{ cx: 136 + cxOffset, cy: 118 + cyOffset }}
                  r="5"
                  fill="#1E1B4B"
                />
                <motion.circle
                  animate={{ cx: 162 + cxOffset, cy: 118 + cyOffset }}
                  r="5"
                  fill="#1E1B4B"
                />
              </g>
            ) : (
              <g>
                <circle cx="136" cy="118" r="7.5" fill="#FFFDF7" />
                <circle cx="162" cy="118" r="7.5" fill="#FFFDF7" />
                <motion.circle
                  animate={{ cx: 136 + cxOffset, cy: 118 + cyOffset }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  r="3.5"
                  fill="#1E1B4B"
                />
                <motion.circle
                  animate={{ cx: 162 + cxOffset, cy: 118 + cyOffset }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  r="3.5"
                  fill="#1E1B4B"
                />
              </g>
            )}

            {/* Mouth */}
            {mood === 'exposed' ? (
              <ellipse cx="149" cy="138" rx="7" ry="10" fill="#FFFDF7" />
            ) : mood === 'nosy' ? (
              <path d="M 142 134 Q 149 142 156 134" stroke="#FFFDF7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M 143 135 Q 149 141 155 135" stroke="#FFFDF7" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}
          </motion.g>

          {/* ---------------- 3. DARK SLATE MATE (Center Right) ---------------- */}
          <motion.g
            key={`dark-${jumpCount}`}
            animate={getDarkTransform()}
            transition={{ ...springBouncy, delay: 0.05 }}
            whileHover={{ scale: 1.15, y: -18, rotate: -6 }}
            className="origin-bottom cursor-pointer"
          >
            {/* Body */}
            <rect x="175" y="125" width="60" height="95" rx="14" fill="#2D3436" />

            {/* Eyes */}
            {mood === 'shy' || isBlinking ? (
              <g stroke="#FFFDF7" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M 188 152 Q 193 147 198 152" />
                <path d="M 212 152 Q 217 147 222 152" />
              </g>
            ) : mood === 'exposed' ? (
              <g>
                <circle cx="193" cy="150" r="8" fill="#FFFDF7" />
                <circle cx="217" cy="150" r="8" fill="#FFFDF7" />
                <motion.circle
                  animate={{ cx: 193 + cxOffset, cy: 150 + cyOffset }}
                  r="3.5"
                  fill="#2D3436"
                />
                <motion.circle
                  animate={{ cx: 217 + cxOffset, cy: 150 + cyOffset }}
                  r="3.5"
                  fill="#2D3436"
                />
              </g>
            ) : (
              <g>
                <circle cx="193" cy="150" r="6" fill="#FFFDF7" />
                <circle cx="217" cy="150" r="6" fill="#FFFDF7" />
                <motion.circle
                  animate={{ cx: 193 + cxOffset, cy: 150 + cyOffset }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  r="3"
                  fill="#2D3436"
                />
                <motion.circle
                  animate={{ cx: 217 + cxOffset, cy: 150 + cyOffset }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  r="3"
                  fill="#2D3436"
                />
              </g>
            )}

            {/* Mouth */}
            {mood === 'exposed' ? (
              <circle cx="205" cy="166" r="5" fill="#FFFDF7" />
            ) : (
              <line x1="199" y1="165" x2="211" y2="165" stroke="#FFFDF7" strokeWidth="3" strokeLinecap="round" />
            )}
          </motion.g>

          {/* ---------------- 4. YELLOW ARCH MATE (Far Right) ---------------- */}
          <motion.g
            key={`yellow-${jumpCount}`}
            animate={getYellowTransform()}
            transition={{ ...springBouncy, delay: 0.07 }}
            whileHover={{ scale: 1.16, y: -20, rotate: 6 }}
            className="origin-bottom cursor-pointer"
          >
            {/* Body */}
            <path
              d="M 225 220 L 225 150 A 30 30 0 0 1 285 150 L 285 220 Z"
              fill="#F4A261"
            />

            {/* Eyes */}
            {mood === 'shy' || isBlinking ? (
              <g stroke="#3D261D" strokeWidth="3" strokeLinecap="round" fill="none">
                <line x1="242" y1="170" x2="252" y2="170" />
                <line x1="262" y1="170" x2="272" y2="170" />
              </g>
            ) : mood === 'exposed' ? (
              <g>
                <circle cx="247" cy="168" r="9" fill="#FFFDF7" />
                <circle cx="267" cy="168" r="9" fill="#FFFDF7" />
                <motion.circle
                  animate={{ cx: 247 + cxOffset, cy: 168 + cyOffset }}
                  r="4"
                  fill="#3D261D"
                />
                <motion.circle
                  animate={{ cx: 267 + cxOffset, cy: 168 + cyOffset }}
                  r="4"
                  fill="#3D261D"
                />
              </g>
            ) : (
              <g>
                <circle cx="247" cy="168" r="6" fill="#3D261D" />
                <circle cx="267" cy="168" r="6" fill="#3D261D" />
                <motion.circle
                  animate={{ cx: 247 + cxOffset, cy: 168 + cyOffset }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  r="2.5"
                  fill="#FFFDF7"
                />
                <motion.circle
                  animate={{ cx: 267 + cxOffset, cy: 168 + cyOffset }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  r="2.5"
                  fill="#FFFDF7"
                />
              </g>
            )}

            {/* Mouth */}
            {mood === 'exposed' ? (
              <path d="M 251 184 Q 257 194 263 184 Z" fill="#3D261D" />
            ) : (
              <path d="M 250 183 Q 257 189 264 183" stroke="#3D261D" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}
          </motion.g>
        </svg>
      </div>

      {/* Mood Tagline */}
      <div className="mt-4 text-center">
        <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#8C7A5C] bg-[#F4ECDB] px-3.5 py-1.5 rounded-full border border-[#E3D7BC] shadow-xs">
          {mood === 'nosy' && '👀 Peeking at your email'}
          {mood === 'shy' && '🙈 Looking away from password'}
          {mood === 'exposed' && '😳 Password exposed!'}
          {mood === 'idle' && '✨ Hover or click us to bounce!'}
        </span>
      </div>
    </div>
  )
}


