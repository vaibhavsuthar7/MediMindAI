import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, useGLTF, Center, Sparkles } from '@react-three/drei'
import api from '../api/client'
import { AnimatedCard, SectionHeading, Button, Disclaimer, Loader, FormattedText } from '../components/ui'

function Report3DViewer() {
  const { scene } = useGLTF('/models/report.glb')
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

export default function Reports() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSimplify() {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/reports/simplify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Please log in or sign up first to simplify lab reports.')
      } else {
        setError(err?.response?.data?.detail || err?.message || 'Simplification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Tool 03 · Lab Reports"
        title="Lab & Medical Report Explainer"
        description="Upload a lab or diagnostic report PDF. The tool translates complex medical terms into simple, plain English."
      />

      <div className="grid md:grid-cols-2 gap-6">
        <AnimatedCard>
          <label className="block border-2 border-dashed border-[#D8CDB6] rounded-2xl p-8 text-center cursor-pointer hover:border-[#E07A5F] transition-colors bg-[#FFFDF7]">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => { setFile(e.target.files[0]); setResult(null) }}
              className="hidden"
            />
            <div className="text-[#7C6E59]">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm font-semibold text-[#231B0F]">{file ? file.name : 'Click to upload a report PDF'}</p>
              <p className="text-xs text-[#7C6E59] mt-1">Extracts & explains clinical metrics</p>
            </div>
          </label>
          <Button className="w-full mt-4" onClick={handleSimplify} disabled={!file || loading}>
            {loading ? 'Simplifying…' : 'Simplify report'}
          </Button>
          {error && <p className="text-red-700 text-xs font-bold mt-3 bg-red-100 p-2.5 rounded-xl border border-red-300">{error}</p>}
        </AnimatedCard>

        <AnimatedCard delay={0.1}>
          {loading && <Loader label="Translating medical jargon…" />}
          {!loading && !result && <p className="text-[#7C6E59] text-sm font-medium">Your simplified summary will appear here.</p>}
          {result && (
            <div>
              <h3 className="font-display text-lg text-[#231B0F] font-bold mb-3">Plain-language summary</h3>
              <div className="bg-[#FFFDF7] border border-[#E6DCC8] rounded-xl p-4 mb-5 shadow-sm">
                <FormattedText text={result.simplified_summary} />
              </div>

              {Object.keys(result.key_terms || {}).length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-bold text-[#E07A5F] uppercase tracking-wide mb-2">Glossary</p>
                  <div className="space-y-2">
                    {Object.entries(result.key_terms).map(([term, def]) => (
                      <div key={term} className="text-sm">
                        <span className="text-[#231B0F] font-bold">{term}</span>
                        <span className="text-[#594C38]"> — {def}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Disclaimer>{result.disclaimer}</Disclaimer>
            </div>
          )}
        </AnimatedCard>
      </div>

      {/* 3D Interactive Model Section Below Report */}
      <div className="mt-8 relative w-full h-[320px] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-[#E6DCC8] dark:border-white/10 shadow-inner flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#10B981" />
          <Sparkles count={40} scale={8} size={2} speed={0.4} opacity={0.5} color="#10B981" />
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <Suspense fallback={null}>
              <Report3DViewer />
            </Suspense>
          </Float>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} enableDamping />
        </Canvas>
        <div className="absolute bottom-3 text-center text-xs font-bold text-[#7C6E59] dark:text-[#A89A84] bg-white/80 dark:bg-black/70 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/40 dark:border-white/10 pointer-events-none shadow-md">
          Interactive Lab Report Model • Drag to rotate
        </div>
      </div>

    </div>
  )
}
