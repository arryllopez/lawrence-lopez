"use client"

import { useRef, useEffect } from "react"

interface SquaresProps {
  direction?: "right" | "left" | "up" | "down" | "diagonal"
  speed?: number
  borderColor?: string
  squareSize?: number
  hoverFillColor?: string
  className?: string
}

export function Squares({
  direction = "diagonal",
  speed = 1,
  borderColor = "#333",
  squareSize = 40,
  hoverFillColor = "#222",
  className,
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>()
  const offsetRef = useRef({ x: 0, y: 0 })
  const hoverRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.style.background = "#060606"

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      hoverRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      hoverRef.current = null
    }

    const animate = () => {
      ctx.fillStyle = "#060606"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update offset based on direction
      const s = speed * 0.5
      switch (direction) {
        case "right":
          offsetRef.current.x += s
          break
        case "left":
          offsetRef.current.x -= s
          break
        case "up":
          offsetRef.current.y -= s
          break
        case "down":
          offsetRef.current.y += s
          break
        case "diagonal":
          offsetRef.current.x += s
          offsetRef.current.y += s
          break
      }

      // Wrap offset
      offsetRef.current.x = offsetRef.current.x % squareSize
      offsetRef.current.y = offsetRef.current.y % squareSize

      // Draw grid
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 0.5

      const startX = offsetRef.current.x - squareSize
      const startY = offsetRef.current.y - squareSize

      // Draw hover effect
      if (hoverRef.current) {
        const hoverGridX = Math.floor((hoverRef.current.x - startX) / squareSize)
        const hoverGridY = Math.floor((hoverRef.current.y - startY) / squareSize)
        const hoverX = startX + hoverGridX * squareSize
        const hoverY = startY + hoverGridY * squareSize

        ctx.fillStyle = hoverFillColor
        ctx.fillRect(hoverX, hoverY, squareSize, squareSize)
      }

      // Vertical lines
      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vignette effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) / 2,
      )
      gradient.addColorStop(0, "rgba(6, 6, 6, 0)")
      gradient.addColorStop(1, "#060606")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      requestRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    resizeCanvas()
    requestRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [direction, speed, borderColor, squareSize, hoverFillColor])

  return <canvas ref={canvasRef} className={`w-full h-full border-none block ${className}`} />
}
