import { useEffect, useRef, useState, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, useGLTF, Center, Sparkles } from '@react-three/drei'
import api from '../api/client'
import { AnimatedCard, SectionHeading, Button, TextInput, Loader, FormattedText } from '../components/ui'

function Rag3DViewer() {
  const { scene } = useGLTF('/models/rag.glb')
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

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    api.get('/chat/history').then((res) => setMessages(res.data))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { data } = await api.post('/chat/ask', { message: userMsg.content })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, sources: data.sources_used }])
    } catch (err) {
      const msg = err?.response?.status === 401
        ? 'Please log in or sign up first to chat with MediMind AI.'
        : (err?.response?.data?.detail || 'Something went wrong answering that.')
      setMessages((prev) => [...prev, { role: 'assistant', content: msg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SectionHeading
        eyebrow="Tool 05 · AI Health Assistant"
        title="Ask AI Health Records"
        description="Every scan, symptom check, lab report, and medicine check you've done is remembered here. Ask any question across your full health history."
      />

      <AnimatedCard className="flex flex-col h-[60vh] bg-[#FFFDF7] border border-[#E6DCC8]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {messages.length === 0 && (
            <p className="text-[#7C6E59] text-sm font-medium">
              Try: "What did my last symptom check say?" or "Summarize my imaging history."
            </p>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  m.role === 'user'
                    ? 'bg-[#231B0F] text-[#FFFDF7] font-medium'
                    : 'bg-[#EDE5CF] text-[#231B0F] border border-[#D8CDB6] font-medium'
                }`}
              >
                {m.role === 'assistant' ? (
                  <FormattedText text={m.content} />
                ) : (
                  m.content
                )}
                {m.sources?.length > 0 && (
                  <div className="text-xs font-mono font-semibold text-[#7C6E59] mt-2 pt-1 border-t border-[#D8CDB6]">
                    Sources: {m.sources.join(', ')}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && <Loader label="Searching your records…" />}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 pt-2 border-t border-[#E6DCC8]">
          <TextInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask a question about your health history…"
          />
          <Button onClick={send} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </AnimatedCard>

      {/* 3D Interactive Memory RAG Chibi Doctor Section */}
      <div className="mt-8 relative w-full h-[320px] rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 border border-[#E6DCC8] dark:border-white/10 shadow-inner flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#06B6D4" />
          <Sparkles count={40} scale={8} size={2} speed={0.4} opacity={0.5} color="#06B6D4" />
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <Suspense fallback={null}>
              <Rag3DViewer />
            </Suspense>
          </Float>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} enableDamping />
        </Canvas>
        <div className="absolute bottom-3 text-center text-xs font-bold text-[#7C6E59] dark:text-[#A89A84] bg-white/80 dark:bg-black/70 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/40 dark:border-white/10 pointer-events-none shadow-md">
          Interactive Memory RAG Character • Drag to rotate
        </div>
      </div>

    </div>
  )
}
