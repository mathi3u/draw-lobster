'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { LobsterDrawing } from '@/lib/types'
import {
  initRunningLobster,
  updateLobster,
  triggerJump,
  getFloorY,
  LOBSTER_WIDTH,
  LOBSTER_HEIGHT,
  DRAWING_WIDTH,
  DRAWING_HEIGHT,
} from '@/lib/animation'
import type { RunningLobster } from '@/lib/animation'
import { renderBackground, resetScene } from '@/lib/background'
import { renderStrokes } from '@/lib/drawing'
import { hitTest } from '@/lib/hit-detection'

interface LobsterCanvasProps {
  lobsters: LobsterDrawing[]
  onRemoveLobster: (id: string) => void
  newLobsterId?: string | null
  onNewLobsterPlaced?: () => void
}

function renderLobsterOnFloor(
  ctx: CanvasRenderingContext2D,
  lobster: RunningLobster,
  floorY: number,
) {
  const { drawing, x, jumpHeight, legPhase } = lobster
  const clawOffset = Math.sin(legPhase * Math.PI * 2) * 4

  const feetY = floorY - jumpHeight

  ctx.save()

  // Shadow on the floor
  if (jumpHeight > 5) {
    const shadowScale = Math.max(0.3, 1 - jumpHeight / 200)
    ctx.save()
    ctx.translate(x, floorY)
    ctx.beginPath()
    ctx.ellipse(0, 0, LOBSTER_WIDTH * 0.35 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fill()
    ctx.restore()
  }

  // Position at feet
  ctx.translate(x, feetY)

  // Scale drawing canvas (300x240) to lobster size
  const scaleX = LOBSTER_WIDTH / DRAWING_WIDTH
  const scaleY = LOBSTER_HEIGHT / DRAWING_HEIGHT

  // Offset so bottom-center of the drawing is at origin (feet)
  ctx.scale(scaleX, scaleY)
  ctx.translate(-DRAWING_WIDTH / 2, -DRAWING_HEIGHT)

  // Lobster red on the main canvas
  const color = '#e04020'

  // Left claw (with animation)
  ctx.save()
  ctx.translate(0, clawOffset)
  renderStrokes(ctx, drawing.leftClaw, color)
  ctx.restore()

  // Tail (body)
  renderStrokes(ctx, drawing.tail, color)

  // Right claw (opposite offset)
  ctx.save()
  ctx.translate(0, -clawOffset)
  renderStrokes(ctx, drawing.rightClaw, color)
  ctx.restore()

  ctx.restore()
}

export default function LobsterCanvas({ lobsters, onRemoveLobster, newLobsterId, onNewLobsterPlaced }: LobsterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningLobstersRef = useRef<RunningLobster[]>([])
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const prevLobsterIdsRef = useRef<Set<string>>(new Set())

  const syncLobsters = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const currentIds = new Set(lobsters.map(l => l.id))
    const prevIds = prevLobsterIdsRef.current

    runningLobstersRef.current = runningLobstersRef.current.filter(
      rl => currentIds.has(rl.drawing.id),
    )

    for (const l of lobsters) {
      if (!prevIds.has(l.id)) {
        const rl = initRunningLobster(l, canvas.width, canvas.height)
        // Newly drawn lobster enters from the left edge
        if (l.id === newLobsterId) {
          rl.x = LOBSTER_WIDTH
          onNewLobsterPlaced?.()
        }
        runningLobstersRef.current.push(rl)
      }
    }

    prevLobsterIdsRef.current = currentIds
  }, [lobsters, newLobsterId, onNewLobsterPlaced])

  useEffect(() => {
    syncLobsters()
  }, [syncLobsters])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      resetScene()
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const deltaTime = lastTimeRef.current
        ? (time - lastTimeRef.current) / 1000
        : 1 / 60
      lastTimeRef.current = time
      const dt = Math.min(deltaTime, 0.1)

      const floorY = getFloorY(canvas.height)

      // Draw background (ocean + floor + seaweed + bubbles)
      renderBackground(ctx, canvas.width, canvas.height, time / 1000, floorY)

      // Update lobsters
      runningLobstersRef.current = runningLobstersRef.current.map(rl =>
        updateLobster(rl, dt, canvas.width, canvas.height),
      )

      // Sort by x for depth (further left = further back)
      const sorted = [...runningLobstersRef.current].sort((a, b) => a.x - b.x)
      for (const rl of sorted) {
        renderLobsterOnFloor(ctx, rl, floorY)
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  // Click => jump, double-click => remove
  const lastClickRef = useRef<{ time: number; id: string | null }>({ time: 0, id: null })

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width)
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height)

    const reversed = [...runningLobstersRef.current].reverse()
    const hit = reversed.find(rl => hitTest(clickX, clickY, rl, canvas.height))
    if (!hit) return

    const now = Date.now()
    const last = lastClickRef.current

    if (last.id === hit.drawing.id && now - last.time < 400) {
      onRemoveLobster(hit.drawing.id)
      lastClickRef.current = { time: 0, id: null }
    } else {
      const idx = runningLobstersRef.current.indexOf(hit)
      if (idx !== -1) {
        runningLobstersRef.current[idx] = triggerJump(hit)
      }
      lastClickRef.current = { time: now, id: hit.drawing.id }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full cursor-default"
      onClick={handleClick}
    />
  )
}
