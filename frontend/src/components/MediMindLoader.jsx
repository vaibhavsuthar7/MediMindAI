import React from 'react'

const LETTERS = [
  { char: 'M', delay: '0.1s' },
  { char: 'e', delay: '0.205s' },
  { char: 'd', delay: '0.31s' },
  { char: 'i', delay: '0.415s' },
  { char: 'M', delay: '0.521s' },
  { char: 'i', delay: '0.626s' },
  { char: 'n', delay: '0.731s' },
  { char: 'd', delay: '0.837s' },
  { char: '\u00A0', delay: '0.9s' },
  { char: 'A', delay: '0.942s' },
  { char: 'I', delay: '1.047s' },
]

export default function MediMindLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-[#120D0B] text-white flex flex-col items-center justify-center font-sans overflow-hidden select-none">
      <div className="loader-wrapper">
        {LETTERS.map((item, idx) => (
          <span
            key={idx}
            className="loader-letter"
            style={{ animationDelay: item.delay }}
          >
            {item.char}
          </span>
        ))}
        <div className="loader" />
      </div>

      <div className="mt-8 text-xs font-mono font-bold tracking-widest text-[#E07A5F] opacity-80 uppercase animate-pulse">
        INITIALIZING MEDICAL AI ORCHESTRATOR...
      </div>
    </div>
  )
}
