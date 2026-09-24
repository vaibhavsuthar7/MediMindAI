import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, useGLTF, Center, Sparkles } from '@react-three/drei'
import api from '../api/client'
import { AnimatedCard, SectionHeading, Button, TextArea, TextInput, UrgencyBadge, Disclaimer, Loader } from '../components/ui'

function Symptoms3DViewer() {
  const { scene } = useGLTF('/models/triage.glb')
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

export default function Symptoms() {
  const [symptomsText, setSymptomsText] = useState('')
  const [result, setResult] = useState(null)
  const [checkId, setCheckId] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(previousAnswers = null) {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/symptoms/check', {
        symptoms_text: symptomsText,
        previous_answers: previousAnswers,
        check_id: previousAnswers ? checkId : null,
      })
      setResult(data)
      if (data.check_id) {
        setCheckId(data.check_id)
      }
    } catch (err) {
      if (err?.code === 'ECONNABORTED' || err?.message?.toLowerCase().includes('timeout')) {
        setError('Server is warming up or processing. Please wait 10 seconds and click Check symptoms again.')
      } else if (err?.response?.status === 401) {
        setError('Please log in or sign up first to run the clinical symptom triage.')
      } else {
        setError(err?.response?.data?.detail || err?.message || 'Symptom check failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleAnswerChange(q, val) {
    setAnswers((prev) => ({ ...prev, [q]: val }))
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Tool 01 · Symptom Checker"
        title="Symptom & Urgency Checker"
        description="Describe what you're feeling in your own words. The assistant will analyze your symptoms, ask follow-up questions, and guide you on what to do next."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedCard>
          <label className="text-xs font-bold text-[#594C38] uppercase tracking-wider mb-1.5 block">Describe your symptoms</label>
          <TextArea
            rows={6}
            value={symptomsText}
            onChange={(e) => setSymptomsText(e.target.value)}
            placeholder="e.g. I've had a dull headache for 2 days, worse in the morning, with some light sensitivity…"
          />
          <Button className="w-full mt-4" onClick={() => submit()} disabled={!symptomsText || loading}>
            {loading ? 'Assessing…' : 'Check symptoms'}
          </Button>
          {error && <p className="text-red-700 text-xs font-bold mt-3 bg-red-100 p-2.5 rounded-xl border border-red-300">{error}</p>}
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          {loading && <Loader label="Analyzing your symptoms…" />}
          {!loading && !result && (
            <p className="text-[#7C6E59] text-sm font-medium">Your assessment will appear here.</p>
          )}
          {result && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg text-[#231B0F] font-bold">Assessment</h3>
                <UrgencyBadge level={result.urgency} />
              </div>

              {result.follow_up_questions?.length > 0 && (
                <div className="mb-4 space-y-3">
                  <p className="text-xs font-bold text-[#E07A5F] uppercase tracking-wide">Follow-up questions</p>
                  {result.follow_up_questions.map((q) => (
                    <div key={q}>
                      <label className="text-sm text-[#231B0F] font-semibold block mb-1">{q}</label>
                      <TextInput
                        value={answers[q] || ''}
                        onChange={(e) => handleAnswerChange(q, e.target.value)}
                        placeholder="Your answer…"
                      />
                    </div>
                  ))}
                  <Button variant="ghost" onClick={() => submit(answers)} disabled={loading}>
                    Submit answers
                  </Button>
                </div>
              )}

              {result.possible_conditions?.length > 0 && (
                <div className="space-y-3 mb-4">
                  <p className="text-xs font-bold text-[#E07A5F] uppercase tracking-wide">Possible conditions</p>
                  {result.possible_conditions.map((c, i) => (
                    <div key={i} className="border-l-2 border-[#E07A5F] pl-3 py-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#231B0F] font-bold text-sm">{c.condition}</span>
                        <span className="text-xs text-[#7C6E59] font-medium">({c.likelihood})</span>
                      </div>
                      <p className="text-xs text-[#594C38] mt-0.5">{c.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              <Disclaimer>{result.disclaimer}</Disclaimer>
            </div>
          )}
        </AnimatedCard>
      </div>

      <div className="mt-8">
        <AnimatedCard className="overflow-hidden border border-[#E07A5F]/20 theme-bg-card backdrop-blur-xl relative shadow-md">
          <div className="h-[400px] w-full relative">
            <div className="absolute inset-0 bg-radial from-[#E07A5F]/10 via-transparent to-transparent opacity-50 pointer-events-none" />
            <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 10, 5]} intensity={2.0} color="#FFF5EA" />
              <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#2563EB" />
              <Sparkles count={40} scale={8} size={2} speed={0.4} color="#E07A5F" opacity={0.6} />
              
              <Suspense fallback={null}>
                <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                  <Symptoms3DViewer />
                </Float>
              </Suspense>
              
              <OrbitControls 
                enableZoom={false} 
                enablePan={false} 
                autoRotate={true}
                autoRotateSpeed={1.2}
                enableDamping={true}
                dampingFactor={0.05}
                maxPolarAngle={Math.PI / 1.7}
                minPolarAngle={Math.PI / 3}
              />
            </Canvas>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md border border-white/50 dark:border-white/10 text-[11px] font-bold text-[#7C6E59] dark:text-[#A89A84] shadow-lg pointer-events-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-ping" />
              Tripo Triage Agent • Drag to rotate
            </div>
          </div>
        </AnimatedCard>
      </div>

    </div>
  )
}
