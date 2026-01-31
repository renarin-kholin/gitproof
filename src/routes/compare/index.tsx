import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { Github, Sword, ChevronRight, ArrowRight } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { Logo } from '@/components/ui/Logo'
import { FighterCard } from '@/components/compare/FighterCard'
import type { Fighter } from '@/types'

export const Route = createFileRoute('/compare/')({
  component: CompareLanding,
})

function CompareLanding() {
  const navigate = useNavigate()

  const [leftInput, setLeftInput] = useState('')
  const [rightInput, setRightInput] = useState('')

  const [leftFighter, setLeftFighter] = useState<Fighter | null>(null)
  const [rightFighter, setRightFighter] = useState<Fighter | null>(null)

  const [loadingLeft, setLoadingLeft] = useState(false)
  const [loadingRight, setLoadingRight] = useState(false)

  const [errorLeft, setErrorLeft] = useState<string | null>(null)
  const [errorRight, setErrorRight] = useState<string | null>(null)

  // Animation refs
  const contentRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

  const handleFetchUser = async (username: string, side: 'left' | 'right') => {
    if (!username.trim()) return

    const setLoading = side === 'left' ? setLoadingLeft : setLoadingRight
    const setFighter = side === 'left' ? setLeftFighter : setRightFighter
    const setError = side === 'left' ? setErrorLeft : setErrorRight

    setLoading(true)
    setError(null)

    try {
      // Fetch basic user info from GitHub API
      const response = await fetch(`https://api.github.com/users/${username}`)
      if (!response.ok) throw new Error('User not found')

      const data = await response.json()
      setFighter({
        login: data.login,
        name: data.name,
        avatarUrl: data.avatar_url,
      })
    } catch {
      setError('User not found')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, side: 'left' | 'right') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = side === 'left' ? leftInput : rightInput
      handleFetchUser(val, side)
    }
  }

  const handleCompare = () => {
    const u1 = leftFighter ? leftFighter.login : leftInput
    const u2 = rightFighter ? rightFighter.login : rightInput

    if (u1 && u2) {
      // Animate button with CSS then navigate
      if (buttonRef.current) {
        buttonRef.current.style.transform = 'scale(0.95)'
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.style.transform = 'scale(1)'
          }
          navigate({
            to: '/compare/$user1/$user2',
            params: { user1: u1, user2: u2 },
          })
        }, 100)
      } else {
        navigate({
          to: '/compare/$user1/$user2',
          params: { user1: u1, user2: u2 },
        })
      }
    }
  }

  const clearFighter = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftFighter(null)
      setLeftInput('')
      setErrorLeft(null)
    } else {
      setRightFighter(null)
      setRightInput('')
      setErrorRight(null)
    }
  }

  const canCompare =
    (leftFighter || leftInput.trim()) && (rightFighter || rightInput.trim())

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center font-sans selection:bg-yellow-100">
      <main
        ref={contentRef}
        className="flex-1 w-full flex flex-col items-center justify-center -mt-20 p-6"
      >
        <div className="mb-6 flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-md text-xs font-mono text-gray-500 border border-gray-200 shadow-sm">
          <Sword className="w-3 h-3 text-gray-400" /> git diff user1..user2
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center tracking-tight">
          Choose Your Fighters
        </h1>
        <p className="text-gray-500 text-center max-w-xl mb-16 leading-relaxed">
          Enter two GitHub usernames to compare their stats, contributions, and
          coding styles in a head-to-head battle.
        </p>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-5xl relative">
          {/* VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex">
            <div className="w-12 h-12 bg-[#FFC107] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Sword className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Left Card */}
          <FighterCard
            side="left"
            input={leftInput}
            setInput={setLeftInput}
            fighter={leftFighter}
            loading={loadingLeft}
            error={errorLeft}
            onKeyDown={(e) => handleKeyDown(e, 'left')}
            onClear={() => clearFighter('left')}
            onBlur={() => {
              if (leftInput && !leftFighter) handleFetchUser(leftInput, 'left')
            }}
          />

          {/* Right Card */}
          <FighterCard
            side="right"
            input={rightInput}
            setInput={setRightInput}
            fighter={rightFighter}
            loading={loadingRight}
            error={errorRight}
            onKeyDown={(e) => handleKeyDown(e, 'right')}
            onClear={() => clearFighter('right')}
            onBlur={() => {
              if (rightInput && !rightFighter)
                handleFetchUser(rightInput, 'right')
            }}
          />
        </div>

        {/* Compare Button */}
        <div className="mt-12">
          <button
            ref={buttonRef}
            onClick={handleCompare}
            disabled={!canCompare}
            className={`
              group flex items-center gap-2 px-8 py-3 rounded-lg font-medium shadow-lg transition-all cursor-pointer
              ${
                canCompare
                  ? 'bg-gray-900 text-white hover:bg-black hover:scale-105 hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Compare
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>
    </div>
  )
}
