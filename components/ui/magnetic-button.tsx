'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export default function MagneticButton({ 
  children, 
  className = '', 
  onClick,
  disabled = false 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) * 0.3
    const deltaY = (e.clientY - centerY) * 0.3
    
    ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`
  }

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0px, 0px) scale(1)'
    }
    setIsHovered(false)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      whileTap={{ scale: 0.95 }}
      style={{ 
        transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {/* Magnetic glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-xl blur-xl"
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.2 : 1
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-white/10 rounded-xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isHovered ? 1 : 0,
          opacity: isHovered ? 0.1 : 0
        }}
        transition={{ duration: 0.4 }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.button>
  )
}