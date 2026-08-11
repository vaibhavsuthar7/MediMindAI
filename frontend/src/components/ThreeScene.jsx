import { useEffect, useRef, useState } from 'react'

export default function ThreeScene() {
  const mountRef = useRef(null)
  const [threeLoaded, setThreeLoaded] = useState(false)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let renderer, reqId, resizeObserver

    import('three')
      .then((THREE) => {
        try {
          const scene = new THREE.Scene()

          const width = container.clientWidth || 800
          const height = container.clientHeight || 400
          const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
          camera.position.set(3, 0, 14)

          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
          renderer.setSize(width, height)
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
          container.appendChild(renderer.domElement)

          const ambientLight = new THREE.AmbientLight(0xfffdf7, 0.8)
          scene.add(ambientLight)

          const terracottaLight = new THREE.PointLight(0xe07a5f, 5, 35)
          terracottaLight.position.set(7, 7, 8)
          scene.add(terracottaLight)

          const espressoLight = new THREE.PointLight(0x231b0f, 3, 30)
          espressoLight.position.set(-7, -7, 8)
          scene.add(espressoLight)

          // 1. Central Core
          const coreGeo = new THREE.IcosahedronGeometry(2.2, 2)
          const coreMat = new THREE.MeshPhongMaterial({
            color: 0xe07a5f,
            emissive: 0xe07a5f,
            emissiveIntensity: 0.6,
            wireframe: true,
            transparent: true,
            opacity: 0.9,
          })
          const coreMesh = new THREE.Mesh(coreGeo, coreMat)
          scene.add(coreMesh)

          const innerGeo = new THREE.SphereGeometry(1.3, 32, 32)
          const innerMat = new THREE.MeshStandardMaterial({
            color: 0xfffdf7,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0xe07a5f,
            emissiveIntensity: 0.5,
          })
          const innerMesh = new THREE.Mesh(innerGeo, innerMat)
          scene.add(innerMesh)

          // 2. DNA Helix Rings
          const dnaGroup = new THREE.Group()
          const strandCount = 38
          const helixRadius = 4.5
          const helixHeight = 12

          const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16)
          const matTerracotta = new THREE.MeshPhongMaterial({ color: 0xe07a5f, emissive: 0xe07a5f, emissiveIntensity: 0.8 })
          const matEspresso = new THREE.MeshPhongMaterial({ color: 0x231b0f, emissive: 0x231b0f, emissiveIntensity: 0.5 })
          const lineMat = new THREE.LineBasicMaterial({ color: 0xe07a5f, transparent: true, opacity: 0.45 })

          for (let i = 0; i < strandCount; i++) {
            const y = (i / strandCount - 0.5) * helixHeight
            const angle = (i / strandCount) * Math.PI * 4

            const x1 = Math.cos(angle) * helixRadius
            const z1 = Math.sin(angle) * helixRadius
            const node1 = new THREE.Mesh(sphereGeo, matTerracotta)
            node1.position.set(x1, y, z1)
            dnaGroup.add(node1)

            const x2 = Math.cos(angle + Math.PI) * helixRadius
            const z2 = Math.sin(angle + Math.PI) * helixRadius
            const node2 = new THREE.Mesh(sphereGeo, matEspresso)
            node2.position.set(x2, y, z2)
            dnaGroup.add(node2)

            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(x1, y, z1),
              new THREE.Vector3(x2, y, z2),
            ])
            const rung = new THREE.Line(lineGeo, lineMat)
            dnaGroup.add(rung)
          }
          dnaGroup.rotation.z = Math.PI / 5.5
          scene.add(dnaGroup)

          // 3. Bio-Particles Field
          const particleCount = 220
          const particleGeo = new THREE.BufferGeometry()
          const posArray = new Float32Array(particleCount * 3)

          for (let i = 0; i < particleCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 25
            posArray[i + 1] = (Math.random() - 0.5) * 25
            posArray[i + 2] = (Math.random() - 0.5) * 20
          }
          particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

          const particleMat = new THREE.PointsMaterial({
            size: 0.09,
            color: 0xe07a5f,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
          })
          const particleSystem = new THREE.Points(particleGeo, particleMat)
          scene.add(particleSystem)

          let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0
          const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect()
            mouseX = (e.clientX - rect.left - rect.width / 2) * 0.0015
            mouseY = (e.clientY - rect.top - rect.height / 2) * 0.0015
          }
          container.addEventListener('mousemove', handleMouseMove)

          resizeObserver = new ResizeObserver((entries) => {
            if (!entries[0]) return
            const { width: w, height: h } = entries[0].contentRect
            if (w === 0 || h === 0) return
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            if (renderer) renderer.setSize(w, h)
          })
          resizeObserver.observe(container)

          let clock = new THREE.Clock()
          const animate = () => {
            reqId = requestAnimationFrame(animate)
            const elapsedTime = clock.getElapsedTime()

            targetX += (mouseX - targetX) * 0.05
            targetY += (mouseY - targetY) * 0.05

            coreMesh.rotation.y = elapsedTime * 0.35
            coreMesh.rotation.x = elapsedTime * 0.25
            innerMesh.rotation.y = -elapsedTime * 0.4

            dnaGroup.rotation.y = elapsedTime * 0.4 + targetX * 2
            dnaGroup.rotation.x = Math.PI / 5.5 + targetY * 2

            particleSystem.rotation.y = elapsedTime * 0.08

            const scale = 1 + Math.sin(elapsedTime * 2) * 0.05
            innerMesh.scale.set(scale, scale, scale)

            camera.position.x = 3 + targetX * 3
            camera.position.y = -targetY * 3
            camera.lookAt(2, 0, 0)

            renderer.render(scene, camera)
          }

          animate()
          setThreeLoaded(true)
        } catch (err) {
          console.warn('ThreeScene WebGL fallback:', err)
        }
      })
      .catch((err) => console.warn('Three.js import error:', err))

    return () => {
      if (reqId) cancelAnimationFrame(reqId)
      if (resizeObserver) resizeObserver.disconnect()
      if (renderer) {
        if (renderer.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
    }
  }, [])

  return (
    <div className="relative w-full h-[360px] md:h-[420px] rounded-[32px] overflow-hidden bg-gradient-to-r from-[#EDE5CF] via-[#F4ECDA] to-[#FFFDF7] dark:from-[#1C1613] dark:via-[#1F1714] dark:to-[#1A1412] border border-[#E6DCC8] dark:border-[#362A24] shadow-[0_12px_40px_rgba(100,80,50,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] group transition-colors duration-300">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />
      
      {/* Soft gradient overlay on the left */}
      <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-[#EDE5CF] via-[#EDE5CF]/90 dark:from-[#1C1613] dark:via-[#1C1613]/90 to-transparent z-0 pointer-events-none transition-colors duration-300" />

      {/* 3D Glass Overlay Content */}
      <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-between pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF7]/90 dark:bg-[#1A1412]/90 border border-[#E6DCC8] dark:border-[#362A24] backdrop-blur-md shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-[#231B0F] dark:text-[#F7F3E9] uppercase">Health AI Core</span>
          </div>
          <span className="text-xs font-mono font-bold text-[#7C6E59] dark:text-[#A89A84] hidden sm:block">Move mouse to rotate view</span>
        </div>

        <div className="max-w-md bg-[#FFFDF7]/85 dark:bg-[#1A1412]/85 backdrop-blur-md p-6 rounded-[24px] border border-[#E6DCC8] dark:border-[#362A24] shadow-sm transition-colors duration-300">
          <h2 className="font-display text-2xl md:text-3xl text-[#231B0F] dark:text-[#F7F3E9] font-extrabold tracking-tight">
            Interactive <span className="text-[#E07A5F]">AI Health Core</span>
          </h2>
          <p className="text-sm text-[#7C6E59] dark:text-[#A89A84] font-medium mt-2 leading-relaxed">
            Real-time medical multi-agent assistant powered by neural memory and specialized AI diagnostic engines.
          </p>
        </div>
      </div>
    </div>
  )
}


