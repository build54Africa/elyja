import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock counselor ID - in real app, get from auth
const COUNSELOR_ID = 'counselor-1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { available } = body

    const status = available ? 'available' : 'offline'

    await prisma.user.update({
      where: { id: COUNSELOR_ID },
      data: { status }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Availability update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}