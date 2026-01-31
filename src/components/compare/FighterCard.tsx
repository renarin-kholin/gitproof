import { Loader2, Trophy, X } from 'lucide-react'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import type { Fighter } from '@/types'

interface FighterCardProps {
  side: 'left' | 'right'
  input: string
  setInput: (value: string) => void
  fighter: Fighter | null
  loading: boolean
  error: string | null
  onKeyDown: (e: React.KeyboardEvent) => void
  onClear: () => void
  onBlur: () => void
}

export function FighterCard({
  side,
  input,
  setInput,
  fighter,
  loading,
  error,
  onKeyDown,
  onClear,
  onBlur,
}: FighterCardProps) {
  const isLeft = side === 'left'
  const cardRef = useRef<HTMLDivElement>(null)
  const fighterRef = useRef<HTMLDivElement>(null)

  // Animate fighter lock-in using CSS transitions
  useGSAP(
    () => {
      if (fighter && fighterRef.current) {
        fighterRef.current.style.opacity = '1'
        fighterRef.current.style.transform = 'scale(1)'
      }
    },
    { dependencies: [fighter] },
  )

  return (
    <div
      ref={cardRef}
      className="w-full md:w-[420px] h-[280px] bg-[#F8FAFC] rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative group transition-all hover:shadow-md"
    >
      {/* Window Header */}
      <div className="bg-[#F1F5F9] px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
        </div>
        <div className="text-[10px] text-gray-400 font-mono">bash — 80x24</div>
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>

      {/* Body */}
      <div
        className="flex-1 relative flex flex-col items-center justify-center p-6 bg-white"
        style={{
          backgroundImage:
            'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(to right, #f1f5f9 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            <span className="text-xs text-gray-400 font-mono">
              Fetching profile data...
            </span>
          </div>
        ) : fighter ? (
          <div
            ref={fighterRef}
            className="flex flex-col items-center transition-all duration-400"
            style={{ opacity: 0, transform: 'scale(0.8)' }}
          >
            <div className="relative mb-4">
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 rounded-full blur-xl opacity-40 ${isLeft ? 'bg-blue-400' : 'bg-red-400'}`}
              ></div>
              <img
                src={fighter.avatarUrl}
                alt={fighter.login}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg relative z-10"
              />
              <div className="absolute -bottom-1 -right-1 z-20 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                <Trophy
                  size={14}
                  className={isLeft ? 'text-blue-500' : 'text-red-500'}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-mono">
              @{fighter.login}
            </h3>
            {fighter.name && (
              <p className="text-sm text-gray-500 mb-4">{fighter.name}</p>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-500 tracking-wider">
                TARGET_LOCKED
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center">
            <div className="text-gray-300 font-mono text-xs mb-2 text-center">
              → ~ / summon-challenger
            </div>
            <div className="flex items-center gap-2 text-lg px-4">
              <span
                className={`font-bold font-mono shrink-0 ${isLeft ? 'text-blue-500' : 'text-red-500'}`}
              >
                user@{side}:~$
              </span>
              <input
                type="text"
                className="bg-transparent outline-none text-gray-700 placeholder-gray-300 w-full font-bold font-mono"
                placeholder="username"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                autoFocus={isLeft}
                autoComplete="off"
              />
            </div>
            {error && (
              <div className="absolute bottom-6 left-0 w-full text-center">
                <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                  {error}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
