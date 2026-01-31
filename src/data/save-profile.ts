import { createServerFn } from '@tanstack/react-start'
import { supabase } from '../utils/supabase'
import type { UserProfile } from '../types'

export const saveProfile = createServerFn({ method: 'POST' })
  .inputValidator((data: UserProfile) => data)
  .handler(async ({ data }) => {
    try {
      // Upsert the profile into the Supabase 'profiles' table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          username: data.username,
          full_name: data.fullName,
          avatar_url: data.avatarUrl,
          score: data.rating.score,
          grade: data.rating.grade,
          raw_data: data, // Store the full unstructured data for flexibility
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error saving profile to Supabase:', error)
          return { success: true, error: "Internal error"}
      }

      return { success: true, error: {} }
    } catch (err) {
      console.error('Unexpected error in saveProfile:', err)
      return { success: true, error: {} }
    }
  })
