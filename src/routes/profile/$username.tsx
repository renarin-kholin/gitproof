import { createFileRoute, useSearch, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { z } from 'zod'
import { useGSAP } from '@gsap/react'
import { Sidebar, type DashboardTabId } from '@/components/dashboard/Sidebar'
import { ProfileHeader } from '@/components/dashboard/ProfileHeader'
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab'
import { ProofOfWorkTab } from '@/components/dashboard/tabs/ProofOfWorkTab'
import { LanguagesTab } from '@/components/dashboard/tabs/LanguagesTab'
import { TechStacksTab } from '@/components/dashboard/tabs/TechStacksTab'
import { ReposTab } from '@/components/dashboard/tabs/ReposTab'
import type { UserProfile } from '@/types'

const searchSchema = z.object({
  tab: z.enum(['overview', 'pow', 'languages', 'stacks', 'repos']).optional().catch('overview'),
})

export const Route = createFileRoute('/profile/$username')({
  validateSearch: searchSchema,
  component: DashboardPage,
  loader: async ({ params }) => {
    try {
      const username = params.username
      
      // 1. Fetch raw data from GitHub
      const { fetchGitHubData } = await import('@/services/github')
      const ghData = await fetchGitHubData(username)
      
      // 2. Analyze with Gemini (Service now uses deterministic scoring)
      const { analyzeProfileWithGemini } = await import('@/services/gemini')
      const profile = await analyzeProfileWithGemini(ghData)

      // 3. Save to leaderboard (fire and forget async)
      const { saveProfileToLeaderboard } = await import('@/services/leaderboard')
      await saveProfileToLeaderboard({ data: profile } as any)
      
      return profile
    } catch (error) {
      console.error('Failed to load profile:', error)
      // Return a basic error profile or throw to be caught by an ErrorBoundary
      // For now, let's just re-throw to let TanStack Router handle it
      throw error
    }
  },
})

function DashboardPage() {
  const profile = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })
  const { tab } = useSearch({ from: Route.fullPath })
  const activeTab = (tab || 'overview') as DashboardTabId

  const [searchQuery, setSearchQuery] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  // GSAP tab transition animation
  useGSAP(
    () => {
      if (contentRef.current) {
        contentRef.current.style.opacity = '1'
        contentRef.current.style.transform = 'translateY(0)'
      }
    },
    { dependencies: [activeTab] },
  )

  const handleTabChange = (newTab: DashboardTabId) => {
    navigate({
      search: { tab: newTab },
    })
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab profile={profile} />
      case 'pow':
        return (
          <ProofOfWorkTab
            activities={profile.recentActivity || []}
            searchQuery={searchQuery}
          />
        )
      case 'languages':
        return <LanguagesTab techStack={profile.techStack} />
      case 'stacks':
        return <TechStacksTab techStack={profile.techStack} />
      case 'repos':
        return <ReposTab repos={profile.repos || []} searchQuery={searchQuery} />
      default:
        return <OverviewTab profile={profile} />
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <Sidebar
        profile={profile}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Profile Header */}
          <ProfileHeader profile={profile} />

          {/* Tab Content */}
          <div ref={contentRef} className="mt-8">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  )
}
