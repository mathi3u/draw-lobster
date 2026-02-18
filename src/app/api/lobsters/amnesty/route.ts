import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  await db.execute('UPDATE lobsters SET removed = 0')
  return NextResponse.json({ ok: true })
}
