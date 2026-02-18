'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { LobsterDrawing } from '@/lib/types'
import { renderStrokes } from '@/lib/drawing'

const THUMB_WIDTH = 120
const THUMB_HEIGHT = 96
const DRAW_WIDTH = 300
const DRAW_HEIGHT = 240

function LobsterThumbnail({ lobster }: { lobster: LobsterDrawing }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT)
    ctx.fillStyle = '#0c2a4a'
    ctx.fillRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT)

    ctx.save()
    ctx.scale(THUMB_WIDTH / DRAW_WIDTH, THUMB_HEIGHT / DRAW_HEIGHT)
    const color = '#e04020'
    renderStrokes(ctx, lobster.leftClaw, color)
    renderStrokes(ctx, lobster.tail, color)
    renderStrokes(ctx, lobster.rightClaw, color)
    ctx.restore()
  }, [lobster])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={THUMB_WIDTH}
      height={THUMB_HEIGHT}
      className="rounded-lg"
    />
  )
}

interface GalleryModalProps {
  lobsters: LobsterDrawing[]
  onClose: () => void
}

export default function GalleryModal({ lobsters, onClose }: GalleryModalProps) {
  const active = lobsters.filter(l => !l.removed)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0c2a4a] rounded-2xl p-6 w-[520px] max-w-[95vw] max-h-[85vh] text-white relative flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-xl"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-1">Gallery</h2>
        <p className="text-xs text-white/40 mb-4">
          {active.length} lobster{active.length !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {active.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-8">
              No lobsters yet
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {active.map(l => (
                <LobsterThumbnail key={l.id} lobster={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
