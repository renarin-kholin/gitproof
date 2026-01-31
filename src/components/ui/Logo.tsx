import { Link } from '@tanstack/react-router'

interface LogoProps {
  onClick?: () => void
  className?: string
}

export function Logo({ onClick, className = '' }: LogoProps) {
  const content = (
    <>
      <span className="text-xl">🏆</span> GitProof
    </>
  )

  const baseClass = `flex items-center gap-2 font-bold text-xl text-gray-900 cursor-pointer select-none hover:opacity-80 transition-opacity ${className}`

  if (onClick) {
    return (
      <div onClick={onClick} className={baseClass}>
        {content}
      </div>
    )
  }

  return (
    <Link to="/" className={baseClass}>
      {content}
    </Link>
  )
}
