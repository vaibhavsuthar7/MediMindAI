import { useState, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshWobbleMaterial, Sparkles, OrbitControls, Html, useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'

const AGENTS = [
  { id: 'imaging', name: 'Imaging Agent', color: '#E07A5F', icon: '🩻', detail: 'ResNet-18 Vision' },
  { id: 'symptom', name: 'Triage Agent', color: '#F59E0B', icon: '🩺', detail: 'RF & SVM Classifier' },
  { id: 'report', name: 'Report AI', color: '#10B981', icon: '📄', detail: 'PDF Simplifier' },
  { id: 'medication', name: 'Pharma AI', color: '#8B5CF6', icon: '💊', detail: 'Interaction Checker' },
  { id: 'rag', name: 'Memory RAG', color: '#06B6D4', icon: '💬', detail: 'Vector Memory Q&A' },
]

function CentralDoctorFallback() {
  return (
    <mesh scale={1.8}>
      <sphereGeometry args={[1, 24, 24]} />
      <MeshWobbleMaterial
        color="#E07A5F"
        emissive="#E07A5F"
        emissiveIntensity={0.5}
        factor={0.3}
        speed={1.2}
        roughness={0.3}
      />
    </mesh>
  )
}

function CentralDoctorModel() {
  const { scene } = useGLTF('/models/doctor.glb')
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const modelRef = useRef()

  useFrame((_state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.4
    }
  })

  return (
    <group ref={modelRef}>
      <Center>
        <primitive object={clonedScene} scale={2.5} position={[0, -0.15, 0]} />
      </Center>
    </group>
  )
}

function SingleModel({ path, scale = 1.8, posY = -0.35 }) {
  const { scene } = useGLTF(path)
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  return (
    <Center>
      <primitive object={clonedScene} scale={scale} position={[0, posY, 0]} />
    </Center>
  )
}

