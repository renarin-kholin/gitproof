import { createServerFn } from '@tanstack/react-start'
import { supabase } from '@/utils/supabase'
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

// Separate handler logic for easier testing
export const saveToLeaderboardLogic = async (data: UserProfile) => {
  try {
    // 1. Check if profile exists to increment search_count
    const { data: existingData } = await supabase
      .from('profiles')
      .select('search_count')
      .eq('username', data.username)
      .single()

    const searchCount = existingData ? (existingData.search_count || 1) + 1 : 1

    // 2. Upsert profile with new search_count
    const { error } = await supabase
      .from('profiles')
      .upsert({
        username: data.username,
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        score: data.rating.score,
        grade: data.rating.grade,
        search_count: searchCount,
        raw_data: data,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Leaderboard save error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Leaderboard save unexpected error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export const saveProfileToLeaderboard = createServerFn({ method: 'POST' })
  .inputValidator((data: UserProfile) => data)
  .handler(async ({ data }) => {
    return saveToLeaderboardLogic(data)
  })

export const getLeaderboardData = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('score', { ascending: false })
        .order('search_count', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Supabase leaderboard fetch error:', error)
        return { success: false, error: {}, data: []}
      }

      // Map to LeaderboardEntry format
       
      return {success: true, error: {}, data: data.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        name: entry.full_name,
        avatarUrl: entry.avatar_url,
        score: entry.score,
        grade: entry.grade,
        searchCount: entry.search_count || 1,
      })) as LeaderboardEntry[]}

    } catch (err) {
      console.error('Leaderboard fetch error:', err)
      return { success: false, error: {}, data: []}
    }
  },
)
