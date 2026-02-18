import { describe, it, expect, beforeEach } from 'vitest'
import { getLobsters, addLobster, removeLobster, amnesty, getActiveLobsters, setStorage } from './lobster-store'
import type { Stroke, Storage } from './types'

const mockStrokes: Stroke[] = [
  { points: [{ x: 0, y: 0 }, { x: 10, y: 10 }], color: '#000', size: 3 },
]

function createMockStorage(): Storage {
  const data: Record<string, string> = {}
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => { data[key] = value },
    removeItem: (key: string) => { delete data[key] },
  }
}

describe('lobster-store', () => {
  beforeEach(() => {
    setStorage(createMockStorage())
  })

  it('returns empty array when no lobsters stored', () => {
    expect(getLobsters()).toEqual([])
  })

  it('adds a lobster and retrieves it', () => {
    const lobster = addLobster({
      tail: mockStrokes,
      leftClaw: mockStrokes,
      rightClaw: mockStrokes,
    })

    expect(lobster.id).toBeDefined()
    expect(lobster.tail).toEqual(mockStrokes)
    expect(lobster.removed).toBe(false)
    expect(lobster.createdAt).toBeGreaterThan(0)

    const all = getLobsters()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe(lobster.id)
  })

  it('adds multiple lobsters', () => {
    addLobster({ tail: mockStrokes, leftClaw: [], rightClaw: [] })
    addLobster({ tail: [], leftClaw: mockStrokes, rightClaw: [] })

    expect(getLobsters()).toHaveLength(2)
  })

  it('soft-deletes a lobster with removeLobster', () => {
    const lobster = addLobster({ tail: mockStrokes, leftClaw: [], rightClaw: [] })
    removeLobster(lobster.id)

    const all = getLobsters()
    expect(all).toHaveLength(1)
    expect(all[0].removed).toBe(true)
  })

  it('getActiveLobsters excludes removed lobsters', () => {
    const lobster1 = addLobster({ tail: mockStrokes, leftClaw: [], rightClaw: [] })
    addLobster({ tail: [], leftClaw: mockStrokes, rightClaw: [] })

    removeLobster(lobster1.id)

    const active = getActiveLobsters()
    expect(active).toHaveLength(1)
    expect(active[0].removed).toBe(false)
  })

  it('amnesty restores all removed lobsters', () => {
    const lobster1 = addLobster({ tail: mockStrokes, leftClaw: [], rightClaw: [] })
    const lobster2 = addLobster({ tail: [], leftClaw: mockStrokes, rightClaw: [] })

    removeLobster(lobster1.id)
    removeLobster(lobster2.id)

    expect(getActiveLobsters()).toHaveLength(0)

    amnesty()

    expect(getActiveLobsters()).toHaveLength(2)
    expect(getLobsters().every(l => !l.removed)).toBe(true)
  })

  it('handles corrupted localStorage gracefully', () => {
    const badStorage = createMockStorage()
    badStorage.setItem('draw-lobster:lobsters', 'not-json')
    setStorage(badStorage)
    expect(getLobsters()).toEqual([])
  })
})