function OrchestratorHalo() {
  const wireframeRef = useRef()

  useFrame((_state, delta) => {
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * 0.1
    }
  })

  return (
    <group>
      {/* BACKGROUND GEODESIC AURA */}
      <mesh ref={wireframeRef} scale={2.4}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#E07A5F"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* DUAL SCI-FI ORBITAL RINGS */}
      <mesh rotation-x={Math.PI / 2.3} scale={3.6}>
        <torusGeometry args={[1, 0.006, 8, 32]} />
        <meshBasicMaterial color="#E07A5F" transparent opacity={0.3} />
      </mesh>

      <mesh rotation-x={Math.PI / 1.7} scale={3.2}>
        <torusGeometry args={[1, 0.005, 8, 32]} />
        <meshBasicMaterial color="#FFC107" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

function FallbackNode({ agent, isActive, hovered }) {
  return (
    <mesh>
      <sphereGeometry args={[0.8, 20, 20]} />
      <MeshWobbleMaterial
        color={agent.color}
        emissive={agent.color}
        emissiveIntensity={isActive || hovered ? 0.8 : 0.3}
        factor={hovered ? 0.4 : 0.2}
        speed={hovered ? 2.0 : 1.0}
        roughness={0.3}
      />
    </mesh>
  )
}

function AgentNode({ agent, index, total, activeAgent, onSelect }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  const isActive = activeAgent === agent.id

  const targetScale = isActive ? 0.6 : hovered ? 0.52 : 0.38
  const scaleRef = useRef(targetScale)

  // Pre-calculated static orbital position along radial ring
  const radius = 3.6
  const angle = (index / total) * Math.PI * 2
  const posX = Math.cos(angle) * radius
  const posZ = Math.sin(angle) * radius
  const posY = Math.sin(index * 1.8) * 0.35

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (hovered ? 1.8 : 0.6)

      // Smooth lerp scale with frame-rate independent step
      scaleRef.current = THREE.MathUtils.lerp(
        scaleRef.current,
        targetScale,
        Math.min(delta * 14, 0.25)
      )
      meshRef.current.scale.setScalar(scaleRef.current)
    }
  })

  const getModelPath = (id) => {
    switch (id) {
      case 'imaging':
        return '/models/imaging.glb'
      case 'symptom':
        return '/models/triage.glb'
      case 'report':
        return '/models/report.glb'
      case 'medication':
        return '/models/pharma.glb'
      case 'rag':
        return '/models/rag.glb'
      default:
        return null
    }
  }

  const modelPath = getModelPath(agent.id)

  return (
    <group position={[posX, posY, posZ]}>
      <group
        ref={meshRef}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        className="cursor-pointer"
      >
        <Suspense fallback={<FallbackNode agent={agent} isActive={isActive} hovered={hovered} />}>
          {modelPath ? (
            <SingleModel path={modelPath} />
          ) : (
            <FallbackNode agent={agent} isActive={isActive} hovered={hovered} />
          )}
        </Suspense>
      </group>

      {/* FLOATING HTML BADGE */}
      <Html
        position={[0, 0.95, 0]}
        center
        distanceFactor={8.5}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={onSelect}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black tracking-wide shadow-xl backdrop-blur-md transition-all duration-200 transform whitespace-nowrap cursor-pointer select-none ${
            isActive || hovered
              ? 'scale-105 bg-black/90 text-white border-white/50 ring-2 ring-[#F59E0B] shadow-[#F59E0B]/30'
              : 'scale-90 bg-black/70 text-white/90 border-white/20 hover:bg-black/85 hover:scale-100'
          }`}
          style={{ borderColor: agent.color, willChange: 'transform' }}
        >
          <span className="text-xs">{agent.icon}</span>
          <span>{agent.name}</span>
        </button>
      </Html>
    </group>
  )
}

export default function MediMind3DHero({ activeAgent, setActiveAgent }) {
  return (
    <div
      className="w-full h-[520px] sm:h-[620px] relative rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none bg-radial from-black/5 via-transparent to-transparent"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
    >
      {/* AMBIENT GLOW BACKDROP */}
      <div className="absolute inset-0 bg-radial from-[#E07A5F]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      <Canvas
        camera={{ position: [0, 1.0, 9.8], fov: 42 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.8 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} color="#FFF5EA" />
        <directionalLight position={[-10, -10, -5]} intensity={0.6} color="#2563EB" />

        <Sparkles count={12} scale={10} size={1.6} speed={0.2} opacity={0.4} color="#FFC107" />

        {/* CENTRAL DOCTOR CHARACTER & ORBITAL RINGS */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <Suspense fallback={<CentralDoctorFallback />}>
            <CentralDoctorModel />
          </Suspense>
          <OrchestratorHalo />
        </Float>

        {/* ORBITING AGENT NODES */}
        {AGENTS.map((agent, idx) => (
          <AgentNode
            key={agent.id}
            agent={agent}
            index={idx}
            total={AGENTS.length}
            activeAgent={activeAgent}
            onSelect={() => setActiveAgent(agent.id)}
          />
        ))}

        {/* SILKY SMOOTH ORBIT CONTROLS */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.9}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.75}
          minPolarAngle={Math.PI / 3.2}
        />
      </Canvas>

      {/* INTERACTIVE HINT BADGE */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md border border-white/50 dark:border-white/10 text-[11px] font-bold text-[#7C6E59] dark:text-[#A89A84] shadow-lg pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#E07A5F] animate-ping" />
        Drag to rotate Doctor & Agent Orbit • Click nodes to inspect
      </div>
    </div>
  )
}

useGLTF.preload('/models/doctor.glb')
useGLTF.preload('/models/imaging.glb')
useGLTF.preload('/models/report.glb')
useGLTF.preload('/models/triage.glb')
useGLTF.preload('/models/pharma.glb')
useGLTF.preload('/models/rag.glb')
