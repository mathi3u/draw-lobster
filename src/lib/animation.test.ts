import { describe, it, expect } from 'vitest'
import {
  initRunningLobster,
  updateLobster,
  triggerJump,
  getFloorY,
} from './animation'
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

describe('animation', () => {
  describe('getFloorY', () => {
    it('returns floor position in the lower portion of the screen', () => {
      const floorY = getFloorY(H)
      expect(floorY).toBeGreaterThan(H * 0.7)
      expect(floorY).toBeLessThan(H * 0.95)
    })
  })

  describe('initRunningLobster', () => {
    it('creates a lobster within the canvas width', () => {
      const lobster = initRunningLobster(mockDrawing, W, H)
      expect(lobster.x).toBeGreaterThanOrEqual(0)
      expect(lobster.x).toBeLessThanOrEqual(W)
      expect(lobster.speed).toBeGreaterThan(0)
      expect(lobster.jumpHeight).toBe(0)
    })
  })

  describe('updateLobster', () => {
    it('increases x over time (moves right)', () => {
      const lobster = initRunningLobster(mockDrawing, W, H)
      const updated = updateLobster(lobster, 1 / 60, W, H)
      expect(updated.x).toBeGreaterThan(lobster.x)
    })

    it('wraps around when exiting the right side', () => {
      const lobster = {
        ...initRunningLobster(mockDrawing, W, H),
        x: W + 100, // past the right edge
      }
      const updated = updateLobster(lobster, 1 / 60, W, H)
      expect(updated.x).toBeLessThan(0)
    })

    it('advances leg phase', () => {
      const lobster = initRunningLobster(mockDrawing, W, H)
      const updated = updateLobster(lobster, 0.1, W, H)
      expect(updated.legPhase).not.toBe(lobster.legPhase)
    })
  })

  describe('triggerJump', () => {
    it('sets positive jump velocity when on ground', () => {
      const lobster = initRunningLobster(mockDrawing, W, H)
      const jumping = triggerJump(lobster)
      expect(jumping.jumpVelocity).toBeGreaterThan(0)
      expect(jumping.jumpHeight).toBeGreaterThan(0)
    })

    it('does not double-jump', () => {
      const lobster = initRunningLobster(mockDrawing, W, H)
      const jumping = triggerJump(lobster)
      const vel = jumping.jumpVelocity
      const doubleJump = triggerJump(jumping)
      expect(doubleJump.jumpVelocity).toBe(vel)
    })

    it('lobster returns to ground after jump cycle', () => {
      let lobster = initRunningLobster(mockDrawing, W, H)
      lobster = triggerJump(lobster)

      for (let i = 0; i < 120; i++) {
        lobster = updateLobster(lobster, 1 / 60, W, H)
      }

      expect(lobster.jumpHeight).toBe(0)
      expect(lobster.jumpVelocity).toBe(0)
    })
  })
})
