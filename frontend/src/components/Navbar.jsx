import { NavLink, useNavigate } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/symptoms', label: 'Symptom Checker' },
  { to: '/imaging', label: 'X-Ray & Scans' },
  { to: '/reports', label: 'Lab Reports' },
  { to: '/medications', label: 'Medicine Safety' },
  { to: '/chat', label: 'AI Health Assistant' },
]

export default function Navbar() {
  const { user, logout, isClerkActive } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#FFFDF7]/85 dark:bg-[#140E0C]/85 backdrop-blur-2xl border-b border-[#E6DCC8]/70 dark:border-white/10 shadow-[0_8px_32px_rgba(100,80,50,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">

          {/* LOGO WITH AMBIENT GLOW */}
          <NavLink to="/" className="flex items-center gap-3 group relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E07A5F] to-[#F29F86] text-white flex items-center justify-center font-bold text-sm shadow-[0_4px_18px_rgba(224,122,95,0.45)] group-hover:scale-105 group-hover:shadow-[0_6px_22px_rgba(224,122,95,0.6)] transition-all duration-300">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>

            <div className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#231B0F] dark:text-[#F7F3E9]">
              MediMind <span className="text-[#E07A5F] font-black">AI</span>
            </div>
          </NavLink>

          {/* CENTER FLOATING GLASSMORPHIC NAV CAPSULE */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_4px_25px_rgba(100,80,50,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-[#231B0F] dark:bg-[#E07A5F] text-[#FFFDF7] dark:text-white shadow-md shadow-[#E07A5F]/25 scale-[1.03]'
                      : 'text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9] hover:bg-white/60 dark:hover:bg-white/10'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* RIGHT ACTION CLUSTER */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {isClerkActive ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:block text-xs font-extrabold text-[#231B0F] dark:text-[#F7F3E9] px-2">{user?.name}</span>
                <UserButton afterSignOutUrl="/login" />
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="text-xs font-black px-4 py-2 rounded-full bg-[#231B0F] dark:bg-[#E07A5F] hover:bg-[#3D3222] dark:hover:bg-[#C55F44] text-[#FFFDF7] dark:text-white shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  Log out
                </button>

                {user?.name && (
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `flex items-center gap-2 text-xs font-extrabold px-4 py-2 rounded-full border transition-all duration-300 whitespace-nowrap ${
                        isActive
                          ? 'bg-[#E07A5F] text-white border-[#E07A5F] shadow-md shadow-[#E07A5F]/30 scale-[1.03]'
                          : 'bg-white/50 dark:bg-white/10 backdrop-blur-md border-white/60 dark:border-white/15 text-[#231B0F] dark:text-[#F7F3E9] hover:border-[#E07A5F]/60 hover:bg-white/80 dark:hover:bg-white/20'
                      }`
                    }
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>My Profile</span>
                    <span className="opacity-75 font-mono text-[11px]">({user.name.split(' ')[0]})</span>
                  </NavLink>
                )}
              </>
            )}
          </div>
        </div>

        {/* MOBILE GLASS NAVIGATION BAR */}
        <nav className="flex lg:hidden gap-1.5 pt-2.5 pb-1 overflow-x-auto border-t border-white/30 dark:border-white/10 mt-2">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#231B0F] dark:bg-[#E07A5F] text-white shadow-sm'
                    : 'text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9] hover:bg-white/40 dark:hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

      </div>
    </header>
  )
}
