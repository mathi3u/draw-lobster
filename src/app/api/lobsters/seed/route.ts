import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const sampleLobsters = [
  {
    name: 'big',
    tail: [
      // Body oval
      { points: ovalPath(140, 130, 55, 30), color: '#ff6633', size: 4 },
      // Tail segments
      { points: [{ x: 85, y: 130 }, { x: 65, y: 125 }, { x: 50, y: 135 }, { x: 40, y: 120 }], color: '#ff6633', size: 3 },
      // Tail fan
      { points: ovalPath(35, 115, 15, 8), color: '#ff6633', size: 2 },
      // Eye
      { points: [{ x: 195, y: 118 }, { x: 196, y: 118 }], color: '#ff6633', size: 5 },
      // Antennae
      { points: [{ x: 195, y: 110 }, { x: 220, y: 85 }, { x: 240, y: 80 }], color: '#ff6633', size: 1.5 },
      { points: [{ x: 195, y: 115 }, { x: 225, y: 95 }, { x: 250, y: 92 }], color: '#ff6633', size: 1.5 },
      // Legs
      { points: [{ x: 120, y: 155 }, { x: 115, y: 190 }], color: '#ff6633', size: 2 },
      { points: [{ x: 140, y: 157 }, { x: 138, y: 192 }], color: '#ff6633', size: 2 },
      { points: [{ x: 160, y: 155 }, { x: 162, y: 190 }], color: '#ff6633', size: 2 },
    ],
    leftClaw: [
      { points: [{ x: 185, y: 125 }, { x: 210, y: 140 }], color: '#ff9999', size: 3 },
      { points: ovalPath(220, 145, 18, 10), color: '#ff9999', size: 3 },
      { points: [{ x: 230, y: 138 }, { x: 245, y: 130 }], color: '#ff9999', size: 2 },
      { points: [{ x: 230, y: 152 }, { x: 245, y: 158 }], color: '#ff9999', size: 2 },
    ],
    rightClaw: [
      { points: [{ x: 185, y: 135 }, { x: 210, y: 155 }], color: '#99bbff', size: 3 },
      { points: ovalPath(220, 160, 18, 10), color: '#99bbff', size: 3 },
      { points: [{ x: 230, y: 153 }, { x: 245, y: 148 }], color: '#99bbff', size: 2 },
      { points: [{ x: 230, y: 167 }, { x: 245, y: 172 }], color: '#99bbff', size: 2 },
    ],
  },
  {
    name: 'slim',
    tail: [
      { points: ovalPath(140, 130, 45, 22), color: '#ff6633', size: 3 },
      { points: [{ x: 95, y: 130 }, { x: 75, y: 128 }, { x: 60, y: 135 }], color: '#ff6633', size: 2 },
      { points: [{ x: 186, y: 120 }, { x: 187, y: 120 }], color: '#ff6633', size: 4 },
      { points: [{ x: 186, y: 112 }, { x: 205, y: 90 }], color: '#ff6633', size: 1 },
      { points: [{ x: 186, y: 115 }, { x: 210, y: 100 }], color: '#ff6633', size: 1 },
      { points: [{ x: 125, y: 150 }, { x: 122, y: 190 }], color: '#ff6633', size: 1.5 },
      { points: [{ x: 145, y: 150 }, { x: 148, y: 190 }], color: '#ff6633', size: 1.5 },
    ],
    leftClaw: [
      { points: [{ x: 175, y: 122 }, { x: 200, y: 132 }], color: '#ff9999', size: 2 },
      { points: ovalPath(210, 135, 12, 7), color: '#ff9999', size: 2 },
    ],
    rightClaw: [
      { points: [{ x: 175, y: 135 }, { x: 200, y: 148 }], color: '#99bbff', size: 2 },
      { points: ovalPath(210, 152, 12, 7), color: '#99bbff', size: 2 },
    ],
  },
  {
    name: 'baby',
    tail: [
      { points: ovalPath(150, 140, 30, 20), color: '#ff6633', size: 4 },
      { points: [{ x: 120, y: 140 }, { x: 105, y: 138 }], color: '#ff6633', size: 3 },
      { points: [{ x: 180, y: 132 }, { x: 181, y: 132 }], color: '#ff6633', size: 6 },
      { points: [{ x: 178, y: 125 }, { x: 190, y: 110 }], color: '#ff6633', size: 1.5 },
      { points: [{ x: 140, y: 158 }, { x: 138, y: 185 }], color: '#ff6633', size: 2 },
      { points: [{ x: 155, y: 158 }, { x: 157, y: 185 }], color: '#ff6633', size: 2 },
    ],
    leftClaw: [
      { points: [{ x: 172, y: 133 }, { x: 192, y: 140 }], color: '#ff9999', size: 3 },
      { points: ovalPath(198, 142, 10, 7), color: '#ff9999', size: 2 },
    ],
    rightClaw: [
      { points: [{ x: 172, y: 145 }, { x: 192, y: 155 }], color: '#99bbff', size: 3 },
      { points: ovalPath(198, 158, 10, 7), color: '#99bbff', size: 2 },
    ],
  },
]

function ovalPath(cx: number, cy: number, rx: number, ry: number, steps = 20) {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    points.push({
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    })
  }
  return points
}

export async function POST() {
  const existing = await db.execute('SELECT COUNT(*) as count FROM lobsters')
  const count = existing.rows[0].count as number

  if (count > 0) {
    return NextResponse.json({ seeded: false, message: 'Database already has lobsters' })
  }

  for (const l of sampleLobsters) {
    const id = crypto.randomUUID()
    await db.execute({
      sql: 'INSERT INTO lobsters (id, tail, left_claw, right_claw, created_at, removed) VALUES (?, ?, ?, ?, ?, 0)',
      args: [id, JSON.stringify(l.tail), JSON.stringify(l.leftClaw), JSON.stringify(l.rightClaw), Date.now()],
    })
  }

  return NextResponse.json({ seeded: true, count: sampleLobsters.length })
}
