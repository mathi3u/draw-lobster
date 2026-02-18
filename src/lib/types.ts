export interface Point {
  x: number
  y: number
}

export interface Stroke {
  points: Point[]
  color: string
  size: number
}

export interface LobsterDrawing {
  id: string
  tail: Stroke[]
  leftClaw: Stroke[]
  rightClaw: Stroke[]
  createdAt: number
  removed: boolean
}

export interface Storage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
