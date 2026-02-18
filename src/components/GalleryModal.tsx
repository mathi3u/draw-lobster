'use client'

import { useEffect, useRef, useState } from 'react'
import type { LobsterDrawing } from '@/lib/types'
import { renderStrokes } from '@/lib/drawing'

const PREVIEW_WIDTH = 300
const PREVIEW_HEIGHT = 240

interface GalleryModalProps {
  lobsters: LobsterDrawing[]
  onClose: () => void
}

function LobsterPreview({ lobster }: { lobster: LobsterDrawing }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT)
    ctx.fillStyle = '#0c2a4a'
    ctx.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT)

    const color = '#e04020'
    renderStrokes(ctx, lobster.leftClaw, color)
    renderStrokes(ctx, lobster.tail, color)
    renderStrokes(ctx, lobster.rightClaw, color)
  }, [lobster])

  return (
    <canvas
      ref={canvasRef}
      width={PREVIEW_WIDTH}
      height={PREVIEW_HEIGHT}
      className="w-full rounded-lg"
      style={{ aspectRatio: `${PREVIEW_WIDTH}/${PREVIEW_HEIGHT}` }}
    />
  )
}

export default function GalleryModal({ lobsters, onClose }: GalleryModalProps) {
  const [index, setIndex] = useState(0)
  const activeLobsters = lobsters.filter(l => !l.removed)

  const goBack = () => setIndex(i => (i - 1 + activeLobsters.length) % activeLobsters.length)
  const goForward = () => setIndex(i => (i + 1) % activeLobsters.length)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goBack()
      if (e.key === 'ArrowRight') goForward()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  if (activeLobsters.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-[#0c2a4a] rounded-2xl p-6 w-[360px] max-w-[95vw] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white text-xl"
          >
            &times;
          </button>
          <p className="text-center text-white/60 py-8">No lobsters yet</p>
        </div>
      </div>
    )
  }

  const current = activeLobsters[index]
  const date = new Date(current.createdAt)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

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
        <h2 className="text-lg font-semibold text-center mb-4">Lobster Gallery</h2>

        {/* Preview */}
        <LobsterPreview lobster={current} />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-lg transition-colors"
          >
            &larr;
          </button>

          <span className="text-sm text-white/50">
            {index + 1} / {activeLobsters.length}
          </span>

          <button
            onClick={goForward}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-lg transition-colors"
          >
            &rarr;
          </button>
        </div>

        {/* Date */}
        <p className="text-xs text-white/30 text-center mt-2">{dateStr}</p>
      </div>
    </div>
  )
}
