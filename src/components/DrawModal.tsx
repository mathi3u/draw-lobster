'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Stroke } from '@/lib/types'
import { createStroke, addPoint, undoLastStroke, renderStrokes } from '@/lib/drawing'

type Layer = 'tail' | 'leftClaw' | 'rightClaw'

const LAYER_COLORS: Record<Layer, string> = {
  tail: '#ff6633',
  leftClaw: '#ff9999',
  rightClaw: '#99bbff',
}

const LAYER_LABELS: Record<Layer, string> = {
  tail: 'Body & tail',
  leftClaw: 'Left claw',
  rightClaw: 'Right claw',
}

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 240

interface DrawModalProps {
  onSubmit: (layers: { tail: Stroke[]; leftClaw: Stroke[]; rightClaw: Stroke[] }) => void
  onClose: () => void
}

export default function DrawModal({ onSubmit, onClose }: DrawModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeLayer, setActiveLayer] = useState<Layer>('tail')
  const [brushSize, setBrushSize] = useState(4)
  const [layers, setLayers] = useState<Record<Layer, Stroke[]>>({
    tail: [],
    leftClaw: [],
    rightClaw: [],
  })
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const isDrawingRef = useRef(false)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.fillStyle = '#0c2a4a'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    const order: Layer[] = ['leftClaw', 'tail', 'rightClaw']
    for (const layer of order) {
      if (layer !== activeLayer) {
        ctx.globalAlpha = 0.4
      }
      renderStrokes(ctx, layers[layer])
      ctx.globalAlpha = 1
    }

    if (currentStroke) {
      renderStrokes(ctx, [currentStroke])
    }
  }, [layers, activeLayer, currentStroke])

  useEffect(() => {
    redraw()
  }, [redraw])

  const getCanvasPoint = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = CANVAS_WIDTH / rect.width
    const scaleY = CANVAS_HEIGHT / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const point = getCanvasPoint(e)
    if (!point) return
    isDrawingRef.current = true
    const stroke = createStroke(LAYER_COLORS[activeLayer], brushSize)
    setCurrentStroke(addPoint(stroke, point))
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || !currentStroke) return
    const point = getCanvasPoint(e)
    if (!point) return
    setCurrentStroke(addPoint(currentStroke, point))
  }

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !currentStroke) return
    isDrawingRef.current = false
    if (currentStroke.points.length >= 2) {
      setLayers(prev => ({
        ...prev,
        [activeLayer]: [...prev[activeLayer], currentStroke],
      }))
    }
    setCurrentStroke(null)
  }

  const handleUndo = () => {
    setLayers(prev => ({
      ...prev,
      [activeLayer]: undoLastStroke(prev[activeLayer]),
    }))
  }

  const handleClear = () => {
    setLayers(prev => ({
      ...prev,
      [activeLayer]: [],
    }))
  }

  const handleSubmit = () => {
    onSubmit({
      tail: layers.tail,
      leftClaw: layers.leftClaw,
      rightClaw: layers.rightClaw,
    })
  }

  const isEmpty = layers.tail.length === 0
    && layers.leftClaw.length === 0
    && layers.rightClaw.length === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0c2a4a] rounded-2xl p-6 w-[360px] max-w-[95vw] text-white relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-xl"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-center mb-1">Draw a lobster</h2>
        <p className="text-xs text-white/50 text-center mb-4">facing right &rarr;</p>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full rounded-lg cursor-crosshair touch-none"
          style={{ aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Layer selector */}
        <div className="flex justify-center gap-3 mt-4">
          {(['tail', 'leftClaw', 'rightClaw'] as Layer[]).map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: LAYER_COLORS[layer],
                  borderColor: activeLayer === layer ? '#fff' : 'transparent',
                  transform: activeLayer === layer ? 'scale(1.2)' : 'scale(1)',
                }}
              />
              <span className="text-[10px] text-white/60">
                {LAYER_LABELS[layer]}
              </span>
            </button>
          ))}
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-3 mt-4 px-2">
          <span className="text-xs text-white/50">Size</span>
          <input
            type="range"
            min={1}
            max={12}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="flex-1 accent-white"
          />
          <div
            className="rounded-full bg-white"
            style={{ width: brushSize * 2, height: brushSize * 2 }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleUndo}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
            disabled={layers[activeLayer].length === 0}
          >
            Undo
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
            disabled={layers[activeLayer].length === 0}
          >
            Clear
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isEmpty}
          className="w-full mt-3 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
        >
          Release your lobster!
        </button>
      </div>
    </div>
  )
}
