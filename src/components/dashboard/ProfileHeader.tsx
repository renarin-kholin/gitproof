import {
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react'
import type { UserProfile } from '@/types'

interface ProfileHeaderProps {
  profile: UserProfile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const tierColors: Record<string, string> = {
    S: 'from-yellow-400 to-amber-500 shadow-yellow-200',
    A: 'from-green-400 to-emerald-500 shadow-green-200',
    B: 'from-blue-400 to-cyan-500 shadow-blue-200',
    C: 'from-gray-400 to-slate-500 shadow-gray-200',
    D: 'from-orange-400 to-red-400 shadow-orange-200',
    F: 'from-red-500 to-rose-600 shadow-red-200',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar Section */}
        <div className="relative">
          <img
            src={profile.avatarUrl}
            alt={profile.username}
            className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg"
          />
          {/* Rating Badge */}
          <div
            className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br ${tierColors[profile.rating.grade]} shadow-lg flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">
              {profile.rating.grade}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.fullName || profile.username}
            </h1>
            <a
              href={`https://github.com/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <p className="text-gray-500 mb-3">@{profile.username}</p>

          {profile.bio && (
            <p className="text-sm text-gray-600 mb-3 max-w-lg leading-relaxed">
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {profile.yearsOnGithub} years on GitHub
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex gap-6 md:border-l md:border-gray-100 md:pl-6">
          <StatItem label="Score" value={profile.rating.score.toFixed(1)} />
          <StatItem label="Percentile" value={`${profile.rating.percentile}%`} />
          <StatItem label="Repos" value={profile.repositories} />
          <StatItem label="Followers" value={formatNumber(profile.followers)} />
        </div>
      </div>
    </div>
  )
}

function StatItem({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
