import { describe, it, expect } from 'vitest'
import { hitTest } from './hit-detection'
import { initRunningLobster, getFloorY, LOBSTER_HEIGHT } from './animation'
import type { LobsterDrawing } from './types'

const mockDrawing: LobsterDrawing = {
  id: 'test-1',
  tail: [],
  leftClaw: [],
  rightClaw: [],
  createdAt: Date.now(),
  removed: false,
}

const W = 1920
const H = 1080

describe('hitTest', () => {
  it('returns true when clicking near lobster center', () => {
    const floorY = getFloorY(H)
    const lobster = {
      ...initRunningLobster(mockDrawing, W, H),
      x: 500,
    }
    const centerX = 500
    const centerY = floorY - LOBSTER_HEIGHT / 2
    expect(hitTest(centerX, centerY, lobster, H)).toBe(true)
  })

  it('returns false when clicking far from lobster', () => {
    const lobster = {
      ...initRunningLobster(mockDrawing, W, H),
      x: 500,
    }
    expect(hitTest(0, 0, lobster, H)).toBe(false)
  })

  it('accounts for jump height', () => {
    const floorY = getFloorY(H)
    const lobster = {
      ...initRunningLobster(mockDrawing, W, H),
      x: 500,
      jumpHeight: 80,
    }
    // Center when jumping
    const jumpCenterY = floorY - 80 - LOBSTER_HEIGHT / 2
    expect(hitTest(500, jumpCenterY, lobster, H)).toBe(true)

    // Original ground position should miss
    const groundCenterY = floorY - LOBSTER_HEIGHT / 2
    expect(hitTest(500, groundCenterY, lobster, H)).toBe(false)
  })
})
