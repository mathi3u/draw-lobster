import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { LobsterDrawing, Stroke } from '@/lib/types'

export async function GET() {
  const result = await db.execute('SELECT * FROM lobsters ORDER BY created_at ASC')

  const lobsters: LobsterDrawing[] = result.rows.map(row => ({
    id: row.id as string,
    tail: JSON.parse(row.tail as string) as Stroke[],
    leftClaw: JSON.parse(row.left_claw as string) as Stroke[],
    rightClaw: JSON.parse(row.right_claw as string) as Stroke[],
    createdAt: row.created_at as number,
    removed: (row.removed as number) === 1,
  }))

  return NextResponse.json(lobsters)
}

export async function POST(request: Request) {
  const { tail, leftClaw, rightClaw } = await request.json()

  const id = crypto.randomUUID()
  const createdAt = Date.now()

  await db.execute({
    sql: 'INSERT INTO lobsters (id, tail, left_claw, right_claw, created_at, removed) VALUES (?, ?, ?, ?, ?, 0)',
    args: [id, JSON.stringify(tail), JSON.stringify(leftClaw), JSON.stringify(rightClaw), createdAt],
  })

  const lobster: LobsterDrawing = {
    id,
    tail,
    leftClaw,
    rightClaw,
    createdAt,
    removed: false,
  }

  return NextResponse.json(lobster, { status: 201 })
}
