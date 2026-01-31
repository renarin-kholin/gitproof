import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { Search, Github, ChevronRight, Sword, User } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { Logo } from '@/components/ui/Logo'
import { Modal } from '@/components/ui/Modal'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalInput, setModalInput] = useState('')
  const modalInputRef = useRef<HTMLInputElement>(null)

  // Animation refs
  const heroRef = useRef<HTMLDivElement>(null)
  const tagsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  // GSAP entrance animations using CSS transitions as fallback
  useGSAP(() => {
    // Add animation classes after mount
    if (heroRef.current) {
      heroRef.current.style.opacity = '1'
      heroRef.current.style.transform = 'translateY(0)'
    }
    if (tagsRef.current) {
      Array.from(tagsRef.current.children).forEach((child, i) => {
        setTimeout(() => {
          ; (child as HTMLElement).style.opacity = '1'
            ; (child as HTMLElement).style.transform = 'translateY(0) scale(1)'
        }, 300 + i * 80)
      })
    }
    if (cardsRef.current) {
      Array.from(cardsRef.current.children).forEach((child, i) => {
        setTimeout(() => {
          ; (child as HTMLElement).style.opacity = '1'
            ; (child as HTMLElement).style.transform = 'translateY(0)'
        }, 500 + i * 150)
      })
    }
  }, [])

  // Focus modal input when opened
  useEffect(() => {
    if (showModal && modalInputRef.current) {
      setTimeout(() => modalInputRef.current?.focus(), 100)
    }
  }, [showModal])

  const handleSearch = (username: string) => {
    if (username.trim()) {
      navigate({ to: '/profile/$username', params: { username: username.trim() } })
    }
  }

  const handleModalSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (modalInput.trim()) {
      setShowModal(false)
      handleSearch(modalInput.trim())
    }
  }

  const tags = [
    'Global Tier',
    'OSS Contributions',
    'Merit-based Score',
    'GitHub Rank',
    'Tech Stacks',
    'PRIME Score ✨',
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full max-w-7xl px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
        <Logo />
      </nav>

      {/* Hero */}
      <main className="flex-1 w-full max-w-4xl px-6 flex flex-col items-center justify-center py-20">
        <div ref={heroRef} style={{ opacity: 0, transform: 'translateY(30px)' }} className="transition-all duration-700">
          <h1 className="text-4xl md:text-6xl font-serif font-medium text-center text-gray-900 leading-tight mb-8">
            GitHub stats are cheap.
            <br />
            Show me your <span className="font-semibold">GitProof.</span>
          </h1>
        </div>

        {/* Tags */}
        <div ref={tagsRef} className="flex flex-wrap justify-center gap-3 mb-16">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-[#EAE8E2] text-[#5A564C] text-xs font-semibold rounded-md uppercase tracking-wide transition-all duration-500"
              style={{ opacity: 0, transform: 'translateY(20px) scale(0.9)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-6 w-full">
          {/* Analyze Card */}
          <div
            onClick={() => setShowModal(true)}
            className="bg-[#F5F4F0] p-8 rounded-lg cursor-pointer hover:bg-[#EAE8E2] transition-colors text-center group active:scale-[0.98] duration-150"
          >
            <div className="mb-4 flex justify-center">
              <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                <User className="w-6 h-6 text-gray-800" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Analyzing your own profile?
            </h3>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">
                Click to enter username
              </span>{' '}
              to get a full assessment result, insights, ranks and more...
            </p>
          </div>

          {/* Battle Mode Card */}
          <Link
            to="/compare"
            className="bg-[#F5F4F0] p-8 rounded-lg cursor-pointer hover:bg-[#EAE8E2] transition-colors text-center group active:scale-[0.98] duration-150 block"
          >
            <div className="mb-4 flex justify-center">
              <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                <Sword className="w-6 h-6 text-gray-800" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Battle Mode</h3>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">
                Compare two profiles
              </span>{' '}
              head-to-head.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#F5F4F0] py-12 mt-auto border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Logo className="mb-4 w-fit" />
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
              Evaluates GitHub activity, analyzes code quality, and generates
              detailed performance metrics using Gemini AI.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link
                  to="/"
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  Home
                </Link>
              </li>
              <li
                onClick={() => setShowModal(true)}
                className="cursor-pointer hover:text-black transition-colors"
              >
                Search
              </li>
              <li>
                <Link
                  to="/compare"
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  Compare
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Community
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <a href="http://github.com/renarin-kholin/gitproof" target="_blank" rel="noopener noreferrer">
              <li className="cursor-pointer hover:text-black transition-colors flex items-center gap-2">
                <Github size={14} />Star on GitHub
              </li>
              </a>
            </ul>
          </div>
        </div>
      </footer>

      {/* Search Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-gray-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Analyze Profile</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter a GitHub username to generate a report
          </p>
        </div>

        <form onSubmit={handleModalSearch} className="space-y-4">
          <input
            ref={modalInputRef}
            type="text"
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
            placeholder="e.g. torvalds"
          />
          <button
            type="submit"
            disabled={!modalInput.trim()}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Analyze <ChevronRight size={16} />
          </button>
        </form>
      </Modal>
    </div>
  )
}
