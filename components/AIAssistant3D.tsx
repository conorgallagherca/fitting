'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Box, Cylinder } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Floating particles component
function FloatingParticles({ count = 100 }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  useEffect(() => {
    if (!mesh.current) return
    
    const tempObject = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      tempObject.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      )
      tempObject.updateMatrix()
      mesh.current.setMatrixAt(i, tempObject.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.y = state.clock.elapsedTime * 0.1
    mesh.current.rotation.x = state.clock.elapsedTime * 0.05
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
    </instancedMesh>
  )
}

// AI Assistant character
function AIAssistant({ isAnimating }: { isAnimating: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!groupRef.current) return
    
    if (isAnimating) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
    
    if (hovered) {
      groupRef.current.rotation.y += 0.02
    }
  })

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Head */}
      <Sphere args={[0.8, 32, 32]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
      </Sphere>
      
      {/* Eyes */}
      <Sphere args={[0.1, 16, 16]} position={[-0.3, 1.6, 0.6]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.1, 16, 16]} position={[0.3, 1.6, 0.6]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </Sphere>
      
      {/* Pupils */}
      <Sphere args={[0.05, 16, 16]} position={[-0.3, 1.6, 0.7]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere args={[0.05, 16, 16]} position={[0.3, 1.6, 0.7]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Body */}
      <Cylinder args={[0.6, 0.8, 1.5, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.3} />
      </Cylinder>
      
      {/* Arms */}
      <Cylinder args={[0.15, 0.15, 1.2, 16]} position={[-1, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 1.2, 16]} position={[1, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.2} />
      </Cylinder>
      
      {/* Hands */}
      <Sphere args={[0.2, 16, 16]} position={[-1.4, 0.2, 0.4]}>
        <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.7} />
      </Sphere>
      <Sphere args={[0.2, 16, 16]} position={[1.4, 0.2, 0.4]}>
        <meshStandardMaterial color="#fbbf24" metalness={0.3} roughness={0.7} />
      </Sphere>
      
      {/* Energy field */}
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#22c55e" 
          transparent 
          opacity={0.1} 
          wireframe 
          emissive="#22c55e"
          emissiveIntensity={0.2}
        />
      </Sphere>
    </group>
  )
}

// Speech bubble component
function SpeechBubble({ text, position }: { text: string; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <group position={position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Bubble background */}
      <Box args={[3, 1.5, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.95} />
      </Box>
      
      {/* Text */}
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.2}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.8}
        textAlign="center"
      >
        {text}
      </Text>
      
      {/* Bubble tail */}
      <Box args={[0.3, 0.3, 0.2]} position={[0, -0.9, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.95} />
      </Box>
    </group>
  )
}

// Main 3D Scene
function Scene({ isAnimating }: { isAnimating: boolean }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22c55e" />
      
      {/* AI Assistant */}
      <AIAssistant isAnimating={isAnimating} />
      
      {/* Speech bubbles */}
      <SpeechBubble text="Hey! Ready to crush your fitness goals? 💪" position={[3, 2, 0]} />
      <SpeechBubble text="Let's get started together!" position={[-3, 1.5, 0]} />
      
      {/* Floating particles */}
      <FloatingParticles count={150} />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.3} />
      </mesh>
    </>
  )
}

// Main component
export default function AIAssistant3D() {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        shadows
        className="rounded-2xl overflow-hidden"
      >
        <Scene isAnimating={isAnimating} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
    </div>
  )
} 