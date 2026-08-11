import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '../components/ThemeToggle'
import PulseLine from '../components/PulseLine'
import AnimatedContactUs from '../components/AnimatedContactUs'
import MediMind3DHero from '../components/MediMind3DHero'
import DoctorEmoji3D from '../components/DoctorEmoji3D'
import MediMindLoader from '../components/MediMindLoader'

const features = [
  {
    id: 'imaging',
    icon: '🩻',
    title: 'X-Ray & Scans Analysis',
    subtitle: 'PyTorch ResNet-18 Vision Models',
    desc: 'Fine-tuned ResNet-18 deep learning models trained across 5 medical imaging domains (Chest X-Ray, Brain Tumor, Bone Fracture, Skin HAM10000, Eye OCT2017) with confidence scoring & Hindi translation.',
    tag: 'ResNet-18 Vision',
    color: 'from-[#E07A5F] to-[#F29F86]',
    borderColor: '#E07A5F',
  },
  {
    id: 'symptom',
    icon: '🩺',
    title: 'Smart Symptom Triage',
    subtitle: 'RandomForest & Calibrated SVM',
    desc: 'Dual ML pipeline combining 100% accurate RandomForest/ExtraTrees structured symptom classifier with 97.5% accurate free-text TF-IDF + Calibrated LinearSVC classifier.',
    tag: 'ML Triage (97.5%-100%)',
    color: 'from-amber-500 to-orange-400',
    borderColor: '#F59E0B',
  },
  {
    id: 'report',
    icon: '📄',
    title: 'Lab Report Simplifier',
    subtitle: 'Medical Jargon Translator',
    desc: 'Upload PDF pathology reports to get plain-language summaries and key medical terms explained simply for non-clinical readers.',
    tag: 'Report AI',
    color: 'from-emerald-500 to-teal-400',
    borderColor: '#10B981',
  },
  {
    id: 'medication',
    icon: '💊',
    title: 'Medicine Safety & Interaction',
    subtitle: 'Pharmacology Screening',
    desc: 'Cross-checks multiple medications against food and drug-to-drug interactions to help prevent unintended adverse side-effects.',
    tag: 'Pharma AI',
    color: 'from-purple-500 to-indigo-400',
    borderColor: '#8B5CF6',
  },
  {
    id: 'rag',
    icon: '💬',
    title: 'AI Health Assistant',
    subtitle: 'Vector Memory RAG Chat',
    desc: 'Personalized health Q&A backed by ChromaDB vector store memory that recalls past scans, reports, and triage history.',
    tag: 'Memory RAG',
    color: 'from-blue-500 to-cyan-400',
    borderColor: '#06B6D4',
  },
]

const stats = [
  { value: '100%', label: 'Structured Triage Accuracy (RandomForest)' },
  { value: '97.5%', label: 'Free-Text Symptom Accuracy (TF-IDF + SVM)' },
  { value: '5', label: 'Trained ResNet-18 Vision Models (Chest, Brain, Bone, Skin, Eye)' },
  { value: '< 1.8s', label: 'Real-time Inference Speed' },
]

