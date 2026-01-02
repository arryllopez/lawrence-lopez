"use client"

import { useRef, useEffect, useCallback, useState } from "react"

interface Fish {
  id: number
  x: number
  y: number
  width: number
  height: number
  speed: number
  direction: 1 | -1
  color: string
  finColor: string
  points: number
  type: "small" | "medium" | "large" | "rare"
  wobble: number
  clicksToReel: number
}

interface Bubble {
  x: number
  y: number
  radius: number
  speed: number
  opacity: number
}

interface WaterPlant {
  x: number
  baseY: number
  height: number
  segments: number
  color: string
}

const FISH_TYPES = {
  small: { width: 35, height: 18, points: 10, color: "#FF6B6B", finColor: "#FF8E8E", clicksToReel: 2 },
  medium: { width: 55, height: 28, points: 25, color: "#4ECDC4", finColor: "#7EDDD6", clicksToReel: 4 },
  large: { width: 85, height: 45, points: 50, color: "#45B7D1", finColor: "#6BC9DD", clicksToReel: 6 },
  rare: { width: 65, height: 35, points: 100, color: "#FFD93D", finColor: "#FFE566", clicksToReel: 5 },
}

type GamePhase = "idle" | "casting" | "waiting" | "fish-on" | "reeling"

export function FishingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fishRef = useRef<Fish[]>([])
  const bubblesRef = useRef<Bubble[]>([])
  const plantsRef = useRef<WaterPlant[]>([])
  const hookRef = useRef({ x: 0, y: 60, targetY: 60, speed: 0 })
  const requestRef = useRef<number>(0)
  const timeRef = useRef(0)
  const [score, setScore] = useState(0)
  const [caughtFish, setCaughtFish] = useState<Fish | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const [gamePhase, setGamePhase] = useState<GamePhase>("idle")
  const gamePhaseRef = useRef<GamePhase>("idle")
  const [clicksRemaining, setClicksRemaining] = useState(0)
  const [fishOnHook, setFishOnHook] = useState<Fish | null>(null)
  const waitTimerRef = useRef<NodeJS.Timeout | null>(null)

  const spawnFish = useCallback((canvas: HTMLCanvasElement) => {
    const types: Array<"small" | "medium" | "large" | "rare"> = [
      "small",
      "small",
      "small",
      "small",
      "medium",
      "medium",
      "medium",
      "large",
      "large",
      "rare",
    ]
    const type = types[Math.floor(Math.random() * types.length)]
    const fishType = FISH_TYPES[type]
    const direction = Math.random() > 0.5 ? 1 : -1
    const waterSurface = 120

    return {
      id: Date.now() + Math.random(),
      x: direction === 1 ? -fishType.width : canvas.width + fishType.width,
      y: waterSurface + 20 + Math.random() * (canvas.height - waterSurface - 80),
      width: fishType.width,
      height: fishType.height,
      speed: 0.8 + Math.random() * 1.5,
      direction: direction as 1 | -1,
      color: fishType.color,
      finColor: fishType.finColor,
      points: fishType.points,
      type,
      wobble: Math.random() * Math.PI * 2,
      clicksToReel: fishType.clicksToReel,
    }
  }, [])

  const initPlants = useCallback((canvas: HTMLCanvasElement) => {
    const plants: WaterPlant[] = []
    const numPlants = Math.floor(canvas.width / 80)
    const colors = ["#2D5016", "#3A6B1E", "#4A7C23", "#2A4A12"]

    for (let i = 0; i < numPlants; i++) {
      plants.push({
        x: 40 + i * 80 + Math.random() * 40,
        baseY: canvas.height,
        height: 60 + Math.random() * 80,
        segments: 5 + Math.floor(Math.random() * 4),
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    return plants
  }, [])

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    fishRef.current = []
    bubblesRef.current = []
    plantsRef.current = initPlants(canvas)

    for (let i = 0; i < 15; i++) {
      fishRef.current.push(spawnFish(canvas))
    }

    hookRef.current = { x: canvas.width / 2, y: 60, targetY: 60, speed: 0 }
    setGamePhase("idle")
    gamePhaseRef.current = "idle"
    setClicksRemaining(0)
    setFishOnHook(null)
    setScore(0)
    setCaughtFish(null)
    setTimeLeft(60)
    setGameStarted(true)
    setGameOver(false)
  }, [spawnFish, initPlants])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true)
          if (waitTimerRef.current) clearTimeout(waitTimerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver])

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
        if (plantsRef.current.length === 0) {
          plantsRef.current = initPlants(canvas)
        }
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const handleMouseMove = (e: MouseEvent) => {
      if (gamePhase !== "idle") return
      const rect = canvas.getBoundingClientRect()
      hookRef.current.x = Math.max(20, Math.min(canvas.width - 20, e.clientX - rect.left))
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (gamePhase !== "idle") return
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      hookRef.current.x = Math.max(20, Math.min(canvas.width - 20, touch.clientX - rect.left))
    }

    const handleClick = () => {
      console.log("Click detected! gameStarted:", gameStarted, "gameOver:", gameOver, "gamePhase:", gamePhase)
      if (!gameStarted || gameOver) return

      if (gamePhase === "idle") {
        // Cast the line
        console.log("Casting line!")
        setGamePhase("casting")
        gamePhaseRef.current = "casting"
        hookRef.current.targetY = canvas.height - 120
        hookRef.current.speed = 6
      } else if (gamePhase === "fish-on") {
        console.log("Reeling in fish! Clicks remaining:", clicksRemaining)
        // Click to reel
        setClicksRemaining((prev) => {
          const newClicks = prev - 1
          if (newClicks <= 0 && fishOnHook) {
            // Fish caught!
            setScore((s) => s + fishOnHook.points)
            setCaughtFish(fishOnHook)
            setFishOnHook(null)
            setGamePhase("reeling")
            gamePhaseRef.current = "reeling"
            hookRef.current.targetY = 60
            hookRef.current.speed = 8
          }
          return Math.max(0, newClicks)
        })
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("click", handleClick)
    canvas.addEventListener("touchstart", handleClick)

    const drawSky = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 120)
      gradient.addColorStop(0, "#87CEEB")
      gradient.addColorStop(0.5, "#B0E0E6")
      gradient.addColorStop(1, "#E0F6FF")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, 120)

      // Sun
      ctx.fillStyle = "#FFE066"
      ctx.shadowColor = "#FFD700"
      ctx.shadowBlur = 30
      ctx.beginPath()
      ctx.arc(canvas.width - 80, 50, 35, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      const drawCloud = (x: number, y: number, scale: number) => {
        ctx.beginPath()
        ctx.arc(x, y, 20 * scale, 0, Math.PI * 2)
        ctx.arc(x + 25 * scale, y - 5 * scale, 25 * scale, 0, Math.PI * 2)
        ctx.arc(x + 55 * scale, y, 20 * scale, 0, Math.PI * 2)
        ctx.arc(x + 25 * scale, y + 10 * scale, 15 * scale, 0, Math.PI * 2)
        ctx.fill()
      }
      drawCloud(100 + Math.sin(timeRef.current * 0.0003) * 10, 40, 1)
      drawCloud(canvas.width / 2 + Math.sin(timeRef.current * 0.0002) * 15, 55, 0.8)
    }

    const drawWater = () => {
      const waterSurface = 120

      const gradient = ctx.createLinearGradient(0, waterSurface, 0, canvas.height)
      gradient.addColorStop(0, "#1E90FF")
      gradient.addColorStop(0.3, "#1873CC")
      gradient.addColorStop(0.6, "#0F5499")
      gradient.addColorStop(1, "#0A3D6E")
      ctx.fillStyle = gradient
      ctx.fillRect(0, waterSurface, canvas.width, canvas.height - waterSurface)

      // Light rays
      ctx.save()
      for (let i = 0; i < 6; i++) {
        const rayX = 80 + i * 120
        const gradient = ctx.createLinearGradient(rayX, waterSurface, rayX + 40, canvas.height)
        gradient.addColorStop(0, "rgba(135, 206, 250, 0.15)")
        gradient.addColorStop(1, "rgba(135, 206, 250, 0)")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.moveTo(rayX, waterSurface)
        ctx.lineTo(rayX - 30, canvas.height)
        ctx.lineTo(rayX + 70, canvas.height)
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()

      // Water surface waves
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, waterSurface)
      for (let x = 0; x < canvas.width; x += 5) {
        const y = waterSurface + Math.sin(timeRef.current * 0.003 + x * 0.02) * 4
        ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, waterSurface + 8)
      for (let x = 0; x < canvas.width; x += 5) {
        const y = waterSurface + 8 + Math.sin(timeRef.current * 0.002 + x * 0.015 + 1) * 3
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    const drawPlants = () => {
      plantsRef.current.forEach((plant) => {
        ctx.strokeStyle = plant.color
        ctx.lineWidth = 4
        ctx.lineCap = "round"

        const segmentHeight = plant.height / plant.segments
        let prevX = plant.x
        let prevY = plant.baseY

        ctx.beginPath()
        ctx.moveTo(prevX, prevY)

        for (let i = 1; i <= plant.segments; i++) {
          const sway = Math.sin(timeRef.current * 0.002 + plant.x * 0.01 + i * 0.5) * (i * 3)
          const x = plant.x + sway
          const y = plant.baseY - i * segmentHeight
          ctx.quadraticCurveTo(prevX + sway * 0.5, (prevY + y) / 2, x, y)
          prevX = x
          prevY = y
        }
        ctx.stroke()

        ctx.fillStyle = plant.color
        ctx.beginPath()
        ctx.ellipse(prevX, prevY, 6, 12, Math.sin(timeRef.current * 0.002 + plant.x) * 0.3, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawBubbles = () => {
      if (Math.random() < 0.03) {
        bubblesRef.current.push({
          x: 50 + Math.random() * (canvas.width - 100),
          y: canvas.height - 20,
          radius: 2 + Math.random() * 4,
          speed: 0.5 + Math.random() * 1,
          opacity: 0.3 + Math.random() * 0.4,
        })
      }

      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const bubble = bubblesRef.current[i]
        bubble.y -= bubble.speed
        bubble.x += Math.sin(timeRef.current * 0.01 + bubble.y * 0.05) * 0.5

        if (bubble.y < 120) {
          bubblesRef.current.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`
        ctx.fill()
        ctx.strokeStyle = `rgba(255, 255, 255, ${bubble.opacity + 0.2})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    const drawFish = (fish: Fish) => {
      ctx.save()

      fish.wobble += 0.1
      const wobbleOffset = Math.sin(fish.wobble) * 2

      ctx.translate(fish.x + fish.width / 2, fish.y + fish.height / 2 + wobbleOffset)
      if (fish.direction === -1) ctx.scale(-1, 1)

      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.beginPath()
      ctx.ellipse(3, 5, fish.width / 2 - 2, fish.height / 3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Tail
      ctx.fillStyle = fish.finColor
      ctx.beginPath()
      ctx.moveTo(-fish.width / 2 + 5, 0)
      ctx.quadraticCurveTo(
        -fish.width / 2 - fish.width / 4,
        -fish.height / 2 - 5 + Math.sin(fish.wobble * 2) * 3,
        -fish.width / 2 - fish.width / 3,
        -fish.height / 3,
      )
      ctx.quadraticCurveTo(-fish.width / 2 - fish.width / 4, 0, -fish.width / 2 - fish.width / 3, fish.height / 3)
      ctx.quadraticCurveTo(
        -fish.width / 2 - fish.width / 4,
        fish.height / 2 + 5 + Math.sin(fish.wobble * 2) * 3,
        -fish.width / 2 + 5,
        0,
      )
      ctx.fill()

      // Body
      ctx.fillStyle = fish.color
      ctx.beginPath()
      ctx.ellipse(0, 0, fish.width / 2, fish.height / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Belly highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.beginPath()
      ctx.ellipse(0, fish.height / 6, fish.width / 3, fish.height / 4, 0, 0, Math.PI * 2)
      ctx.fill()

      // Dorsal fin
      ctx.fillStyle = fish.finColor
      ctx.beginPath()
      ctx.moveTo(-fish.width / 6, -fish.height / 2 + 2)
      ctx.quadraticCurveTo(0, -fish.height / 2 - fish.height / 3, fish.width / 6, -fish.height / 2 + 2)
      ctx.fill()

      // Eye
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(fish.width / 4, -fish.height / 8, fish.height / 5, 0, Math.PI * 2)
      ctx.fill()

      // Pupil
      ctx.fillStyle = "#1a1a1a"
      ctx.beginPath()
      ctx.arc(fish.width / 4 + 2, -fish.height / 8, fish.height / 8, 0, Math.PI * 2)
      ctx.fill()

      // Eye shine
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.arc(fish.width / 4 + 3, -fish.height / 8 - 2, fish.height / 16, 0, Math.PI * 2)
      ctx.fill()

      // Rare fish sparkle
      if (fish.type === "rare") {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(timeRef.current * 0.01) * 0.3})`
        for (let i = 0; i < 3; i++) {
          const sparkleX = -fish.width / 4 + i * (fish.width / 4)
          const sparkleY = Math.sin(timeRef.current * 0.005 + i) * (fish.height / 4)
          ctx.beginPath()
          ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
    }

    const drawHook = () => {
      const hook = hookRef.current
      const waterSurface = 120

      // Fishing rod
      ctx.strokeStyle = "#8B4513"
      ctx.lineWidth = 6
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(hook.x - 30, 0)
      ctx.quadraticCurveTo(hook.x - 10, 20, hook.x, 40)
      ctx.stroke()

      ctx.strokeStyle = "#A0522D"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(hook.x, 40)
      ctx.lineTo(hook.x, 55)
      ctx.stroke()

      // Fishing line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(hook.x, 55)

      if (hook.y > waterSurface) {
        ctx.lineTo(hook.x, waterSurface)
        ctx.stroke()

        ctx.strokeStyle = "rgba(200, 200, 200, 0.5)"
        ctx.beginPath()
        ctx.moveTo(hook.x, waterSurface)
        const swayAmount = Math.sin(timeRef.current * 0.003) * 10
        ctx.quadraticCurveTo(hook.x + swayAmount, (waterSurface + hook.y) / 2, hook.x, hook.y)
      } else {
        ctx.lineTo(hook.x, hook.y)
      }
      ctx.stroke()

      // Bobber
      if (hook.y <= waterSurface + 20) {
        const bobberY = Math.min(hook.y, waterSurface + Math.sin(timeRef.current * 0.005) * 3)

        ctx.fillStyle = "#FF0000"
        ctx.beginPath()
        ctx.ellipse(hook.x, bobberY - 8, 8, 12, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "#FFFFFF"
        ctx.beginPath()
        ctx.ellipse(hook.x, bobberY - 2, 8, 4, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // Hook underwater
      if (hook.y > waterSurface) {
        ctx.strokeStyle = "#C0C0C0"
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(hook.x, hook.y)
        ctx.lineTo(hook.x, hook.y + 15)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(hook.x - 8, hook.y + 15, 8, 0, Math.PI, false)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(hook.x - 16, hook.y + 15)
        ctx.lineTo(hook.x - 16, hook.y + 8)
        ctx.lineTo(hook.x - 13, hook.y + 12)
        ctx.stroke()

        // Bait
        ctx.strokeStyle = "#D2691E"
        ctx.lineWidth = 3
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(hook.x - 8, hook.y + 20)
        const wormWobble = Math.sin(timeRef.current * 0.01) * 3
        ctx.quadraticCurveTo(hook.x - 8 + wormWobble, hook.y + 28, hook.x - 5, hook.y + 32)
        ctx.stroke()
      }
    }

    const gameLoop = () => {
      timeRef.current = Date.now()

      drawSky()
      drawWater()
      drawPlants()
      drawBubbles()

      if (!gameStarted && !gameOver) {
        drawHook()
        requestRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Update fish
      for (let i = fishRef.current.length - 1; i >= 0; i--) {
        const fish = fishRef.current[i]
        fish.x += fish.speed * fish.direction

        if (fish.x < -fish.width * 2 || fish.x > canvas.width + fish.width * 2) {
          fishRef.current.splice(i, 1)
          fishRef.current.push(spawnFish(canvas))
        }
      }

      // Update hook position
      const hook = hookRef.current
      if (gamePhase === "casting" || gamePhase === "reeling") {
        const dy = hook.targetY - hook.y
        if (Math.abs(dy) > 5) {
          hook.y += Math.sign(dy) * hook.speed
          if (gamePhase === "casting") {
            console.log("Casting... hook.y:", hook.y, "target:", hook.targetY, "dy:", dy)
          }
        } else {
          hook.y = hook.targetY
          if (gamePhase === "casting" && gamePhaseRef.current === "casting") {
            // Line is cast, now wait for a random fish to bite
            console.log("Line cast! Waiting for fish...")
            setGamePhase("waiting")
            gamePhaseRef.current = "waiting"

            // Random time between 1-5 seconds for a fish to bite (shorter for testing)
            const biteTime = 1000 + Math.random() * 4000
            console.log(`Fish will bite in ${(biteTime / 1000).toFixed(1)} seconds`)

            waitTimerRef.current = setTimeout(() => {
              console.log("Bite timer fired! Phase:", gamePhaseRef.current)
              if (gamePhaseRef.current !== "waiting") {
                console.log("Phase changed, aborting bite")
                return
              }

              // Pick a random fish from the pool
              console.log("Fish available:", fishRef.current.length)
              if (fishRef.current.length > 0) {
                const randomFish = fishRef.current[Math.floor(Math.random() * fishRef.current.length)]
                console.log("FISH ON THE HOOK!", randomFish.type)
                setFishOnHook(randomFish)
                // Everyone can catch - just need 3-5 clicks
                const clicks = 3 + Math.floor(Math.random() * 3)
                console.log("Clicks needed:", clicks)
                setClicksRemaining(clicks)
                setGamePhase("fish-on")
                gamePhaseRef.current = "fish-on"
                // Remove fish from pool
                const idx = fishRef.current.indexOf(randomFish)
                if (idx > -1) fishRef.current.splice(idx, 1)
              } else {
                console.log("No fish available!")
                // No fish left, reel back in
                setGamePhase("reeling")
                gamePhaseRef.current = "reeling"
                hook.targetY = 60
                hook.speed = 5
              }
            }, biteTime)
          } else if (gamePhase === "reeling" && gamePhaseRef.current === "reeling") {
            // Back at top, reset
            console.log("Reeling complete, back to idle")
            setGamePhase("idle")
            gamePhaseRef.current = "idle"
            setCaughtFish(null)
          }
        }
      }

      // Draw fish
      fishRef.current.forEach(drawFish)

      // Draw fish on hook during fight and reeling
      if ((fishOnHook || caughtFish) && (gamePhase === "fish-on" || gamePhase === "reeling")) {
        const fishToDraw = caughtFish || fishOnHook
        if (fishToDraw) {
          // Add fight effect - fish wiggles when on hook
          const fightWiggle = gamePhase === "fish-on" ? Math.sin(timeRef.current * 0.02) * 15 : 0
          const caughtFishDraw = {
            ...fishToDraw,
            x: hook.x - fishToDraw.width / 2 + fightWiggle,
            y: hook.y + 25 + Math.abs(fightWiggle) / 2,
            direction: 1 as const,
          }
          drawFish(caughtFishDraw)
        }
      }

      drawHook()

      // Spawn more fish - keep the pool populated
      if (fishRef.current.length < 12) {
        fishRef.current.push(spawnFish(canvas))
      }

      if (!gameOver) {
        requestRef.current = requestAnimationFrame(gameLoop)
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("click", handleClick)
      canvas.removeEventListener("touchstart", handleClick)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      if (waitTimerRef.current) {
        clearTimeout(waitTimerRef.current)
      }
    }
  }, [gameStarted, gameOver, spawnFish, initPlants])

  const getInstructionText = () => {
    switch (gamePhase) {
      case "idle":
        return "Tap to cast"
      case "casting":
        return "Casting..."
      case "waiting":
        return "Waiting for a bite..."
      case "fish-on":
        return `Fish on! Tap ${clicksRemaining}x to reel!`
      case "reeling":
        return "Reeling in..."
      default:
        return ""
    }
  }

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden shadow-2xl">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair touch-none" />

      {/* HUD */}
      {gameStarted && !gameOver && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between">
          <span className="bg-white/90 text-gray-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold shadow-lg text-sm sm:text-base">
            Score: {score}
          </span>
          <span
            className={`bg-white/90 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold shadow-lg text-sm sm:text-base ${timeLeft <= 10 ? "text-red-500" : "text-gray-800"}`}
          >
            {timeLeft}s
          </span>
        </div>
      )}

      {/* Start screen */}
      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-sky-400/80 to-blue-600/80 backdrop-blur-sm p-4">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow-lg tracking-tight">
            Gone Fishing!
          </h3>
          <p className="text-white/90 mb-2 text-center px-4 text-sm sm:text-base">Move to aim the rod</p>
          <p className="text-white/80 mb-6 text-xs sm:text-sm text-center">
            Tap to cast, then tap to reel when a fish bites!
          </p>
          <button
            onClick={initGame}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Start Fishing
          </button>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-400/90 to-blue-700/90 backdrop-blur-sm p-4">
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg tracking-tight">
              Great Catch!
            </h3>
            <p className="text-white/90 text-lg sm:text-xl mb-6">Final Score: {score}</p>
            <button
              onClick={initGame}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Fish Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {gameStarted && !gameOver && (
        <div
          className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-full shadow ${
            gamePhase === "fish-on"
              ? "bg-yellow-400 text-gray-900 animate-pulse font-bold"
              : "bg-white/80 text-gray-700"
          }`}
        >
          {getInstructionText()}
        </div>
      )}
    </div>
  )
}
