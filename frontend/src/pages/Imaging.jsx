import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, useGLTF, Center, Sparkles } from '@react-three/drei'
import api from '../api/client'
import { AnimatedCard, SectionHeading, Button, UrgencyBadge, Disclaimer, Loader, FormattedText } from '../components/ui'

function Imaging3DViewer() {
  const { scene } = useGLTF('/models/imaging.glb')
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const modelRef = useRef()

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.75
    }
  })

  return (
    <group ref={modelRef}>
      <Center>
        <primitive object={clonedScene} scale={1.8} position={[0, 0, 0]} />
      </Center>
    </group>
  )
}

export default function Imaging() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showRoiOverlay, setShowRoiOverlay] = useState(true)
  const [lang, setLang] = useState('en')

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setPreview(URL.createObjectURL(f))
  }

  async function loadPreset(presetType) {
    setLoading(true)
    setError('')
    setResult(null)

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext('2d')

    // Grayscale X-ray digital canvas background
    ctx.fillStyle = '#0b0c10'
    ctx.fillRect(0, 0, 600, 600)

    // Gridlines to simulate DICOM scanner grid
    ctx.strokeStyle = '#1a1d24'
    ctx.lineWidth = 1
    for (let x = 0; x < 600; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 600)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, x)
      ctx.lineTo(600, x)
      ctx.stroke()
    }

    if (presetType === 'chest') {
      // Draw Ribcage & Lungs
      ctx.strokeStyle = '#9ca3af'
      ctx.lineWidth = 5
      for (let i = 0; i < 7; i++) {
        ctx.beginPath()
        ctx.ellipse(220, 160 + i * 50, 110, 40, Math.PI / 7, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(380, 160 + i * 50, 110, 40, -Math.PI / 7, 0, Math.PI * 2)
        ctx.stroke()
      }
      // Consolidation lesion
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.beginPath()
      ctx.arc(390, 380, 55, 0, Math.PI * 2)
      ctx.fill()

      canvas.toBlob(async (blob) => {
        const presetFile = new File([blob], 'chest_xray_pneumonia.png', { type: 'image/png' })
        setFile(presetFile)
        setPreview(URL.createObjectURL(presetFile))
        await analyzeFile(presetFile)
      })
    } else if (presetType === 'tibia') {
      // Draw Tibia & Fibula bones
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 22
      ctx.beginPath()
      ctx.moveTo(260, 50)
      ctx.lineTo(260, 550)
      ctx.stroke()

      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.moveTo(330, 70)
      ctx.lineTo(330, 530)
      ctx.stroke()

      // Fracture Cortical Break
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(240, 300)
      ctx.lineTo(285, 315)
      ctx.stroke()

      canvas.toBlob(async (blob) => {
        const presetFile = new File([blob], 'tibia_fracture_scan.png', { type: 'image/png' })
        setFile(presetFile)
        setPreview(URL.createObjectURL(presetFile))
        await analyzeFile(presetFile)
      })
    }
  }

  async function analyzeFile(fileToAnalyze) {
    const f = fileToAnalyze || file
    if (!f) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', f)
      const { data } = await api.post('/imaging/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Please log in or sign up first to run the Diagnostic AI scan.')
      } else {
        setError(err?.response?.data?.detail || err?.message || 'X-ray vision analysis failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Tool 02 · Multimodal Vision Radiologist"
        title="X-Ray & Scan Diagnostics"
        description="Upload any medical radiograph (chest X-ray, limb fracture, joint scan). Vision AI evaluates anatomical structures, detects pathology, and generates structured radiology reports."
      />

      <div className="grid md:grid-cols-12 gap-6">
        {/* Upload & Controls Column */}
        <div className="md:col-span-5 space-y-4">
          <AnimatedCard>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[#E07A5F] uppercase tracking-wider">
                Radiograph Input
              </span>
              {preview && (
                <button
                  onClick={() => setShowRoiOverlay(!showRoiOverlay)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors ${
                    showRoiOverlay
                      ? 'bg-[#E07A5F] border-[#C55F44] text-white'
                      : 'border-[#D8CDB6] text-[#594C38] hover:text-[#231B0F]'
                  }`}
                >
                  {showRoiOverlay ? '🎯 Heatmap: ON' : '🎯 Heatmap: OFF'}
                </button>
              )}
            </div>

            <div className="relative border-2 border-dashed border-[#D8CDB6] rounded-2xl p-6 text-center cursor-pointer hover:border-[#E07A5F] transition-all group overflow-hidden bg-[#FFFDF7]">
              <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer z-10" />

              {preview ? (
                <div className="relative max-h-72 flex justify-center items-center overflow-hidden rounded-xl">
                  <img src={preview} alt="X-ray preview" className="max-h-72 object-contain rounded-xl border border-[#E6DCC8] shadow-md" />

                  {/* Simulated Grad-CAM / ROI Heatmap Highlight Overlay */}
                  {showRoiOverlay && result && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-radial from-amber-500/50 via-orange-500/30 to-transparent blur-md animate-pulse border-2 border-orange-500/70" />
                      <div className="absolute border-2 border-dashed border-orange-600 text-[10px] font-mono font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded -top-2">
                        ROI Detected: {result.top_finding?.slice(0, 24)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🩻</div>
                  <p className="text-sm font-semibold text-[#231B0F] mb-1">Click or drag X-Ray image here</p>
                  <p className="text-xs text-[#7C6E59]">Supports DICOM exports, PNG, JPG, WebP</p>
                </div>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="mt-4 pt-3 border-t border-[#E6DCC8]">
              <p className="text-xs font-semibold text-[#7C6E59] mb-2">Try Preset Radiograph Samples:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loadPreset('chest')}
                  disabled={loading}
                  className="px-3 py-2 bg-[#F4ECDA] border border-[#E2D7C1] rounded-xl text-xs font-semibold text-[#231B0F] hover:border-[#E07A5F] hover:bg-[#EDE5CF] transition-all flex items-center gap-1.5"
                >
                  <span>🫁</span> Chest Pneumonia
                </button>
                <button
                  type="button"
                  onClick={() => loadPreset('tibia')}
                  disabled={loading}
                  className="px-3 py-2 bg-[#F4ECDA] border border-[#E2D7C1] rounded-xl text-xs font-semibold text-[#231B0F] hover:border-[#E07A5F] hover:bg-[#EDE5CF] transition-all flex items-center gap-1.5"
                >
                  <span>🦴</span> Tibia Leg Fracture
                </button>
              </div>
            </div>

            <Button className="w-full mt-4" onClick={() => analyzeFile()} disabled={!file || loading}>
              {loading ? 'Analyzing Vision Features…' : 'Run Radiologist Analysis'}
            </Button>
            {error && <p className="text-xs mt-3 bg-red-100 p-2.5 rounded-xl border border-red-300 font-bold text-red-800">{error}</p>}
          </AnimatedCard>
        </div>

        {/* Results & Analysis Display Column */}
        <div className="md:col-span-7">
          <AnimatedCard delay={0.1}>
            {loading && (
              <div className="py-12 text-center">
                <Loader label="Evaluating radiograph density & anatomical alignment…" />
              </div>
            )}

            {!loading && !result && (
              <div className="py-16 text-center text-[#7C6E59] space-y-2">
                <div className="text-4xl opacity-40">🔬</div>
                <p className="text-sm font-semibold text-[#231B0F]">No Scan Analyzed Yet</p>
                <p className="text-xs max-w-sm mx-auto">Upload an X-ray image or click one of the preset samples on the left to view structured diagnostic findings.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Header Badge, Severity & Language Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E6DCC8]">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#E07A5F] font-bold">
                      {lang === 'hi' ? (result.body_part_hi || result.body_part || 'Anatomical View') : (result.body_part || 'Anatomical View')}
                    </span>
                    <h2 className="font-display text-2xl font-extrabold text-[#231B0F] leading-tight">
                      {lang === 'hi' ? (result.top_finding_hi || result.top_finding) : result.top_finding}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 bg-[#EDE5CF] p-1 rounded-full border border-[#D8CDB6]">
                      <button
                        type="button"
                        onClick={() => setLang('en')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                          lang === 'en' ? 'bg-[#231B0F] text-[#FFFDF7] shadow-sm' : 'text-[#594C38] hover:text-[#231B0F]'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLang('hi')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
                          lang === 'hi' ? 'bg-[#231B0F] text-[#FFFDF7] shadow-sm' : 'text-[#594C38] hover:text-[#231B0F]'
                        }`}
                      >
                        🇮🇳 Hindi / Hinglish
                      </button>
                    </div>

                    <span className="text-xs font-mono bg-[#EDE5CF] px-2.5 py-1.5 rounded-full border border-[#D8CDB6] text-[#231B0F]">
                      Conf: <strong className="text-[#E07A5F]">{(result.confidence * 100).toFixed(0)}%</strong>
                    </span>
                    <UrgencyBadge level={result.severity} />
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-[#E6DCC8] pb-2 overflow-x-auto">
                  {[
                    { id: 'overview', label: lang === 'hi' ? 'Findings & Observations (जांच रिपोर्ट)' : 'Findings & Observations' },
                    { id: 'diagnoses', label: lang === 'hi' ? 'Probability (संभावना)' : 'Differential Probability' },
                    { id: 'recommendations', label: lang === 'hi' ? 'Next Steps (इलाज व सलाह)' : 'Clinical Next Steps' },
                    { id: 'report', label: lang === 'hi' ? 'Full Radiology Report' : 'Full Radiology Report' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#231B0F] text-[#FFFDF7] shadow-sm'
                          : 'text-[#594C38] hover:bg-[#EDE5CF]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-[#E07A5F] uppercase">
                      {lang === 'hi' ? 'मुख्य रेडियोलॉजिकल अवलोकन (Key Observations)' : 'Key Radiological Observations'}
                    </h4>
                    <div className="space-y-2">
                      {( (lang === 'hi' && result.key_observations_hi && result.key_observations_hi.length > 0)
                        ? result.key_observations_hi
                        : (result.key_observations && result.key_observations.length > 0 ? result.key_observations : ['Radiological scan evaluated.'])
                      ).map((obs, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-[#FFFDF7] border border-[#E6DCC8] p-3 rounded-xl text-xs text-[#231B0F]">
                          <span className="text-[#E07A5F] text-base leading-none">🔍</span>
                          <span className="leading-relaxed font-medium">{obs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'diagnoses' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-[#E07A5F] uppercase">
                      {lang === 'hi' ? 'निदान संभावना (Differential Diagnosis Probabilities)' : 'Differential Diagnosis Probabilities'}
                    </h4>
                    <div className="space-y-2.5 bg-[#FFFDF7] border border-[#E6DCC8] p-4 rounded-xl">
                      {Object.entries(result.findings || {}).map(([label, prob]) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1 font-semibold">
                            <span className="text-[#231B0F]">{lang === 'hi' ? (result.top_finding_hi || label) : label}</span>
                            <span className="text-[#E07A5F] font-mono font-bold">{(prob * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-[#EDE5CF] rounded-full overflow-hidden border border-[#D8CDB6]">
                            <div
                              className="h-full bg-gradient-to-r from-[#E07A5F] to-[#C55F44] rounded-full transition-all duration-500"
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'recommendations' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono font-bold text-[#E07A5F] uppercase">
                      {lang === 'hi' ? 'चिकित्सा सलाह एवं अगले कदम (Clinical Next Steps)' : 'Clinical Care & Diagnostic Recommendations'}
                    </h4>
                    <div className="space-y-2">
                      {( (lang === 'hi' && result.recommendations_hi && result.recommendations_hi.length > 0)
                        ? result.recommendations_hi
                        : (result.recommendations && result.recommendations.length > 0 ? result.recommendations : ['Consult a specialist.'])
                      ).map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                          <span className="text-amber-600 text-base leading-none">📋</span>
                          <span className="leading-relaxed font-medium">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'report' && (
                  <div className="bg-[#FFFDF7] border border-[#E6DCC8] rounded-xl p-4 max-h-96 overflow-y-auto">
                    <FormattedText text={lang === 'hi' && result.summary_hi ? result.summary_hi : result.summary} />
                  </div>
                )}

                <Disclaimer>{result.disclaimer}</Disclaimer>
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>

      {/* 3D Interactive MRI Scanner Model Section */}
      <div className="mt-8 relative w-full h-[320px] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-[#E6DCC8] dark:border-white/10 shadow-inner flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#E07A5F" />
          <Sparkles count={40} scale={8} size={2} speed={0.4} opacity={0.5} color="#E07A5F" />
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <Suspense fallback={null}>
              <Imaging3DViewer />
            </Suspense>
          </Float>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} enableDamping />
        </Canvas>
        <div className="absolute bottom-3 text-center text-xs font-bold text-[#7C6E59] dark:text-[#A89A84] bg-white/80 dark:bg-black/70 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/40 dark:border-white/10 pointer-events-none shadow-md">
          Interactive MRI Scanner Model • Drag to rotate
        </div>
      </div>
    </div>
  )
}
