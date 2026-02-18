import type { RunningLobster } from './animation'
import { getFloorY, LOBSTER_WIDTH, LOBSTER_HEIGHT } from './animation'

export function hitTest(
  clickX: number,
  clickY: number,
  lobster: RunningLobster,
  canvasHeight: number,
): boolean {
  const floorY = getFloorY(canvasHeight)
  const centerX = lobster.x
  const centerY = floorY - lobster.jumpHeight - LOBSTER_HEIGHT / 2
  const dx = clickX - centerX
  const dy = clickY - centerY
  const hitRadius = Math.max(LOBSTER_WIDTH, LOBSTER_HEIGHT) * 0.55
  return dx * dx + dy * dy <= hitRadius * hitRadius
}
