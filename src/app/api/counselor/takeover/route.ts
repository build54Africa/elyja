import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock counselor ID - in real app, get from auth
const COUNSELOR_ID = 'counselor-1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { callId } = body

    // Update call to assign to counselor
    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: {
        status: 'counselor_assigned',
        assignedCounselorId: COUNSELOR_ID
      },
      include: {
        user: { select: { phone: true } }
      }
    })

    // Set counselor status to busy
    await prisma.user.update({
      where: { id: COUNSELOR_ID },
      data: { status: 'busy' }
    })

    // In a real implementation, you might need to:
    // 1. Notify Twilio to transfer the call
    // 2. Update the call status in Twilio
    // 3. Send counselor the call details

    return NextResponse.json({
      success: true,
      call: updatedCall
    })
  } catch (error) {
    console.error('Takeover error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}