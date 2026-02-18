'use client'

interface InfoModalProps {
  onClose: () => void
  onAmnesty: () => void
  lobsterCount: number
  removedCount: number
}

export default function InfoModal({ onClose, onAmnesty, lobsterCount, removedCount }: InfoModalProps) {
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

        <h2 className="text-lg font-semibold mb-4">Draw me a lobster</h2>

        <div className="space-y-3 text-sm text-white/70">
          <p>
            Draw a lobster and release it into the ocean. Everyone sees everyone&apos;s lobsters.
          </p>

          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            <p><strong className="text-white/90">Click</strong> a lobster to make it jump</p>
            <p><strong className="text-white/90">Double-click</strong> to remove it</p>
          </div>

          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            <p className="text-xs text-white/40">
              {lobsterCount} active lobster{lobsterCount !== 1 ? 's' : ''}
              {removedCount > 0 && ` / ${removedCount} removed`}
            </p>
            <p className="text-xs text-white/30">
              Made by mathi3u. Inspired by{' '}
              <a href="https://gradient.horse" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/50">gradient.horse</a>
            </p>
          </div>
        </div>

        {removedCount > 0 && (
          <button
            onClick={() => {
              onAmnesty()
              onClose()
            }}
            className="w-full mt-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
          >
            Lobster amnesty ({removedCount})
          </button>
        )}
      </div>
    </div>
  )
}
