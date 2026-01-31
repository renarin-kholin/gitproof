import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef } from 'react'
import {
  LayoutDashboard,
  Trophy,
  Sparkles,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { Logo } from '@/components/ui/Logo'
import type { UserProfile } from '@/types'

export const Route = createFileRoute('/compare/$user1/$user2')({
  component: CompareResultPage,
  loader: async ({ params }) => {
    try {
      const { user1: u1, user2: u2 } = params
      
      // 1. Fetch raw data for both users (parallel)
      const { fetchGitHubData } = await import('@/services/github')
      const [ghData1, ghData2] = await Promise.all([
        fetchGitHubData(u1),
        fetchGitHubData(u2)
      ])
      
      // 2. Analyze both profiles (parallel)
      const { analyzeProfileWithGemini, compareProfilesWithGemini } = await import('@/services/gemini')
      const [profile1, profile2] = await Promise.all([
        analyzeProfileWithGemini(ghData1),
        analyzeProfileWithGemini(ghData2)
      ])
      
      // 3. Compare profiles
      const result = await compareProfilesWithGemini(profile1, profile2)
      
      return result
    } catch (error) {
      console.error('Comparison failed:', error)
      throw error
    }
  },
})

function CompareResultPage() {
  const result = Route.useLoaderData()
  const { user1, user2, analysis } = result

  const contentRef = useRef<HTMLDivElement>(null)

  // GSAP entrance animation using CSS transitions
  useGSAP(() => {
    if (contentRef.current) {
      Array.from(contentRef.current.children).forEach((child, i) => {
        setTimeout(() => {
          ;(child as HTMLElement).style.opacity = '1'
          ;(child as HTMLElement).style.transform = 'translateY(0)'
        }, i * 100)
      })
    }
  }, [])

  const getWinner = (
    val1: number,
    val2: number,
    u1: string,
    u2: string,
  ): string | 'Tie' => {
    if (val1 > val2) return u1
    if (val2 > val1) return u2
    return 'Tie'
  }

  const renderMetricRow = (
    label: string,
    val1: string | number,
    val2: string | number,
    winner: string,
  ) => (
    <div
      key={label}
      className="grid grid-cols-4 py-4 border-b border-gray-100 last:border-0 items-center"
    >
      <div className="col-span-1 text-sm font-medium text-gray-600">{label}</div>
      <div className="col-span-1 font-bold text-gray-900">{val1}</div>
      <div className="col-span-1 font-bold text-gray-900">{val2}</div>
      <div className="col-span-1 text-right">
        {winner === 'Tie' ? (
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Tie
          </span>
        ) : (
          <span className="text-xs font-semibold text-white px-2 py-1 rounded bg-black">
            {winner}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-2 text-gray-600">
            <Link
              to="/compare"
              className="hover:text-gray-900 flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <span className="text-gray-300 hidden sm:inline">/</span>
            <span className="text-sm font-semibold flex items-center gap-2 text-gray-900">
              <LayoutDashboard className="w-4 h-4" /> Comparison
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500 font-medium hidden sm:block">
          @{user1.username} <span className="mx-2 text-gray-300">vs</span> @
          {user2.username}
        </div>
      </div>

      <main ref={contentRef} className="flex-1 max-w-7xl mx-auto w-full p-8">
        {/* AI Analysis Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-gray-900 text-lg">AI Analysis</h2>
            <span className="text-xs text-gray-400 ml-auto">
              Autonomous developer comparison
            </span>
          </div>

          {/* Profile Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* User 1 Card */}
            <ProfileCard
              user={user1}
              isWinner={analysis.winnerUsername === user1.username}
            />

            {/* User 2 Card */}
            <ProfileCard
              user={user2}
              isWinner={analysis.winnerUsername === user2.username}
            />
          </div>

          {/* AI Reasoning */}
          <div className="bg-[#ECFDF5] border border-emerald-100 rounded-lg p-5 mb-6">
            <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <Trophy size={16} /> {analysis.headline}
            </h4>
            <p className="text-xs text-emerald-600 mb-2 opacity-75">
              Based on autonomous AI analysis of GitHub profiles
            </p>
            <p className="text-sm text-emerald-900 leading-relaxed opacity-90">
              <span className="font-semibold">AI Reasoning:</span> <br />
              {analysis.reasoning}
            </p>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Sparkles size={14} /> Key Insights
            </h4>
            <ul className="space-y-2">
              {analysis.insights.map((insight, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-emerald-500"
                >
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Comparison Tables */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6">Profile Overview</h3>

          <div className="grid grid-cols-4 py-2 border-b border-gray-200 mb-2">
            <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
              Metric
            </div>
            <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
              {user1.username}
            </div>
            <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
              {user2.username}
            </div>
            <div className="col-span-1 text-xs font-bold text-gray-400 uppercase text-right">
              Winner
            </div>
          </div>

          {renderMetricRow(
            'Account Age',
            `${user1.yearsOnGithub} years`,
            `${user2.yearsOnGithub} years`,
            getWinner(
              user1.yearsOnGithub,
              user2.yearsOnGithub,
              user1.username,
              user2.username,
            ),
          )}
          {renderMetricRow(
            'Repositories',
            user1.repositories,
            user2.repositories,
            getWinner(
              user1.repositories,
              user2.repositories,
              user1.username,
              user2.username,
            ),
          )}
          {renderMetricRow(
            'Followers',
            user1.followers,
            user2.followers,
            getWinner(
              user1.followers,
              user2.followers,
              user1.username,
              user2.username,
            ),
          )}
          {renderMetricRow(
            'Total Stars',
            user1.totalStars || 0,
            user2.totalStars || 0,
            getWinner(
              user1.totalStars || 0,
              user2.totalStars || 0,
              user1.username,
              user2.username,
            ),
          )}

          <div className="mt-12">
            <h3 className="font-bold text-gray-900 mb-6">
              Overall Open Source Contributions
            </h3>
            <div className="grid grid-cols-4 py-2 border-b border-gray-200 mb-2">
              <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
                Stats
              </div>
              <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
                {user1.username}
              </div>
              <div className="col-span-1 text-xs font-bold text-gray-400 uppercase">
                {user2.username}
              </div>
              <div className="col-span-1 text-xs font-bold text-gray-400 uppercase text-right">
                Stronger
              </div>
            </div>

            {renderMetricRow(
              'Productivity',
              user1.metrics.productivity.value,
              user2.metrics.productivity.value,
              getWinner(
                user1.metrics.productivity.value,
                user2.metrics.productivity.value,
                user1.username,
                user2.username,
              ),
            )}
            {renderMetricRow(
              'Reliability',
              user1.metrics.reliability.value,
              user2.metrics.reliability.value,
              getWinner(
                user1.metrics.reliability.value,
                user2.metrics.reliability.value,
                user1.username,
                user2.username,
              ),
            )}
            {renderMetricRow(
              'Impact',
              user1.metrics.impact.value,
              user2.metrics.impact.value,
              getWinner(
                user1.metrics.impact.value,
                user2.metrics.impact.value,
                user1.username,
                user2.username,
              ),
            )}
            {renderMetricRow(
              'Mastery',
              user1.metrics.mastery.value,
              user2.metrics.mastery.value,
              getWinner(
                user1.metrics.mastery.value,
                user2.metrics.mastery.value,
                user1.username,
                user2.username,
              ),
            )}
            {renderMetricRow(
              'Endurance',
              user1.metrics.endurance.value,
              user2.metrics.endurance.value,
              getWinner(
                user1.metrics.endurance.value,
                user2.metrics.endurance.value,
                user1.username,
                user2.username,
              ),
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Profile Card sub-component
function ProfileCard({
  user,
  isWinner,
}: {
  user: UserProfile
  isWinner: boolean
}) {
  return (
    <div
      className={`border rounded-lg p-5 flex items-center justify-between transition-colors ${
        isWinner
          ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <img
          src={user.avatarUrl}
          alt={user.username}
          className="w-14 h-14 rounded-full border border-gray-200"
        />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-lg">{user.fullName}</h3>
            {isWinner && (
              <span className="text-[10px] font-bold bg-[#FDE047] text-yellow-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Trophy size={10} /> Top Choice
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">
              {user.rating.score}
            </span>
            <span
              className={`text-xs font-bold px-1.5 rounded ${
                user.rating.grade === 'S' || user.rating.grade === 'A'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {user.rating.grade}
            </span>
          </div>
        </div>
      </div>
      <a
        href={`https://github.com/${user.username}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded px-3 py-1.5 flex items-center gap-1 bg-white transition-colors"
      >
        View <ExternalLink size={12} />
      </a>
    </div>
  )
}
