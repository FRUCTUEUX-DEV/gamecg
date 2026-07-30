import { useEffect, useRef } from "react"

/**
 * Champ de particules animées pour la section Prix
 * Inspiré du design cinématographique AGORA
 */
export function ParticleField({ density = 90, burst = false, className = "" }) {
  const ref = useRef(null)
  const rafRef = useRef(0)
  const parts = useRef([])
  const mouse = useRef({ x: 0, y: 0 })
  const burstRef = useRef(false)

  useEffect(() => {
    burstRef.current = burst
  }, [burst])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    let w = 0,
      h = 0,
      dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const rand = (a, b) => a + Math.random() * (b - a)
    
    const makeAmbient = () => ({
      x: rand(0, w),
      y: rand(0, h),
      z: rand(0.3, 1),
      vx: rand(-0.05, 0.05),
      vy: rand(-0.15, -0.02),
      r: rand(0.4, 1.8),
      life: 0,
      maxLife: rand(400, 900),
      hue: Math.random() < 0.5 ? 190 : 45,
      alpha: rand(0.2, 0.9),
    })

    for (let i = 0; i < density; i++) parts.current.push(makeAmbient())

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.current.x = e.clientX - r.left
      mouse.current.y = e.clientY - r.top
    }
    window.addEventListener("mousemove", onMove)

    let lastBurst = 0
    const loop = (t) => {
      ctx.clearRect(0, 0, w, h)
      
      // Volumetric fog wash
      const g = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, Math.max(w, h) * 0.7)
      g.addColorStop(0, "rgba(34,211,238,0.05)")
      g.addColorStop(1, "rgba(3,8,23,0)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      if (burstRef.current && t - lastBurst > 60) {
        lastBurst = t
        for (let i = 0; i < 6; i++) {
          parts.current.push({
            x: rand(0, w),
            y: -10,
            z: rand(0.6, 1),
            vx: rand(-0.3, 0.3),
            vy: rand(0.4, 1.2),
            r: rand(0.8, 2.4),
            life: 0,
            maxLife: rand(300, 700),
            hue: [190, 45, 0][Math.floor(Math.random() * 3)],
            alpha: rand(0.5, 1),
          })
        }
      }

      for (let i = parts.current.length - 1; i >= 0; i--) {
        const p = parts.current[i]
        p.life++
        p.x += p.vx * p.z
        p.y += p.vy * p.z

        // Subtle mouse parallax
        const mx = ((mouse.current.x - w / 2) * 0.0008) * p.z
        const my = ((mouse.current.y - h / 2) * 0.0008) * p.z
        p.x -= mx
        p.y -= my

        const lifeRatio = p.life / p.maxLife
        const a = p.alpha * (1 - lifeRatio) * (0.6 + 0.4 * Math.sin(p.life * 0.05))

        const color =
          p.hue === 190
            ? `rgba(103,232,249,${a})`
            : p.hue === 45
            ? `rgba(245,196,81,${a})`
            : `rgba(255,255,255,${a})`
            
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 8 * p.z
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2)
        ctx.fill()

        if (p.life > p.maxLife || p.y < -20 || p.y > h + 20 || p.x < -20 || p.x > w + 20) {
          parts.current.splice(i, 1)
          if (parts.current.length < density) parts.current.push(makeAmbient())
        }
      }
      
      ctx.shadowBlur = 0
      rafRef.current = requestAnimationFrame(loop)
    }
    
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      parts.current = []
    }
  }, [density])

  return <canvas ref={ref} className={className} />
}
