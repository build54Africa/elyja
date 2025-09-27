import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock counselor ID - in real app, get from auth
const COUNSELOR_ID = 'counselor-1'

export async function GET() {
  try {
    // Get calls that are being handled by AI and could be taken over
    const aiCalls = await prisma.call.findMany({
      where: {
        status: 'ai_handling'
      },
      include: {
        user: {
          select: { phone: true, name: true }
        },
        conversation: {
          include: {
            messages: {
              orderBy: { timestamp: 'desc' },
              take: 5 // Last 5 messages for context
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    })

    // Get calls assigned to this counselor
    const assignedCalls = await prisma.call.findMany({
      where: {
        assignedCounselorId: COUNSELOR_ID,
        status: 'counselor_assigned'
      },
      include: {
        user: {
          select: { phone: true, name: true }
        },
        conversation: {
          include: {
            messages: {
              orderBy: { timestamp: 'desc' },
              take: 5
            }
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    })

    return NextResponse.json([...aiCalls, ...assignedCalls])
  } catch (error) {
    console.error('Calls fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}