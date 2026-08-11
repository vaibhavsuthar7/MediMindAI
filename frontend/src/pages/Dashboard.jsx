import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { AnimatedCard, SectionHeading, Loader } from '../components/ui'
import ThreeScene from '../components/ThreeScene'

const agentLinks = [
  { to: '/symptoms', title: 'Symptom Checker', desc: 'Describe symptoms & get immediate health guidance.', icon: '🩺', badge: 'Fast Triage' },
  { to: '/imaging', title: 'X-Ray & Scan Analyzer', desc: 'Upload chest X-rays or medical scans for quick screening.', icon: '🫁', badge: 'AI Vision' },
  { to: '/reports', title: 'Lab Report Explainer', desc: 'Convert medical & lab report PDFs into simple plain English.', icon: '📄', badge: 'PDF Parser' },
  { to: '/medications', title: 'Medicine Safety Checker', desc: 'Check if your new medicine is safe with existing drugs.', icon: '💊', badge: 'Interaction Guard' },
  { to: '/chat', title: 'Ask AI Health Records', desc: 'Ask questions across your entire health history & reports.', icon: '💬', badge: 'RAG Memory' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_imaging_scans: 0,
    total_symptom_checks: 0,
    total_reports_simplified: 0,
    total_medication_checks: 0,
    recent_activity: [],
    urgency_alerts: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => {
        if (res.data) setStats(res.data)
      })
      .catch((err) => {
        console.warn('Dashboard stats load error:', err)
      })
  }, [])

  const counters = [
    { label: 'Symptom checks', value: stats?.total_symptom_checks ?? 0, icon: '🩺' },
    { label: 'Imaging scans', value: stats?.total_imaging_scans ?? 0, icon: '🫁' },
    { label: 'Reports explained', value: stats?.total_reports_simplified ?? 0, icon: '📄' },
    { label: 'Medicine checks', value: stats?.total_medication_checks ?? 0, icon: '💊' },
  ]

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Patient dashboard"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Five AI health tools integrated with neural memory. Everything you check is securely remembered so 'Ask AI Health Records' can answer questions across your full medical history."
      />


      {loading ? (
        <Loader label="Loading Health Core…" />
      ) : (
        <>
          {stats?.urgency_alerts?.length > 0 && (
            <AnimatedCard className="border border-[#E07A5F]/40 theme-bg-card backdrop-blur-xl shadow-md">
              <h3 className="font-display text-lg theme-text-main font-bold mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F] animate-ping" />
                Needs Attention
              </h3>
              <ul className="space-y-2">
                {stats.urgency_alerts.map((a, i) => (
                  <li key={i} className="text-sm theme-text-main font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E07A5F]" />
                    {a.label}
                  </li>
                ))}
              </ul>
            </AnimatedCard>
          )}

          {/* Stat Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {counters.map((c, i) => (
              <AnimatedCard
                key={c.label}
                delay={i * 0.05}
                className="text-center group relative overflow-hidden theme-bg-card theme-border border hover:border-[#E07A5F] transition-all duration-300 transform hover:-translate-y-1 shadow-[0_8px_30px_rgba(100,80,50,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{c.icon}</div>
                <div className="font-display text-3xl md:text-4xl font-extrabold theme-text-main">
                  {c.value}
                </div>
                <div className="text-xs theme-text-sub mt-1 font-semibold">{c.label}</div>
              </AnimatedCard>
            ))}
          </div>

          {/* Health Tools Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl md:text-2xl theme-text-main font-bold tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E07A5F] shadow-[0_0_8px_rgba(224,122,95,0.6)]" />
                Health Tools & AI Assistants
              </h2>
              <span className="text-xs font-mono font-bold theme-text-main theme-bg-badge px-3.5 py-1 rounded-full uppercase theme-border border">
                5 Active Engines
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {agentLinks.map((a, i) => (
                <Link to={a.to} key={a.to} className="group">
                  <AnimatedCard
                    delay={i * 0.05}
                    className="relative h-full theme-bg-card theme-border border group-hover:border-[#E07A5F] transition-all duration-300 transform group-hover:-translate-y-1 shadow-[0_10px_30px_rgba(100,80,50,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[0_16px_40px_rgba(224,122,95,0.12)] overflow-hidden"
                  >
                    {/* Soft Terracotta Glow on Hover */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-[#E07A5F]/10 group-hover:bg-[#E07A5F]/20 blur-2xl transition-all" />

                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl p-2.5 rounded-2xl theme-bg-stage theme-border border group-hover:scale-110 transition-transform">
                        {a.icon}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full theme-btn-primary shadow-sm">
                        {a.badge}
                      </span>
                    </div>

                    <div className="font-display text-lg md:text-xl font-bold theme-text-main group-hover:text-[#E07A5F] transition-colors mb-1.5">
                      {a.title}
                    </div>
                    <div className="text-sm theme-text-sub font-normal leading-relaxed">{a.desc}</div>

                    <div className="mt-4 pt-3 border-t theme-border flex items-center justify-between text-xs font-bold text-[#E07A5F] group-hover:text-[#C55F44]">
                      <span>Launch Tool →</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] theme-text-sub">
                        ONLINE
                      </span>
                    </div>
                  </AnimatedCard>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl theme-text-main font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]" />
                Recent Activity & Medical Memory
              </h2>
              <Link to="/chat" className="text-xs font-mono font-bold text-[#E07A5F] hover:text-[#C55F44] transition-colors flex items-center gap-1">
                Ask AI Health History 💬 →
              </Link>
            </div>
            <AnimatedCard className="theme-bg-card theme-border border">
              {stats?.recent_activity?.length ? (
                <ul className="divide-y theme-border">
                  {stats.recent_activity.map((a, i) => {
                    const targetRoute =
                      a.type === 'imaging' ? '/imaging' :
                      a.type === 'symptom' ? '/symptoms' :
                      a.type === 'report' ? '/reports' :
                      a.type === 'medication' ? '/medications' : '/chat'
                    
                    const icon =
                      a.type === 'imaging' ? '🫁' :
                      a.type === 'symptom' ? '🩺' :
                      a.type === 'report' ? '📄' :
                      a.type === 'medication' ? '💊' : '💬'

                    return (
                      <li key={i}>
                        <Link
                          to={targetRoute}
                          className="py-3 px-3 flex items-center justify-between text-sm hover:theme-bg-badge rounded-xl transition-all group font-medium cursor-pointer block"
                        >
                          <span className="theme-text-main group-hover:text-[#E07A5F] flex items-center gap-2.5 transition-colors">
                            <span className="text-base">{icon}</span>
                            {a.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="theme-text-sub text-xs font-mono font-semibold">
                              {new Date(a.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-bold text-[#E07A5F] group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="theme-text-sub text-sm py-2 font-medium">No activity recorded yet — choose a Health Tool above to begin.</p>
              )}
            </AnimatedCard>
          </div>
        </>
      )}

    </div>
  )
}

