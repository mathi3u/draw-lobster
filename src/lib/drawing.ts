import type { Point, Stroke } from './types'

export function createStroke(color: string, size: number): Stroke {
  return { points: [], color, size }
}

export function addPoint(stroke: Stroke, point: Point): Stroke {
  return { ...stroke, points: [...stroke.points, point] }
}

export function undoLastStroke(strokes: Stroke[]): Stroke[] {
  return strokes.slice(0, -1)
}

export function renderStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], colorOverride?: string): void {
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue
    ctx.beginPath()
    ctx.strokeStyle = colorOverride ?? stroke.color
    ctx.lineWidth = stroke.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }
    ctx.stroke()
  }
}

export function isCanvasEmpty(layers: {
  tail: Stroke[]
  leftClaw: Stroke[]
  rightClaw: Stroke[]
}): boolean {
  return layers.tail.length === 0
    && layers.leftClaw.length === 0
    && layers.rightClaw.length === 0
}
