import { createServerFn } from '@tanstack/react-start'
import type { UserProfile } from '@/types'

export interface LeaderboardEntry {
  rank: number
  username: string
  name: string
  avatarUrl: string
  score: number
  grade: string
  searchCount: number
}

// Helper to access Deno KV safely
const getKv = async () => {
  // @ts-ignore - Deno global is available in Deno environment
  if (typeof Deno === 'undefined') {
    throw new Error('Deno KV is only available in Deno environment')
  }
  // @ts-ignore
  return await Deno.openKv()
}

export const saveProfileToLeaderboard = createServerFn({ method: 'POST' }).handler(
  async (ctx: any) => {
    const { data } = ctx
    try {
      const kv = await getKv()
      const profile = data as UserProfile
      const key = ['leaderboard', profile.username]

      // Check if exists to update search count
      const existing = await kv.get(key)
      let searchCount = 1
      if (existing.value) {
        searchCount = (existing.value as any).searchCount + 1
      }

      const entry = {
        username: profile.username,
        name: profile.fullName,
        avatarUrl: profile.avatarUrl,
        score: profile.rating.score,
        grade: profile.rating.grade,
        searchCount,
        updatedAt: Date.now(),
      }

      await kv.set(key, entry)
      return { success: true }
    } catch (err) {
      console.error('Leaderboard save error:', err)
      return { success: false }
    }
  },
)

export const getLeaderboardData = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const kv = await getKv()
      const entries: any[] = []
      // Fetch all entries
      const iter = kv.list({ prefix: ['leaderboard'] })
      for await (const res of iter) {
        entries.push(res.value)
      }

      // Sort by score desc, then searchCount desc
      entries.sort((a: any, b: any) => {
        if (b.score !== a.score) return b.score - a.score
        return b.searchCount - a.searchCount
      })

      // Add rank and limit to top 50
      return entries.slice(0, 50).map((e, i) => ({ ...e, rank: i + 1 }))
    } catch (err) {
      console.error('Leaderboard fetch error:', err)
      return []
    }
  },
)
