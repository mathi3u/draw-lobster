import type { LobsterDrawing } from './types'

export interface RunningLobster {
  drawing: LobsterDrawing
  x: number
  speed: number
  legPhase: number
  jumpVelocity: number
  jumpHeight: number
}

export const LOBSTER_WIDTH = 80
export const LOBSTER_HEIGHT = 64
export const DRAWING_WIDTH = 300
export const DRAWING_HEIGHT = 240

const BASE_SPEED = 40 // pixels per second
const SPEED_VARIANCE = 15
const GRAVITY = 400
const JUMP_VELOCITY = 180

/** Floor Y position (flat ocean floor) */
export function getFloorY(h: number): number {
  return h * 0.82
}

export function initRunningLobster(
  drawing: LobsterDrawing,
  canvasWidth: number,
  canvasHeight: number,
): RunningLobster {
  const speed = BASE_SPEED + (Math.random() - 0.5) * SPEED_VARIANCE * 2
  const x = Math.random() * canvasWidth

  return {
    drawing,
    x,
    speed,
    legPhase: Math.random(),
    jumpVelocity: 0,
    jumpHeight: 0,
  }
}

export function updateLobster(
  lobster: RunningLobster,
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number,
): RunningLobster {
  let { x, legPhase, jumpVelocity, jumpHeight } = lobster

  // Move horizontally (left to right)
  x += lobster.speed * deltaTime

  // Wrap around: re-enter from the left
  if (x > canvasWidth + LOBSTER_WIDTH) {
    x = -LOBSTER_WIDTH
  }

  // Leg animation
  legPhase = (legPhase + deltaTime * 3) % 1

  // Jump physics
  if (jumpVelocity !== 0 || jumpHeight > 0) {
    jumpHeight += jumpVelocity * deltaTime
    jumpVelocity -= GRAVITY * deltaTime
    if (jumpHeight <= 0) {
      jumpHeight = 0
      jumpVelocity = 0
    }
  }

  return { ...lobster, x, legPhase, jumpVelocity, jumpHeight }
}

export function triggerJump(lobster: RunningLobster): RunningLobster {
  if (lobster.jumpHeight > 0) return lobster
  return { ...lobster, jumpVelocity: JUMP_VELOCITY, jumpHeight: 0.1 }
}
