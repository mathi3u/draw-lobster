import { describe, it, expect, vi } from 'vitest'
import { createStroke, addPoint, undoLastStroke, renderStrokes, isCanvasEmpty } from './drawing'
import type { Stroke } from './types'

describe('drawing', () => {
  describe('createStroke', () => {
    it('creates a stroke with empty points', () => {
      const stroke = createStroke('#ff0000', 5)
      expect(stroke.points).toEqual([])
      expect(stroke.color).toBe('#ff0000')
      expect(stroke.size).toBe(5)
    })
  })

  describe('addPoint', () => {
    it('appends a point to the stroke', () => {
      const stroke = createStroke('#000', 3)
      const updated = addPoint(stroke, { x: 10, y: 20 })
      expect(updated.points).toHaveLength(1)
      expect(updated.points[0]).toEqual({ x: 10, y: 20 })
    })

    it('appends multiple points', () => {
      let stroke = createStroke('#000', 3)
      stroke = addPoint(stroke, { x: 0, y: 0 })
      stroke = addPoint(stroke, { x: 5, y: 5 })
      stroke = addPoint(stroke, { x: 10, y: 10 })
      expect(stroke.points).toHaveLength(3)
    })

    it('does not mutate the original stroke', () => {
      const stroke = createStroke('#000', 3)
      const updated = addPoint(stroke, { x: 10, y: 20 })
      expect(stroke.points).toHaveLength(0)
      expect(updated.points).toHaveLength(1)
    })
  })

  describe('undoLastStroke', () => {
    it('removes the last stroke', () => {
      const strokes: Stroke[] = [
        { points: [{ x: 0, y: 0 }], color: '#000', size: 3 },
        { points: [{ x: 1, y: 1 }], color: '#f00', size: 5 },
      ]
      const result = undoLastStroke(strokes)
      expect(result).toHaveLength(1)
      expect(result[0].color).toBe('#000')
    })

    it('returns empty array when undoing last remaining stroke', () => {
      const strokes: Stroke[] = [
        { points: [{ x: 0, y: 0 }], color: '#000', size: 3 },
      ]
      expect(undoLastStroke(strokes)).toEqual([])
    })

    it('returns empty array when already empty', () => {
      expect(undoLastStroke([])).toEqual([])
    })
  })

  describe('renderStrokes', () => {
    it('draws strokes to a canvas context', () => {
      const ctx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        lineWidth: 0,
        strokeStyle: '',
        lineCap: '' as CanvasLineCap,
        lineJoin: '' as CanvasLineJoin,
      } as unknown as CanvasRenderingContext2D

      const strokes: Stroke[] = [
        { points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 5 }], color: '#f00', size: 4 },
      ]

      renderStrokes(ctx, strokes)

      expect(ctx.beginPath).toHaveBeenCalled()
      expect(ctx.moveTo).toHaveBeenCalledWith(0, 0)
      expect(ctx.lineTo).toHaveBeenCalledWith(10, 10)
      expect(ctx.lineTo).toHaveBeenCalledWith(20, 5)
      expect(ctx.stroke).toHaveBeenCalled()
    })

    it('skips strokes with fewer than 2 points', () => {
      const ctx = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        lineWidth: 0,
        strokeStyle: '',
        lineCap: '' as CanvasLineCap,
        lineJoin: '' as CanvasLineJoin,
      } as unknown as CanvasRenderingContext2D

      const strokes: Stroke[] = [
        { points: [{ x: 0, y: 0 }], color: '#f00', size: 4 },
        { points: [], color: '#0f0', size: 2 },
      ]

      renderStrokes(ctx, strokes)

      expect(ctx.beginPath).not.toHaveBeenCalled()
    })
  })

  describe('isCanvasEmpty', () => {
    it('returns true when all layers are empty', () => {
      expect(isCanvasEmpty({ tail: [], leftClaw: [], rightClaw: [] })).toBe(true)
    })

    it('returns false when tail has strokes', () => {
      expect(isCanvasEmpty({
        tail: [{ points: [{ x: 0, y: 0 }], color: '#000', size: 3 }],
        leftClaw: [],
        rightClaw: [],
      })).toBe(false)
    })

    it('returns false when any claw layer has strokes', () => {
      expect(isCanvasEmpty({
        tail: [],
        leftClaw: [{ points: [{ x: 0, y: 0 }], color: '#000', size: 3 }],
        rightClaw: [],
      })).toBe(false)
    })
  })
})
