import { useState } from 'react'
import { Search, Star, GitFork, ExternalLink, ChevronDown, ArrowUpDown } from 'lucide-react'
import { getLanguageStyle } from '@/lib/constants'
import type { Repo } from '@/types'

interface ReposTabProps {
  repos: Repo[]
  searchQuery: string
}

type SortKey = 'name' | 'stars' | 'forks' | 'language'
type SortDir = 'asc' | 'desc'

export function ReposTab({ repos, searchQuery }: ReposTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('stars')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filteredRepos = repos
    .filter((repo) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        repo.name.toLowerCase().includes(q) ||
        repo.description?.toLowerCase().includes(q) ||
        repo.language?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name':
          return mult * a.name.localeCompare(b.name)
        case 'stars':
          return mult * (a.stars - b.stars)
        case 'forks':
          return mult * (a.forks - b.forks)
        case 'language':
          return mult * (a.language || '').localeCompare(b.language || '')
        default:
          return 0
      }
    })

  const SortHeader = ({
    label,
    sortKeyName,
  }: {
    label: string
    sortKeyName: SortKey
  }) => (
    <button
      onClick={() => handleSort(sortKeyName)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase cursor-pointer transition-colors ${
        sortKey === sortKeyName
          ? 'text-gray-900'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
      <ArrowUpDown
        size={12}
        className={sortKey === sortKeyName ? 'opacity-100' : 'opacity-40'}
      />
    </button>
  )

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{repos.length}</p>
          <p className="text-xs text-gray-500">Total Repos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {repos.reduce((sum, r) => sum + r.stars, 0)}
          </p>
          <p className="text-xs text-gray-500">Total Stars</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {repos.reduce((sum, r) => sum + r.forks, 0)}
          </p>
          <p className="text-xs text-gray-500">Total Forks</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {new Set(repos.map((r) => r.language).filter(Boolean)).size}
          </p>
          <p className="text-xs text-gray-500">Languages</p>
        </div>
      </div>

      {/* Repos Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Name" sortKeyName="name" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Language" sortKeyName="language" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Stars" sortKeyName="stars" />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortHeader label="Forks" sortKeyName="forks" />
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRepos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No repositories found</p>
                  </td>
                </tr>
              ) : (
                filteredRepos.slice(0, 50).map((repo) => (
                  <tr
                    key={repo.fullName}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 font-mono">
                          {repo.name}
                        </p>
                        {repo.description && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {repo.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {repo.language ? (
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getLanguageStyle(repo.language)}`}
                        >
                          {repo.language}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm text-gray-700">
                        <Star size={12} className="text-yellow-500" />
                        {repo.stars.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm text-gray-700">
                        <GitFork size={12} className="text-gray-400" />
                        {repo.forks.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={repo.url}
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

      {filteredRepos.length > 50 && (
        <div className="text-center text-sm text-gray-400">
          Showing 50 of {filteredRepos.length} repositories
        </div>
      )}
    </div>
  )
}
