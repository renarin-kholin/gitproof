import {
  TrendingUp,
  Flame,
  GitPullRequest,
  Star,
  Activity,
} from 'lucide-react'
import type { UserProfile } from '@/types'

interface OverviewTabProps {
  profile: UserProfile
}

export function OverviewTab({ profile }: OverviewTabProps) {
  const { metrics } = profile

  const statCards = [
    {
      label: 'Total Stars',
      value: profile.totalStars || 0,
      icon: <Star className="w-4 h-4" />,
      color: 'text-yellow-500 bg-yellow-50',
    },
    {
      label: 'Contributions',
      value: profile.totalContributions || 0,
      icon: <GitPullRequest className="w-4 h-4" />,
      color: 'text-green-500 bg-green-50',
    },
    {
      label: 'Longest Streak',
      value: `${profile.longestStreak || 0} days`,
      icon: <Flame className="w-4 h-4" />,
      color: 'text-orange-500 bg-orange-50',
    },
    {
      label: 'Top Repo Stars',
      value: profile.topRepo?.stars || 0,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-blue-500 bg-blue-50',
    },
  ]

  const metricEntries = Object.entries(metrics)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      {profile.summary && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">AI Summary</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {profile.summary}
          </p>
        </div>
      )}

      {/* KCRIM Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">📊</span> PRIME Score
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Productivity, Reliability, Impact, Mastery, Endurance
          </p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {metricEntries.map(([key, metric]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {metric.label}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {metric.value.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-600 to-gray-900 rounded-full transition-all duration-500"
                    style={{ width: `${metric.value * 10}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Repository */}
      {profile.topRepo && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> Top Repository
          </h3>
          <a
            href={profile.topRepo.url}
            target="_blank"
            rel="noreferrer"
            className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-gray-900">
                {profile.topRepo.name}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Star size={14} className="text-yellow-500" />
                {profile.topRepo.stars.toLocaleString()}
              </span>
            </div>
          </a>
        </div>
      )}

      {/* Scanned Date */}
      <div className="text-center text-xs text-gray-400">
        Last scanned: {profile.lastScanned}
      </div>
    </div>
  )
}