export default function Landing() {
  const [activeAgent, setActiveAgent] = useState('imaging')
  const [showIntro, setShowIntro] = useState(true)
  const [fastMode, setFastMode] = useState(false)
  const featuresRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 2200)
    return () => clearTimeout(timer)
  }, [])

  const handleSelectAgent = (agentId) => {
    setActiveAgent(agentId)
    navigate('/login')
  }

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.05 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50"
        >
          <MediMindLoader />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen bg-[#FFFDF7] dark:bg-[#120D0B] text-[#231B0F] dark:text-[#F7F3E9] font-sans selection:bg-[#E07A5F] selection:text-white transition-colors duration-300 relative overflow-hidden"
        >
      {/* BACKGROUND AMBIENT GLOW MESH */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#E07A5F]/15 via-[#E07A5F]/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] -right-40 w-96 h-96 bg-[#2EE6A8]/10 dark:bg-[#E07A5F]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 -left-40 w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* PUBLIC FLOATING GLASSMORPHIC NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFDF7]/75 dark:bg-[#140E0C]/75 backdrop-blur-2xl border-b border-[#E6DCC8]/70 dark:border-white/10 shadow-[0_8px_32px_rgba(100,80,50,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E07A5F] to-[#F29F86] text-white flex items-center justify-center font-bold text-sm shadow-[0_4px_18px_rgba(224,122,95,0.45)] group-hover:scale-105 transition-transform duration-300">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div className="font-display text-xl sm:text-2xl font-black tracking-tight text-[#231B0F] dark:text-[#F7F3E9]">
              MediMind <span className="text-[#E07A5F] font-black">AI</span>
            </div>
          </Link>

          {/* CENTER FLOATING GLASS NAV CAPSULE */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_4px_25px_rgba(100,80,50,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <a href="#3d-hero" className="px-4 py-2 rounded-full text-xs font-extrabold text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
              AI Core
            </a>
            <a href="#features" className="px-4 py-2 rounded-full text-xs font-extrabold text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
              Agents
            </a>
            <a href="#3d-scans" className="px-4 py-2 rounded-full text-xs font-extrabold text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
              Interactive Scans
            </a>
            <a href="#ai-doctor" className="px-4 py-2 rounded-full text-xs font-extrabold text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
              Dr. Mind
            </a>
            <a href="#contact" className="px-4 py-2 rounded-full text-xs font-extrabold text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-[#F7F3E9] hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
              Contact
            </a>
          </nav>

          {/* RIGHT ACTION CLUSTER */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-extrabold px-5 py-2 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 text-[#231B0F] dark:text-[#F7F3E9] hover:border-[#E07A5F] hover:bg-white/60 transition-all flex items-center justify-center whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-xs font-black px-5 py-2 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#F29F86] hover:from-[#C55F44] hover:to-[#E07A5F] text-white shadow-md shadow-[#E07A5F]/25 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center whitespace-nowrap"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setFastMode(!fastMode)}
              className={`text-xs font-black px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                fastMode
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 ring-2 ring-amber-500/30'
                  : 'bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/10 text-[#7C6E59] dark:text-[#A89A84] hover:text-[#231B0F] dark:hover:text-white'
              }`}
              title="Switch between Ultra WebGL and Fast 2D Mode for low-spec laptops"
            >
              <span>{fastMode ? '⚡ 2D Fast Mode' : '🧊 Interactive Mode'}</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH CANVAS */}
      <section id="3d-hero" className="relative pt-12 pb-16 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 dark:bg-white/8 backdrop-blur-2xl border border-white/60 dark:border-white/15 shadow-[0_8px_25px_rgba(224,122,95,0.12)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] my-2"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E07A5F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E07A5F]"></span>
          </span>
          <span className="text-[11px] font-mono font-black uppercase tracking-widest text-[#E07A5F]">
            MULTIMODAL HEALTHCARE AI ORCHESTRATOR
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1]"
        >
          Next-Gen <span className="text-[#E07A5F]">Medical Intelligence</span> & Multi-Agent AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg text-[#7C6E59] dark:text-[#A89A84] max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Experience 5 specialized AI agents working together in real-time for instant X-ray vision screening, symptom triage, lab report simplification, and medication interaction safety.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link
            to="/signup"
            className="px-8 py-3.5 rounded-full bg-[#E07A5F] hover:bg-[#C55F44] text-white font-extrabold text-sm shadow-[0_10px_30px_rgba(224,122,95,0.4)] hover:shadow-[0_15px_35px_rgba(224,122,95,0.5)] active:scale-95 transition-all flex items-center gap-2"
          >
            Launch MediMind Platform
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <a
            href="#features"
            className="px-8 py-3.5 rounded-full bg-white/60 dark:bg-white/5 border border-[#D8CDB6] dark:border-white/10 hover:border-[#E07A5F] font-bold text-sm text-[#231B0F] dark:text-[#F7F3E9] transition-all"
          >
            Explore AI Agents
          </a>
        </motion.div>

        {/* 🌟 3D / 2D INTERACTIVE HERO CANVAS */}
        <div className="pt-6 max-w-5xl mx-auto">
          {fastMode ? (
            <div className="p-8 rounded-[32px] bg-white/70 dark:bg-[#1A1310]/80 backdrop-blur-xl border border-[#E6DCC8] dark:border-[#332620] shadow-2xl text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E07A5F]/15 text-[#E07A5F] text-xs font-mono font-black uppercase tracking-widest border border-[#E07A5F]/30">
                <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-ping" />
                ⚡ ULTRA FAST 2D MULTI-AGENT ARCHITECTURE (0% GPU LAG)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
                {features.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleSelectAgent(f.id)}
                    className={`p-4 rounded-2xl border transition-all text-center space-y-2 cursor-pointer ${
                      activeAgent === f.id
                        ? 'bg-[#E07A5F] text-white border-[#E07A5F] shadow-lg scale-105 ring-2 ring-[#E07A5F]/40'
                        : 'bg-white/80 dark:bg-white/5 border-[#E6DCC8] dark:border-white/10 hover:border-[#E07A5F]'
                    }`}
                  >
                    <div className="text-3xl">{f.icon}</div>
                    <div className="text-xs font-black">{f.title}</div>
                    <div className="text-[10px] font-mono opacity-80">{f.tag}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <MediMind3DHero activeAgent={activeAgent} setActiveAgent={handleSelectAgent} />
          )}
        </div>

        {/* HERO PULSE GRAPH */}
        <div className="pt-4 max-w-3xl mx-auto">
          <PulseLine className="w-full h-12 text-[#E07A5F]/70 my-2" color="#E07A5F" />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-[#E6DCC8]/80 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="font-display text-3xl sm:text-4xl font-black text-[#E07A5F]">{s.value}</div>
              <div className="text-xs font-bold text-[#7C6E59] dark:text-[#A89A84]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES / AGENTS SHOWCASE */}
      <section ref={featuresRef} id="features" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 space-y-16">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-mono font-extrabold text-[#E07A5F] uppercase tracking-widest">
            Specialized Multi-Agent Suite
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black">Powered by 5 Health AI Agents</h2>
          <p className="text-sm text-[#7C6E59] dark:text-[#A89A84]">
            Select an agent below or click the interactive nodes above to highlight its capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const isSelected = activeAgent === f.id
            return (
              <Link
                key={f.id}
                to="/login"
                onMouseEnter={() => setActiveAgent(f.id)}
                className="block group"
              >
                <motion.div
                  whileHover={{ y: -6 }}
                  className={`p-7 rounded-[32px] bg-white/70 dark:bg-[#1A1310]/80 backdrop-blur-xl border transition-all duration-300 space-y-4 relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'border-[#E07A5F] shadow-[0_20px_50px_rgba(224,122,95,0.25)] ring-2 ring-[#E07A5F]/50 scale-[1.02]'
                      : 'border-[#E6DCC8] dark:border-[#332620] shadow-[0_15px_40px_rgba(100,80,50,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#E07A5F]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-3 rounded-2xl bg-[#EDE5CF]/50 dark:bg-[#281F1A] border border-[#E6DCC8]/60 dark:border-[#3D3029]">
                      {f.icon}
                    </span>
                    <span className="text-[10px] font-mono font-extrabold px-3 py-1 rounded-full bg-[#E07A5F]/15 text-[#E07A5F] border border-[#E07A5F]/30 group-hover:bg-[#E07A5F] group-hover:text-white transition-colors">
                      {f.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold flex items-center gap-2">
                      {f.title}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-ping" />
                      )}
                    </h3>
                    <span className="text-xs font-semibold text-[#E07A5F]">{f.subtitle}</span>
                  </div>
                  <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] leading-relaxed font-medium">
                    {f.desc}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs font-extrabold text-[#E07A5F] group-hover:translate-x-1 transition-transform">
                    <span>Sign In to Access Agent</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 👨‍⚕️ AI DOCTOR MASCOT SHOWCASE SECTION */}
      <section id="ai-doctor" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="rounded-[36px] bg-gradient-to-br from-[#FFF5EA] via-[#FFFDF7] to-[#FFE8D6] dark:from-[#1F1713] dark:via-[#160E0C] dark:to-[#2A1D17] border border-[#E07A5F]/20 dark:border-white/10 p-8 sm:p-14 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFC107]/20 text-[#D97706] dark:text-[#FFC107] text-xs font-mono font-extrabold uppercase tracking-widest border border-[#FFC107]/30">
              <span className="w-2 h-2 rounded-full bg-[#FFC107] animate-ping" />
              INTERACTIVE AI MASCOT
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black leading-tight">
              Meet Dr. Mind — Your Friendly <span className="text-[#E07A5F]">AI Health Assistant</span>
            </h2>
            <p className="text-base text-[#7C6E59] dark:text-[#A89A84] leading-relaxed font-medium">
              Powered by real-time multimodal multi-agent intelligence. Dr. Mind guides you through symptom triage, X-ray vision screening, pathology lab report translation, and medication interaction safety.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/chat"
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#E07A5F] to-[#F29F86] hover:from-[#C55F44] hover:to-[#E07A5F] text-white font-black text-xs shadow-lg shadow-[#E07A5F]/25 active:scale-95 transition-all flex items-center gap-2"
              >
                Chat With Dr. Mind
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="w-full h-[420px]">
            {fastMode ? (
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-[#E07A5F]/20 via-[#FFC107]/10 to-transparent border border-[#E07A5F]/30 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="text-7xl animate-bounce">🩺</div>
                <div className="font-display text-2xl font-black text-[#231B0F] dark:text-[#F7F3E9]">Dr. Mind AI Assistant</div>
                <p className="text-xs text-[#7C6E59] dark:text-[#A89A84] max-w-sm font-medium">Multimodal multi-agent AI assistant ready to help analyze your medical scans, symptoms, & lab reports.</p>
              </div>
            ) : (
              <DoctorEmoji3D className="w-full h-full" />
            )}
          </div>
        </div>
      </section>



      {/* SECURITY & PRIVACY SECTION */}
      <section id="security" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto relative z-10 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center mx-auto text-2xl border border-[#E07A5F]/30">
          🔒
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-black">Privacy-First Architecture</h2>
        <p className="text-sm text-[#7C6E59] dark:text-[#A89A84] max-w-xl mx-auto font-medium leading-relaxed">
          Your medical records, X-ray scans, and health data are protected with JWT encryption and strict user data isolation.
        </p>
      </section>

      {/* 📬 ANIMATED CONTACT US SECTION */}
      <section id="contact" className="py-20 px-4 sm:px-8 max-w-5xl mx-auto relative z-10 space-y-6 text-center">
        <div className="space-y-2">
          <span className="text-xs font-mono font-extrabold text-[#E07A5F] uppercase tracking-widest">
            Get In Touch
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black">Contact Us</h2>
        </div>

        <AnimatedContactUs />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E6DCC8] dark:border-white/10 py-10 px-4 sm:px-8 text-center text-xs text-[#7C6E59] dark:text-[#A89A84] space-y-3 relative z-10">
        <div className="font-display text-lg font-black text-[#231B0F] dark:text-[#F7F3E9]">
          MediMind <span className="text-[#E07A5F]">AI</span>
        </div>
        <p className="max-w-xl mx-auto">
          Medical Disclaimer: MediMind AI is an AI screening assistant tool, not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
        <div>© {new Date().getFullYear()} MediMind AI. All rights reserved.</div>
      </footer>
      </motion.div>
    )}
  </AnimatePresence>
  )
}
