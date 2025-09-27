import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get recent calls
    const recentCalls = await prisma.call.findMany({
      include: {
        user: true,
        escalation: { include: { counselor: true } }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    })

    // Get mood trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const moodEntries = await prisma.moodEntry.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' }
    })

    // Group by date
    const moodTrends = moodEntries.reduce((acc, entry) => {
      const date = entry.date.toISOString().split('T')[0]
      if (!acc[date]) acc[date] = { total: 0, count: 0 }
      acc[date].total += entry.mood
      acc[date].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const trends = Object.entries(moodTrends).map(([date, { total, count }]) => ({
      date,
      averageMood: total / count
    }))

    // Get escalations
    const escalations = await prisma.escalation.findMany({
      include: { call: { include: { user: true } }, counselor: true },
      orderBy: { escalatedAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      recentCalls,
      moodTrends: trends,
      escalations
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}