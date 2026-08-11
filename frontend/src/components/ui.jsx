import { motion } from 'framer-motion'

export function Card({ children, className = '' }) {
  return (
    <div className={`theme-bg-card theme-border theme-text-main rounded-[24px] p-6 shadow-[0_12px_36px_rgba(100,80,50,0.06)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] transition-colors duration-300 ${className}`}>
      {children}
    </div>
  )
}

export function AnimatedCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`theme-bg-card theme-border theme-text-main rounded-[24px] p-6 shadow-[0_12px_36px_rgba(100,80,50,0.06)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] transition-colors duration-300 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full theme-bg-stage theme-border text-xs font-bold uppercase tracking-wider text-[#E07A5F] mb-2.5 backdrop-blur-md shadow-xs">
          <svg className="w-3.5 h-3.5 text-[#E07A5F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span>{eyebrow}</span>
        </div>

      )}
      <h1 className="font-display text-3xl md:text-4xl theme-text-main font-extrabold mb-2 tracking-tight transition-colors duration-300">{title}</h1>
      {description && <p className="theme-text-sub text-sm max-w-2xl leading-relaxed font-medium transition-colors duration-300">{description}</p>}
    </div>
  )
}


export function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
  const variants = {
    primary: 'bg-[#231B0F] dark:bg-[#E07A5F] text-[#FFFDF7] dark:text-white hover:bg-[#3D3222] dark:hover:bg-[#C55F44] active:scale-[0.99] shadow-md dark:shadow-[0_4px_16px_rgba(224,122,95,0.4)]',
    ghost: 'border border-[#D8CDB6] dark:border-[#3D3029] theme-text-main hover:bg-[#EDE5CF] dark:hover:bg-[#281F1A] active:scale-[0.99]',
    alert: 'bg-[#E07A5F] text-white hover:bg-[#C55F44] active:scale-[0.99]',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full bg-[#FFFDF7] dark:bg-[#251D19] border border-[#D8CDB6] dark:border-[#4D3C33] text-[#231B0F] dark:text-[#F7F3E9] placeholder:text-[#A89A84] dark:placeholder:text-[#9A8A77] hover:border-[#E07A5F]/60 dark:hover:border-[#E07A5F]/60 focus:border-[#E07A5F] dark:focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20 dark:focus:ring-[#E07A5F]/30 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition-all duration-200 shadow-xs ${props.className || ''}`}
    />
  )
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full bg-[#FFFDF7] dark:bg-[#251D19] border border-[#D8CDB6] dark:border-[#4D3C33] text-[#231B0F] dark:text-[#F7F3E9] placeholder:text-[#A89A84] dark:placeholder:text-[#9A8A77] hover:border-[#E07A5F]/60 dark:hover:border-[#E07A5F]/60 focus:border-[#E07A5F] dark:focus:border-[#E07A5F] focus:ring-2 focus:ring-[#E07A5F]/20 dark:focus:ring-[#E07A5F]/30 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition-all duration-200 resize-none shadow-xs ${props.className || ''}`}
    />
  )
}


export function UrgencyBadge({ level }) {
  const map = {
    self_care: { label: 'Self care', cls: 'bg-[#EDE5CF] dark:bg-[#281F1A] text-[#231B0F] dark:text-[#F7F3E9] border-[#D8CDB6] dark:border-[#3D3029]' },
    consult_doctor: { label: 'Consult a doctor', cls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800' },
    emergency: { label: 'Emergency', cls: 'bg-[#E07A5F] text-white border-[#C55F44] animate-pulse font-bold' },
    low: { label: 'Low', cls: 'bg-[#EDE5CF] dark:bg-[#281F1A] text-[#231B0F] dark:text-[#F7F3E9] border-[#D8CDB6] dark:border-[#3D3029]' },
    moderate: { label: 'Moderate', cls: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800' },
    high: { label: 'High', cls: 'bg-[#E07A5F] text-white border-[#C55F44]' },
    unknown: { label: 'Unknown', cls: 'bg-[#E6DCC8] dark:bg-[#281F1A] text-[#594C38] dark:text-[#A89A84] border-[#D8CDB6] dark:border-[#3D3029]' },
  }
  const item = map[level] || map.unknown
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${item.cls}`}>
      {item.label}
    </span>
  )
}

export function Disclaimer({ children }) {
  return (
    <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] border-t border-[#E6DCC8] dark:border-[#362A24] pt-3 mt-4 leading-relaxed font-medium">
      Wait ⚠ {children}
    </p>
  )
}

export function Loader({ label = 'Thinking…' }) {
  return (
    <div className="flex items-center gap-3 text-[#594C38] dark:text-[#C5B5A2] text-sm font-semibold">
      <motion.span
        className="w-3 h-3 rounded-full bg-[#E07A5F] shadow-[0_0_10px_rgba(224,122,95,0.5)]"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.1, repeat: Infinity }}
      />
      {label}
    </div>
  )
}

export function FormattedText({ text = '' }) {
  if (!text) return null

  const lines = text.split('\n')

  return (
    <div className="space-y-2.5 text-sm text-[#231B0F] dark:text-[#F7F3E9] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        const isHeading =
          trimmed.startsWith('#') ||
          (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 70) ||
          /^(step \d+|analysis of|top finding:|confidence:|severity:|summary:|findings:|primary pathology|associated clinical|diagnostic next steps)/i.test(trimmed)

        const parts = trimmed.split(/(\*\*.*?\*\*)/g)
        const content = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} className="font-bold text-[#231B0F] dark:text-[#F7F3E9]">
                {part.slice(2, -2)}
              </strong>
            )
          }
          return part
        })

        if (isHeading) {
          return (
            <div key={idx} className="font-display font-bold text-base text-[#E07A5F] mt-4 mb-1.5 flex items-center gap-2 border-b border-[#E6DCC8] dark:border-[#362A24] pb-1">
              <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
              {content}
            </div>
          )
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('+ ')) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-3 border-l-2 border-[#E07A5F]/50 my-1">
              <span className="text-[#E07A5F] font-bold text-xs mt-0.5">•</span>
              <div className="flex-1 text-[#3D3222] dark:text-[#E6D8C6] font-medium">{content}</div>
            </div>
          )
        }

        return (
          <p key={idx} className="text-[#3D3222] dark:text-[#E6D8C6] font-medium">
            {content}
          </p>
        )
      })}

    </div>
  )
}



