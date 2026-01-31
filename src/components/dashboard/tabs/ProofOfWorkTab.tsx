import { useState } from 'react'
import { Search, Filter, ExternalLink, ChevronRight } from 'lucide-react'
import type { Activity } from '@/types'

interface ProofOfWorkTabProps {
  activities: Activity[]
  searchQuery: string
}

export function ProofOfWorkTab({ activities, searchQuery }: ProofOfWorkTabProps) {
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const typeLabels: Record<string, string> = {
    PushEvent: 'Push',
    PullRequestEvent: 'PR',
    IssuesEvent: 'Issue',
    PullRequestReviewEvent: 'Review',
    IssueCommentEvent: 'Comment',
    CreateEvent: 'Create',
    DeleteEvent: 'Delete',
    ForkEvent: 'Fork',
    WatchEvent: 'Star',
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      PushEvent: 'bg-green-100 text-green-700',
      PullRequestEvent: 'bg-purple-100 text-purple-700',
      IssuesEvent: 'bg-yellow-100 text-yellow-700',
      PullRequestReviewEvent: 'bg-blue-100 text-blue-700',
      IssueCommentEvent: 'bg-gray-100 text-gray-700',
      CreateEvent: 'bg-cyan-100 text-cyan-700',
      DeleteEvent: 'bg-red-100 text-red-700',
      ForkEvent: 'bg-orange-100 text-orange-700',
      WatchEvent: 'bg-pink-100 text-pink-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      !searchQuery ||
      activity.repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === 'all' || activity.type === typeFilter

    return matchesSearch && matchesType
  })

  const uniqueTypes = [...new Set(activities.map((a) => a.type))]

  const getActivitySummary = (activity: Activity): string => {
    switch (activity.type) {
      case 'PushEvent':
        const commits = activity.payload.commits?.length || 0
        return `Pushed ${commits} commit${commits !== 1 ? 's' : ''}`
      case 'PullRequestEvent':
        return `${activity.payload.action} PR #${activity.payload.pull_request?.number}`
      case 'IssuesEvent':
        return `${activity.payload.action} issue #${activity.payload.issue?.number}`
      case 'PullRequestReviewEvent':
        return `Reviewed PR with state: ${activity.payload.review?.state}`
      case 'CreateEvent':
        return `Created ${activity.payload.ref_type}: ${activity.payload.ref || 'repository'}`
      case 'ForkEvent':
        return `Forked to ${activity.payload.forkee?.full_name}`
      default:
        return activity.payload.action || 'Activity'
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>Filter by type:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {uniqueTypes.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                  typeFilter === type
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {typeLabels[type] || type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Repository
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Summary
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activities found</p>
                  </td>
                </tr>
              ) : (
                filteredActivities.slice(0, 50).map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${getTypeBadge(activity.type)}`}
                      >
                        {typeLabels[activity.type] || activity.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-700">
                        {activity.repoName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {getActivitySummary(activity)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://github.com/${activity.repoName}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredActivities.length > 50 && (
        <div className="text-center text-sm text-gray-400">
          Showing 50 of {filteredActivities.length} activities
        </div>
      )}
    </div>
  )
}
