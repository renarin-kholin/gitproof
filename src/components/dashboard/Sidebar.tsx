import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Scroll,
  Code2,
  Layers,
  FolderGit2,
  Trophy,
  ExternalLink,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { SearchInput } from '@/components/ui/SearchInput'
import type { UserProfile } from '@/types'

export type DashboardTabId =
  | 'overview'
  | 'pow'
  | 'languages'
  | 'stacks'
  | 'repos'

interface SidebarProps {
  profile: UserProfile
  activeTab: DashboardTabId
  onTabChange: (tab: DashboardTabId) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
}

interface NavItem {
  id: DashboardTabId
  icon: React.ReactNode
  label: string
  badge?: string
}

export function Sidebar({
  profile,
  activeTab,
  onTabChange,
  searchQuery,
  setSearchQuery,
}: SidebarProps) {
  const navItems: NavItem[] = [
    { id: 'overview', icon: <LayoutDashboard size={16} />, label: 'Overview' },
    {
      id: 'pow',
      icon: <Scroll size={16} />,
      label: 'Proof of Work',
      badge: `${profile.recentActivity?.length || 0}`,
    },
    {
      id: 'languages',
      icon: <Code2 size={16} />,
      label: 'Languages',
    },
    { id: 'stacks', icon: <Layers size={16} />, label: 'Tech Stacks' },
    {
      id: 'repos',
      icon: <FolderGit2 size={16} />,
      label: 'Repos',
      badge: `${profile.repos?.length || profile.repositories || 0}`,
    },
  ]

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <Logo className="mb-4" />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search in profile..."
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
              activeTab === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span
              className={
                activeTab === item.id
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-gray-600'
              }
            >
              {item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === item.id
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* User Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <img
            src={profile.avatarUrl}
            alt={profile.username}
            className="w-10 h-10 rounded-full border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile.fullName || profile.username}
            </p>
            <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-900">
              {profile.rating.score}
            </span>
            <span
              className={`text-[10px] font-bold px-1 rounded ${
                profile.rating.grade === 'S' || profile.rating.grade === 'A'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {profile.rating.grade}
            </span>
          </div>
        </div>

        {/* View on GitHub link */}
        <a
          href={`https://github.com/${profile.username}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 justify-center mt-3 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Trophy size={12} />
          <span className="text-[10px] font-semibold tracking-wider">
            TOP {100 - profile.rating.percentile}%
          </span>
          <ExternalLink size={10} className="ml-1" />
        </a>
      </div>
    </aside>
  )
}
