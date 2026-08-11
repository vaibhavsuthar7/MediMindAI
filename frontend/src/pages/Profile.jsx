import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { SectionHeading, AnimatedCard, Loader } from '../components/ui'
import api from '../api/client'

export default function Profile() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const [stats, setStats] = useState({
    total_imaging_scans: 0,
    total_symptom_checks: 0,
    total_reports_simplified: 0,
    total_medication_checks: 0,
    recent_activity: [],
    urgency_alerts: [],
  })

  const [imagingHistory, setImagingHistory] = useState([])
  const [symptomHistory, setSymptomHistory] = useState([])
  const [reportHistory, setReportHistory] = useState([])
  const [medicationHistory, setMedicationHistory] = useState([])
  const [chatHistory, setChatHistory] = useState([])

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      api.get('/dashboard/stats'),
      api.get('/imaging/history'),
      api.get('/symptoms/history'),
      api.get('/reports/history'),
      api.get('/medications/history'),
      api.get('/chat/history'),
    ])
      .then(([statsRes, imgRes, symRes, repRes, medRes, chatRes]) => {
        if (statsRes.status === 'fulfilled' && statsRes.value.data) setStats(statsRes.value.data)
        if (imgRes.status === 'fulfilled' && imgRes.value.data) setImagingHistory(imgRes.value.data)
        if (symRes.status === 'fulfilled' && symRes.value.data) setSymptomHistory(symRes.value.data)
        if (repRes.status === 'fulfilled' && repRes.value.data) setReportHistory(repRes.value.data)
        if (medRes.status === 'fulfilled' && medRes.value.data) setMedicationHistory(medRes.value.data)
        if (chatRes.status === 'fulfilled' && chatRes.value.data) setChatHistory(chatRes.value.data)
      })
      .catch((err) => {
        console.warn('Profile data load error:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const totalEnginesUsed =
    (stats.total_imaging_scans > 0 ? 1 : 0) +
    (stats.total_symptom_checks > 0 ? 1 : 0) +
    (stats.total_reports_simplified > 0 ? 1 : 0) +
    (stats.total_medication_checks > 0 ? 1 : 0)

  const totalInteractions =
    (stats.total_imaging_scans || 0) +
    (stats.total_symptom_checks || 0) +
    (stats.total_reports_simplified || 0) +
    (stats.total_medication_checks || 0)

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans selection:bg-[#E07A5F] selection:text-white">
      {/* SECTION HEADER */}
      <SectionHeading
        eyebrow="Patient Medical Profile"
        title="User Analytics & Medical Record Log"
        description="Comprehensive overview of your health profile, AI interaction metrics, and detailed record history across all 5 AI engines."
      />

      {/* USER PROFILE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-[32px] bg-gradient-to-br from-[#FFFDF7] via-[#FFF9F0] to-[#FFE8D6] dark:from-[#1D1512] dark:via-[#160F0D] dark:to-[#281D17] border border-[#E6DCC8] dark:border-[#3D2D25] p-6 sm:p-9 shadow-2xl relative overflow-hidden space-y-6"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E07A5F]/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#E07A5F] to-[#F29F86] text-white flex items-center justify-center font-display font-black text-2xl sm:text-3xl shadow-[0_10px_25px_rgba(224,122,95,0.4)] border-2 border-white/40">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-black text-[#231B0F] dark:text-[#F7F3E9]">
                  {user?.name || 'Patient'}
                </h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                  ✓ Verified Health Pass
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#7C6E59] dark:text-[#A89A84] mt-0.5">
                {user?.email || 'patient@example.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={logout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#231B0F] dark:bg-[#E07A5F] hover:bg-[#3D3222] dark:hover:bg-[#C55F44] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              Sign Out Account
            </button>
          </div>
        </div>

        {/* PROFILE ATTRIBUTES GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E6DCC8]/70 dark:border-white/10 relative z-10">
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase text-[#7C6E59] dark:text-[#A89A84]">Age</span>
            <div className="font-display text-lg font-black text-[#231B0F] dark:text-[#F7F3E9] mt-0.5">
              {user?.age ? `${user.age} Years` : 'Not specified'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase text-[#7C6E59] dark:text-[#A89A84]">Sex / Gender</span>
            <div className="font-display text-lg font-black text-[#231B0F] dark:text-[#F7F3E9] mt-0.5">
              {user?.sex ? user.sex : 'Not specified'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase text-[#7C6E59] dark:text-[#A89A84]">AI Engines Active</span>
            <div className="font-display text-lg font-black text-[#E07A5F] mt-0.5">
              {totalEnginesUsed} / 5 Engines
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase text-[#7C6E59] dark:text-[#A89A84]">Total AI Queries</span>
            <div className="font-display text-lg font-black text-[#231B0F] dark:text-[#F7F3E9] mt-0.5">
              {totalInteractions} Interactions
            </div>
          </div>
        </div>
      </motion.div>

      {/* ANALYTICS STAT CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-black text-[#231B0F] dark:text-[#F7F3E9] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]" />
            Personal Health Analytics
          </h2>
          <span className="text-xs font-mono font-bold text-[#E07A5F]">Real-time Metrics</span>
        </div>

        {loading ? (
          <Loader label="Loading Analytics..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatedCard delay={0.05} className="theme-bg-card theme-border border relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🩺</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                  Triage
                </span>
              </div>
              <div className="font-display text-3xl font-black text-[#231B0F] dark:text-[#F7F3E9]">
                {stats.total_symptom_checks}
              </div>
              <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] font-semibold mt-1">Symptom Triage Checks</p>
            </AnimatedCard>

            <AnimatedCard delay={0.1} className="theme-bg-card theme-border border relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🫁</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30">
                  Vision AI
                </span>
              </div>
              <div className="font-display text-3xl font-black text-[#231B0F] dark:text-[#F7F3E9]">
                {stats.total_imaging_scans}
              </div>
              <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] font-semibold mt-1">X-Ray & Scans Analyzed</p>
            </AnimatedCard>

            <AnimatedCard delay={0.15} className="theme-bg-card theme-border border relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">📄</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Report AI
                </span>
              </div>
              <div className="font-display text-3xl font-black text-[#231B0F] dark:text-[#F7F3E9]">
                {stats.total_reports_simplified}
              </div>
              <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] font-semibold mt-1">Lab Reports Simplified</p>
            </AnimatedCard>

            <AnimatedCard delay={0.2} className="theme-bg-card theme-border border relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">💊</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 border border-purple-500/30">
                  Pharma Guard
                </span>
              </div>
              <div className="font-display text-3xl font-black text-[#231B0F] dark:text-[#F7F3E9]">
                {stats.total_medication_checks}
              </div>
              <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] font-semibold mt-1">Medication Safety Checks</p>
            </AnimatedCard>
          </div>
        )}
      </div>

      {/* DETAILED MEDICAL ACTIVITY & HISTORY LOG SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-black text-[#231B0F] dark:text-[#F7F3E9] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]" />
              Detailed Activity & Medical Record Logs
            </h2>
            <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] font-medium mt-0.5">
              Filter by AI Engine to view past medical scans, symptoms, lab reports, and queries.
            </p>
          </div>

          <Link to="/chat" className="text-xs font-extrabold text-[#E07A5F] hover:underline flex items-center gap-1">
            Ask AI Medical Memory 💬 →
          </Link>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'all', label: 'Recent Overview', icon: '🌟' },
            { id: 'imaging', label: `X-Ray & Scans (${imagingHistory.length})`, icon: '🫁' },
            { id: 'symptoms', label: `Symptom Checks (${symptomHistory.length})`, icon: '🩺' },
            { id: 'reports', label: `Lab Reports (${reportHistory.length})`, icon: '📄' },
            { id: 'medications', label: `Medications (${medicationHistory.length})`, icon: '💊' },
            { id: 'chat', label: `Chat History (${chatHistory.length})`, icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#231B0F] dark:bg-[#E07A5F] text-white shadow-md shadow-[#E07A5F]/20 scale-[1.02]'
                  : 'bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <AnimatedCard className="theme-bg-card theme-border border p-5">
          {activeTab === 'all' && (
            stats?.recent_activity?.length ? (
              <ul className="divide-y theme-border">
                {stats.recent_activity.map((act, i) => (
                  <li key={i} className="py-3.5 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {act.type === 'imaging' ? '🫁' : act.type === 'symptom' ? '🩺' : act.type === 'report' ? '📄' : '💊'}
                      </span>
                      <div>
                        <div className="font-bold text-[#231B0F] dark:text-[#F7F3E9]">{act.label}</div>
                        <div className="text-[11px] text-[#7C6E59] dark:text-[#A89A84] uppercase font-mono font-semibold">
                          {act.type} Analysis
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#7C6E59] dark:text-[#A89A84]">
                      {new Date(act.date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState label="No recent activity logged yet." />
            )
          )}

          {activeTab === 'imaging' && (
            imagingHistory.length ? (
              <div className="space-y-3">
                {imagingHistory.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🫁</span>
                        <span className="font-extrabold text-sm text-[#231B0F] dark:text-[#F7F3E9]">{item.filename}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        item.severity === 'high' ? 'bg-red-500/20 text-red-600' : 'bg-emerald-500/20 text-emerald-600'
                      }`}>
                        {item.severity || 'Normal'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#E07A5F]">
                      Finding: {item.top_finding} ({(item.confidence * 100).toFixed(0)}% confidence)
                    </div>
                    <div className="text-[11px] font-mono text-[#7C6E59] dark:text-[#A89A84]">
                      Analyzed on: {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No X-Ray or Imaging scans analyzed yet." link="/imaging" linkText="Upload X-Ray Scan →" />
            )
          )}

          {activeTab === 'symptoms' && (
            symptomHistory.length ? (
              <div className="space-y-3">
                {symptomHistory.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🩺</span>
                        <span className="font-bold text-xs sm:text-sm text-[#231B0F] dark:text-[#F7F3E9]">
                          "{item.symptoms_text}"
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#F59E0B]/20 text-[#F59E0B]">
                        {item.urgency}
                      </span>
                    </div>
                    {item.possible_conditions?.length > 0 && (
                      <div className="text-xs text-[#7C6E59] dark:text-[#A89A84] space-y-1">
                        <span className="font-bold text-[#231B0F] dark:text-[#F7F3E9]">Possible conditions:</span>
                        <ul className="list-disc list-inside text-[11px]">
                          {item.possible_conditions.map((c, idx) => (
                            <li key={idx}><strong className="text-[#E07A5F]">{c.condition}</strong> - {c.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-[11px] font-mono text-[#7C6E59] dark:text-[#A89A84]">
                      Checked on: {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No symptom checks recorded yet." link="/symptoms" linkText="Check Symptoms →" />
            )
          )}

          {activeTab === 'reports' && (
            reportHistory.length ? (
              <div className="space-y-3">
                {reportHistory.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📄</span>
                        <span className="font-extrabold text-sm text-[#231B0F] dark:text-[#F7F3E9]">{item.filename}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#7C6E59] dark:text-[#A89A84]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] leading-relaxed">
                      {item.simplified_summary}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No lab reports simplified yet." link="/reports" linkText="Upload Lab Report →" />
            )
          )}

          {activeTab === 'medications' && (
            medicationHistory.length ? (
              <div className="space-y-3">
                {medicationHistory.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💊</span>
                        <span className="font-extrabold text-sm text-[#231B0F] dark:text-[#F7F3E9]">
                          New: {item.new_medication}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-600">
                        {item.risk_level} Risk
                      </span>
                    </div>
                    <div className="text-xs text-[#7C6E59] dark:text-[#A89A84]">
                      Current Medications: {item.current_medications?.join(', ') || 'None'}
                    </div>
                    <div className="text-[11px] font-mono text-[#7C6E59] dark:text-[#A89A84]">
                      Checked on: {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No medication safety checks performed yet." link="/medications" linkText="Check Medicine Safety →" />
            )
          )}

          {activeTab === 'chat' && (
            chatHistory.length ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs ${
                      item.role === 'user'
                        ? 'bg-[#E07A5F]/15 border border-[#E07A5F]/30 ml-8 text-right font-medium'
                        : 'bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 mr-8 text-left'
                    }`}
                  >
                    <div className="font-bold text-[11px] uppercase tracking-wider mb-1 text-[#E07A5F]">
                      {item.role === 'user' ? 'You' : 'MediMind AI'}
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{item.content}</p>
                    <div className="text-[10px] font-mono text-[#7C6E59] dark:text-[#A89A84] mt-1.5 opacity-70">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="No AI chat conversations recorded yet." link="/chat" linkText="Start AI Health Chat →" />
            )
          )}
        </AnimatedCard>
      </div>
    </div>
  )
}

function EmptyState({ label, link, linkText }) {
  return (
    <div className="text-center py-10 space-y-3">
      <p className="text-sm font-semibold text-[#7C6E59] dark:text-[#A89A84]">{label}</p>
      {link && (
        <Link
          to={link}
          className="inline-block text-xs font-black px-5 py-2 rounded-full bg-[#E07A5F] text-white shadow-md hover:bg-[#C55F44] transition-all"
        >
          {linkText}
        </Link>
      )}
    </div>
  )
}
