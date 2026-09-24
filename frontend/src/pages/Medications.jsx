import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, useGLTF, Center, Sparkles } from '@react-three/drei'
import api from '../api/client'
import { AnimatedCard, SectionHeading, Button, TextInput, UrgencyBadge, Disclaimer, Loader } from '../components/ui'

function Pharma3DViewer() {
  const { scene } = useGLTF('/models/pharma.glb')
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const modelRef = useRef()

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.85
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

export default function Medications() {
  const [meds, setMeds] = useState([''])
  const [newMed, setNewMed] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateMed(i, val) {
    const copy = [...meds]
    copy[i] = val
    setMeds(copy)
  }

  async function handleCheck() {
    if (!newMed) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/medications/check', {
        current_medications: meds.filter(Boolean),
        new_medication: newMed,
      })
      setResult(data)
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Please log in or sign up first to run the medication interaction check.')
      } else {
        setError(err?.response?.data?.detail || err?.message || 'Check failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Tool 04 · Medicine Safety"
        title="Medicine Interaction Checker"
        description="List your current medications and the new pill or medicine you're considering. The checker screens for harmful drug interactions."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedCard>
          <label className="text-xs font-bold text-[#594C38] uppercase tracking-wider mb-1.5 block">Current medications</label>
          <div className="space-y-2 mb-2">
            {meds.map((m, i) => (
              <TextInput key={i} value={m} onChange={(e) => updateMed(i, e.target.value)} placeholder={`Medication ${i + 1}`} />
            ))}
          </div>
          <button
            onClick={() => setMeds([...meds, ''])}
            className="text-xs font-bold text-[#E07A5F] hover:underline mb-4 block"
          >
            + Add another medication
          </button>

          <label className="text-xs font-bold text-[#594C38] uppercase tracking-wider mb-1.5 block">New medication to check</label>
          <TextInput value={newMed} onChange={(e) => setNewMed(e.target.value)} placeholder="e.g. Ibuprofen" />

          <Button className="w-full mt-4" onClick={handleCheck} disabled={!newMed || loading}>
            {loading ? 'Checking…' : 'Check interactions'}
          </Button>
          {error && <p className="text-red-700 text-xs font-bold mt-3 bg-red-100 p-2.5 rounded-xl border border-red-300">{error}</p>}
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          {loading && <Loader label="Screening for interactions…" />}
          {!loading && !result && <p className="text-[#7C6E59] text-sm font-medium">Results will appear here.</p>}
          {result && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg text-[#231B0F] font-bold">Risk level</h3>
                <UrgencyBadge level={result.risk_level} />
              </div>

              {result.interactions_found?.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {result.interactions_found.map((it, i) => (
                    <div key={i} className="border-l-2 border-[#E07A5F] pl-3 py-1 bg-amber-50/60 rounded-r-xl border-amber-200">
                      <span className="text-[#231B0F] text-sm font-bold">With {it.with}</span>
                      <span className="text-xs text-[#7C6E59] ml-2 font-medium">({it.severity})</span>
                      <p className="text-xs text-[#594C38] mt-0.5">{it.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#7C6E59] mb-4 font-medium">No major interactions flagged.</p>
              )}

              <p className="text-sm text-[#231B0F] leading-relaxed font-medium">{result.advice}</p>
              <Disclaimer>{result.disclaimer}</Disclaimer>
            </div>
          )}
        </AnimatedCard>
      </div>

      {/* 3D Interactive Pharma Model Section */}
      <div className="mt-8 relative w-full h-[320px] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-[#E6DCC8] dark:border-white/10 shadow-inner flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#8B5CF6" />
          <Sparkles count={40} scale={8} size={2} speed={0.4} opacity={0.5} color="#8B5CF6" />
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <Suspense fallback={null}>
              <Pharma3DViewer />
            </Suspense>
          </Float>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} enableDamping />
        </Canvas>
        <div className="absolute bottom-3 text-center text-xs font-bold text-[#7C6E59] dark:text-[#A89A84] bg-white/80 dark:bg-black/70 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/40 dark:border-white/10 pointer-events-none shadow-md">
          Interactive DNA Pill Model • Drag to rotate
        </div>
      </div>

    </div>
  )
}
