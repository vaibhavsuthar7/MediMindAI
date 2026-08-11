import { motion } from 'framer-motion'

/**
 * The app's signature visual element: a continuous ECG-style pulse line
 * that runs through the navbar, representing the orchestrator's "live"
 * multi-agent system. Respects prefers-reduced-motion via CSS override
 * in index.css.
 */
export default function PulseLine({ className = '', color = '#E07A5F' }) {
  const path =
    'M0,20 L60,20 L75,20 L85,5 L95,35 L105,20 L120,20 L130,10 L140,30 L150,20 L400,20'

  return (
    <svg
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="60 340"
        initial={{ strokeDashoffset: 400 }}
        animate={{ strokeDashoffset: -400 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  )
}
