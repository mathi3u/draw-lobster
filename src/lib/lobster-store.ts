import type { LobsterDrawing, Storage, Stroke } from './types'

const STORAGE_KEY = 'draw-lobster:lobsters'

let storage: Storage = typeof window !== 'undefined'
  ? window.localStorage
  : { getItem: () => null, setItem: () => {}, removeItem: () => {} }

export function setStorage(s: Storage): void {
  storage = s
}

function readStore(): LobsterDrawing[] {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as LobsterDrawing[]
  } catch {
    return []
  }
}

function writeStore(lobsters: LobsterDrawing[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(lobsters))
}

export function getLobsters(): LobsterDrawing[] {
  return readStore()
}

export function addLobster(drawing: {
  tail: Stroke[]
  leftClaw: Stroke[]
  rightClaw: Stroke[]
}): LobsterDrawing {
  const lobster: LobsterDrawing = {
    id: crypto.randomUUID(),
    tail: drawing.tail,
    leftClaw: drawing.leftClaw,
    rightClaw: drawing.rightClaw,
    createdAt: Date.now(),
    removed: false,
  }
  const all = readStore()
  all.push(lobster)
  writeStore(all)
  return lobster
}

export function removeLobster(id: string): void {
  const all = readStore()
  const lobster = all.find(l => l.id === id)
  if (lobster) {
    lobster.removed = true
    writeStore(all)
  }
}

export function amnesty(): void {
  const all = readStore()
  all.forEach(l => { l.removed = false })
  writeStore(all)
}

export function getActiveLobsters(): LobsterDrawing[] {
  return readStore().filter(l => !l.removed)
}
