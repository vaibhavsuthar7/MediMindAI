import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls, Sparkles, useGLTF, Center, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

function DoctorFallback() {
  return (
    <mesh scale={1.5}>
      <sphereGeometry args={[1, 32, 32]} />
      <MeshWobbleMaterial
        color="#FFC107"
        emissive="#FFC107"
        emissiveIntensity={0.6}
        factor={0.4}
        speed={1.5}
        roughness={0.2}
      />
    </mesh>
  )
}

function TripoDoctorModel() {
  const { scene } = useGLTF('/models/doctor.glb')
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const modelRef = useRef()

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.45
    }
  })

  return (
    <group ref={modelRef}>
      <Center>
        <primitive object={clonedScene} scale={2.4} position={[0, -0.2, 0]} />
      </Center>
    </group>
  )
}


export default function DoctorEmoji3D({ className = 'w-full h-[400px]' }) {
  const containerRef = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.05 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing ${className}`}
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
    >
      {/* AMBIENT GLOW */}
      <div className="absolute inset-0 bg-radial from-[#FFC107]/20 via-transparent to-transparent blur-3xl pointer-events-none" />

      {isInView && (
        <Canvas
          camera={{ position: [0, 0.5, 4.5], fov: 45 }}
          dpr={1}
          performance={{ min: 0.5 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            precision: 'lowp',
            stencil: false,
            depth: true,
          }}
        >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 7]} intensity={2.0} color="#FFF8E7" />
        <directionalLight position={[-5, -5, -3]} intensity={0.8} color="#E07A5F" />
        <pointLight position={[0, 2, 3]} intensity={1.5} color="#FFC107" />

        <Sparkles count={45} scale={6} size={2.5} speed={0.4} color="#FFC107" opacity={0.6} />

        <Suspense fallback={<DoctorFallback />}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
            <TripoDoctorModel />
          </Float>
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.8}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.2}
        />
      </Canvas>
      )}

      {/* BADGE */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md border border-white/40 text-[11px] font-black text-[#7C6E59] dark:text-[#A89A84] shadow-lg pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FFC107] animate-ping" />
        Tripo Generated AI Doctor • Drag to Rotate
      </div>
    </div>
  )
}

useGLTF.preload('/models/doctor.glb')
