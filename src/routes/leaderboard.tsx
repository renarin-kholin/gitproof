import { createFileRoute, Link } from '@tanstack/react-router'
import { Github, ChevronRight, ExternalLink } from 'lucide-react'
import { getLeaderboardData } from '@/services/leaderboard'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
  loader: async () => {
    return await getLeaderboardData()
  },
})

function LeaderboardPage() {
  const leaderboard = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Simple Navbar */}
      <nav className="w-full max-w-7xl px-6 py-6 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-gray-100/50 backdrop-blur-sm">
        <Link
          to="/"
          className="flex items-center gap-2 font-serif font-bold text-xl text-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">🏆</span> GitProof
        </Link>
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center border border-gray-200 rounded-lg p-1 pr-3 bg-white shadow-sm hover:shadow-md transition-shadow">
            <Link
              to="/"
              className="px-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-black flex items-center gap-1"
            >
              Analyze <ChevronRight size={14} />
            </Link>
            <Github className="w-5 h-5 text-gray-700" />
          </div>
        </div>
      </nav>

      <main className="w-full max-w-5xl px-6 mt-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 tracking-tight">
            Hall of Fame
          </h1>
          <p className="text-center text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Top-ranked developers based on <span className="font-semibold text-gray-900">PRIME</span> scores. 
            Rankings update in real-time as profiles are analyzed.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ring-1 ring-gray-200/50">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top 50 Profiles</h2>
              <p className="text-xs text-gray-500 mt-1">
                Ranked by overall performance score & search popularity.
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400">
              LIVE UPDATES
            </div>
          </div>

          <div className="overflow-x-auto">
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p>No profiles ranked yet. Be the first!</p>
                <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">Analyze a profile</Link>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 w-20 text-center">Rank</th>
                    <th className="px-6 py-4">Developer</th>
                    <th className="px-6 py-4 text-center">PRIME Score</th>
                    <th className="px-6 py-4 text-center">Grade</th>
                    <th className="px-6 py-4 text-center hidden sm:table-cell">Popularity</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.username}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center">
                        {entry.rank === 1 && <span className="text-xl">🥇</span>}
                        {entry.rank === 2 && <span className="text-xl">🥈</span>}
                        {entry.rank === 3 && <span className="text-xl">🥉</span>}
                        {entry.rank > 3 && (
                          <span className="text-gray-400 font-mono">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={entry.avatarUrl}
                            alt={entry.username}
                            className="w-10 h-10 rounded-full bg-gray-200 object-cover ring-2 ring-white border border-gray-100 shadow-sm"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {entry.name || entry.username}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              @{entry.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-900 text-lg">
                          {entry.score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shadow-sm ${
                            ['S', 'A'].includes(entry.grade)
                              ? 'bg-[#B48108] text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {entry.grade}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                           {entry.searchCount} views
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/profile/$username"
                          params={{ username: entry.username }}
                          className="text-xs font-medium text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-black hover:text-white hover:border-black bg-white inline-flex items-center gap-1 transition-all"
                        >
                          View <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
