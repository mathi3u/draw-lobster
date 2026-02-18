'use client'

import { useCallback, useEffect, useState } from 'react'
import LobsterCanvas from '@/components/LobsterCanvas'
import DrawModal from '@/components/DrawModal'
import InfoModal from '@/components/InfoModal'
import GalleryModal from '@/components/GalleryModal'
import type { LobsterDrawing, Stroke } from '@/lib/types'

// Irregular shell shapes — 4 variants
const shellPaths = [
  'M22,4 C30,2 38,3 44,8 C50,14 52,24 48,34 C44,42 36,48 26,48 C16,48 8,44 4,36 C0,26 2,14 8,8 C14,2 18,4 22,4Z',
  'M24,3 C32,1 42,4 47,12 C52,20 50,32 46,40 C40,48 30,50 20,47 C10,44 3,36 2,26 C1,16 6,6 16,3 C20,2 22,3 24,3Z',
  'M20,5 C28,1 40,2 46,10 C52,18 51,30 47,38 C42,46 32,50 22,48 C12,46 4,38 2,28 C0,18 4,8 12,5 C16,3 18,5 20,5Z',
  'M26,3 C34,2 44,6 48,14 C52,22 50,34 44,42 C38,48 28,50 18,46 C8,42 2,32 2,22 C2,12 8,4 18,3 C22,2 24,3 26,3Z',
]

function ShellButton({ onClick, children, label }: {
  onClick: () => void
  children: React.ReactNode
  label: string
}) {
  const path = shellPaths[label.length % shellPaths.length]
  return (
    <button
      onClick={onClick}
      title={label}
      className="relative w-14 h-14 flex items-center justify-center text-[#0a2a3a] hover:text-[#051520] transition-colors group cursor-pointer"
    >
      <svg viewBox="0 0 52 52" className="absolute inset-0 w-full h-full">
        <path
          d={path}
          className="fill-[#5a9aa8]/70 group-hover:fill-[#7bc0cc]/80 transition-colors"
          stroke="rgba(100,180,200,0.3)"
          strokeWidth="1"
        />
      </svg>
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export default function Home() {
  const [allLobsters, setAllLobsters] = useState<LobsterDrawing[]>([])
  const [showDraw, setShowDraw] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [newLobsterId, setNewLobsterId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const activeLobsters = allLobsters.filter(l => !l.removed)

  const fetchLobsters = useCallback(async () => {
    const res = await fetch('/api/lobsters')
    const data: LobsterDrawing[] = await res.json()
    setAllLobsters(data)
    return data
  }, [])

  useEffect(() => {
    fetchLobsters().then(async data => {
      if (data.length === 0) {
        await fetch('/api/lobsters/seed', { method: 'POST' })
        await fetchLobsters()
      }
      setShowDraw(true)
      setLoaded(true)
    })
  }, [fetchLobsters])

  const handleSubmit = async (layers: { tail: Stroke[]; leftClaw: Stroke[]; rightClaw: Stroke[] }) => {
    const res = await fetch('/api/lobsters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layers),
    })
    const lobster: LobsterDrawing = await res.json()
    setAllLobsters(prev => [...prev, lobster])
    setNewLobsterId(lobster.id)
    setShowDraw(false)
  }

  const handleRemove = async (id: string) => {
    await fetch(`/api/lobsters/${id}`, { method: 'DELETE' })
    setAllLobsters(prev => prev.map(l => l.id === id ? { ...l, removed: true } : l))
  }

  const handleAmnesty = async () => {
    await fetch('/api/lobsters/amnesty', { method: 'POST' })
    setAllLobsters(prev => prev.map(l => ({ ...l, removed: false })))
  }

  const removedCount = allLobsters.filter(l => l.removed).length

  if (!loaded) return null

  return (
    <>
      <LobsterCanvas
        lobsters={activeLobsters}
        onRemoveLobster={handleRemove}
        newLobsterId={newLobsterId}
        onNewLobsterPlaced={() => setNewLobsterId(null)}
      />

      {/* Title */}
      <h1
        className="fixed top-6 left-8 z-10 text-white/80 text-3xl md:text-4xl font-bold pointer-events-none select-none"
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        Draw me a lobster
      </h1>

      {/* Shell buttons (bottom-right) */}
      <div className="fixed bottom-5 right-5 z-10 flex items-end gap-2">
        <ShellButton onClick={() => setShowGallery(true)} label="Gallery">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="16" height="16" rx="2" />
            <path d="M2 13l4-4 3 3 4-4 5 5" />
          </svg>
        </ShellButton>
        <ShellButton onClick={() => setShowDraw(true)} label="Draw a lobster">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="11" y1="4" x2="11" y2="18" />
            <line x1="4" y1="11" x2="18" y2="11" />
          </svg>
        </ShellButton>
        <ShellButton onClick={() => setShowInfo(true)} label="Info">
          <span className="text-xl font-bold leading-none" style={{ fontFamily: "'Caveat', cursive" }}>?</span>
        </ShellButton>
      </div>

      {showDraw && (
        <DrawModal
          onSubmit={handleSubmit}
          onClose={() => setShowDraw(false)}
        />
      )}

      {showInfo && (
        <InfoModal
          onClose={() => setShowInfo(false)}
          onAmnesty={handleAmnesty}
          lobsterCount={activeLobsters.length}
          removedCount={removedCount}
        />
      )}

      {showGallery && (
        <GalleryModal
          lobsters={allLobsters}
          onClose={() => setShowGallery(false)}
        />
      )}
    </>
  )
}
