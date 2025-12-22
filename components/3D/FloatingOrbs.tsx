'use client'

import { useEffect, useRef } from 'react'

export default function FloatingOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Orb class
    class Orb {
      x: number
      y: number
      radius: number
      color: string
      vx: number
      vy: number
      opacity: number
      pulseSpeed: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 100 + 50
        this.color = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 4)]
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.3 + 0.1
        this.pulseSpeed = Math.random() * 0.02 + 0.01
      }

      update(time: number) {
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        // Pulse effect
        this.opacity = 0.1 + Math.sin(time * this.pulseSpeed) * 0.2
      }

      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        )
        gradient.addColorStop(0, `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`)
        gradient.addColorStop(1, `${this.color}00`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Particle class
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.2
        this.vy = (Math.random() - 0.5) * 0.2
        this.life = Math.random() * 100
        this.maxLife = 100
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.life--

        if (this.life <= 0) {
          this.x = Math.random() * canvas.width
          this.y = Math.random() * canvas.height
          this.life = this.maxLife
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const opacity = this.life / this.maxLife
        ctx.fillStyle = `rgba(99, 102, 241, ${opacity * 0.6})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create orbs and particles
    const orbs: Orb[] = []
    const particles: Particle[] = []

    for (let i = 0; i < 4; i++) {
      orbs.push(new Orb())
    }

    for (let i = 0; i < 100; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    let animationId: number
    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw orbs
      orbs.forEach(orb => {
        orb.update(time * 0.001)
        orb.draw(ctx)
      })

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw(ctx)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  )
}