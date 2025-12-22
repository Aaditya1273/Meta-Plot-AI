'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from 'react-spring'

interface MorphingCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  rotationIntensity?: number
}

export default function MorphingCard({ 
  children, 
  className = '',
  hoverScale = 1.05,
  rotationIntensity = 10
}: MorphingCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const springProps = useSpring({
    transform: isHovered 
      ? `perspective(1000px) rotateX(${mousePosition.y * rotationIntensity}deg) rotateY(${mousePosition.x * rotationIntensity}deg) scale(${hoverScale})`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    config: { tension: 300, friction: 40 }
  })

  const glowProps = useSpring({
    opacity: isHovered ? 0.6 : 0,
    transform: `scale(${isHovered ? 1.1 : 1})`,
    config: { tension: 300, friction: 40 }
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = (e.clientX - centerX) / (rect.width / 2)
    const mouseY = (e.clientY - centerY) / (rect.height / 2)
    
    setMousePosition({ x: mouseX, y: -mouseY })
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePosition({ x: 0, y: 0 })
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Glow effect */}
      <animated.div
        style={glowProps}
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-secondary/20 rounded-xl blur-xl -z-10"
      />
      
      {/* Main card */}
      <animated.div
        style={springProps}
        className={`relative glass-card ${className}`}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl"
          animate={{
            x: isHovered ? '100%' : '-100%'
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        />
        
        {children}
      </animated.div>
    </div>
  )
}