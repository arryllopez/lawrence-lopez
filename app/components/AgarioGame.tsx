"use client"

import { useRef, useEffect, useCallback, useState } from "react"

interface Circle {
  id: number
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
}

const COLORS = [
  "rgba(255, 77, 0, 0.9)", // Primary orange
  "rgba(255, 120, 50, 0.9)", // Light orange
  "rgba(200, 60, 0, 0.9)", // Dark orange
  "rgba(255, 150, 100, 0.8)", // Soft orange
  "rgba(180, 50, 0, 0.9)", // Deep orange
  "rgba(255, 100, 30, 0.9)", // Bright orange
]

export function AgarioGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const circlesRef = useRef<Circle[]>([])
  const playerRef = useRef<Circle | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const requestRef = useRef<number>()
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize player in center
    playerRef.current = {
      id: -1,
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 20,
      vx: 0,
      vy: 0,
      color: "rgba(255, 77, 0, 1)",
    }

    // Initialize AI circles
    circlesRef.current = []
    for (let i = 0; i < 25; i++) {
      circlesRef.current.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 8 + Math.random() * 25,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }

    setScore(0)
    setGameOver(false)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    initGame()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)

    const checkCollision = (c1: Circle, c2: Circle) => {
      const dx = c1.x - c2.x
      const dy = c1.y - c2.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < c1.radius + c2.radius * 0.5
    }

    const gameLoop = () => {
      if (gameOver) {
        requestRef.current = requestAnimationFrame(gameLoop)
        return
      }

      ctx.fillStyle = "#060606"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      ctx.strokeStyle = "rgba(51, 51, 51, 0.5)"
      ctx.lineWidth = 0.5
      const gridSize = 40
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Update and draw AI circles
      const toRemove: number[] = []

      for (let i = 0; i < circlesRef.current.length; i++) {
        const circle = circlesRef.current[i]

        // Move AI circles
        circle.x += circle.vx
        circle.y += circle.vy

        // Bounce off walls
        if (circle.x - circle.radius < 0 || circle.x + circle.radius > canvas.width) {
          circle.vx *= -1
        }
        if (circle.y - circle.radius < 0 || circle.y + circle.radius > canvas.height) {
          circle.vy *= -1
        }

        // Keep in bounds
        circle.x = Math.max(circle.radius, Math.min(canvas.width - circle.radius, circle.x))
        circle.y = Math.max(circle.radius, Math.min(canvas.height - circle.radius, circle.y))

        // AI circles consume each other
        for (let j = i + 1; j < circlesRef.current.length; j++) {
          const other = circlesRef.current[j]
          if (checkCollision(circle, other)) {
            if (circle.radius > other.radius) {
              circle.radius += other.radius * 0.3
              toRemove.push(j)
            } else if (other.radius > circle.radius) {
              other.radius += circle.radius * 0.3
              toRemove.push(i)
            }
          }
        }

        // Draw circle with glow
        ctx.shadowColor = circle.color
        ctx.shadowBlur = 15
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
        ctx.fillStyle = circle.color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Remove consumed circles (reverse order to preserve indices)
      const uniqueRemove = [...new Set(toRemove)].sort((a, b) => b - a)
      for (const idx of uniqueRemove) {
        circlesRef.current.splice(idx, 1)
      }

      // Spawn new circles occasionally
      if (circlesRef.current.length < 20 && Math.random() < 0.02) {
        const edge = Math.floor(Math.random() * 4)
        let x, y
        switch (edge) {
          case 0:
            x = 0
            y = Math.random() * canvas.height
            break
          case 1:
            x = canvas.width
            y = Math.random() * canvas.height
            break
          case 2:
            x = Math.random() * canvas.width
            y = 0
            break
          default:
            x = Math.random() * canvas.width
            y = canvas.height
            break
        }
        circlesRef.current.push({
          id: Date.now(),
          x,
          y,
          radius: 8 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        })
      }

      // Update player
      const player = playerRef.current
      if (player) {
        // Move towards mouse
        const dx = mouseRef.current.x - player.x
        const dy = mouseRef.current.y - player.y
        const speed = Math.max(1, 5 - player.radius * 0.05)
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 5) {
          player.x += (dx / distance) * speed
          player.y += (dy / distance) * speed
        }

        // Keep player in bounds
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x))
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y))

        // Check collision with AI circles
        for (let i = circlesRef.current.length - 1; i >= 0; i--) {
          const circle = circlesRef.current[i]
          if (checkCollision(player, circle)) {
            if (player.radius > circle.radius) {
              player.radius += circle.radius * 0.3
              circlesRef.current.splice(i, 1)
              setScore((s) => s + Math.floor(circle.radius))
            } else if (circle.radius > player.radius * 1.2) {
              setGameOver(true)
            }
          }
        }

        // Draw player with stronger glow
        ctx.shadowColor = player.color
        ctx.shadowBlur = 25
        ctx.beginPath()
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2)
        ctx.fillStyle = player.color
        ctx.fill()

        // Inner highlight
        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(player.x - player.radius * 0.3, player.y - player.radius * 0.3, player.radius * 0.2, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.fill()
      }

      // Draw vignette
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) / 2,
      )
      gradient.addColorStop(0, "rgba(6, 6, 6, 0)")
      gradient.addColorStop(1, "rgba(6, 6, 6, 0.8)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      requestRef.current = requestAnimationFrame(gameLoop)
    }

    requestRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameOver, initGame])

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <canvas ref={canvasRef} className="w-full h-full cursor-none" />

      {/* Score display */}
      <div className="absolute top-4 left-4 text-white/80 font-mono text-sm">Score: {score}</div>

      {/* Game over overlay */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
          <h3 className="text-2xl font-bold text-white mb-2">Game Over</h3>
          <p className="text-white/70 mb-4">Final Score: {score}</p>
          <button
            onClick={initGame}
            className="px-6 py-2 bg-[rgb(255,77,0)] text-black font-semibold rounded-lg hover:bg-[rgb(255,100,30)] transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white/50 text-xs">
        Move mouse to control. Eat smaller circles, avoid bigger ones.
      </div>
    </div>
  )
}
