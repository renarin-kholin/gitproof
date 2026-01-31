import { X } from 'lucide-react'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (isOpen && backdropRef.current && contentRef.current) {
        // Simple CSS-based animation fallback
        backdropRef.current.style.opacity = '1'
        contentRef.current.style.opacity = '1'
        contentRef.current.style.transform = 'scale(1) translateY(0)'
      }
    },
    { dependencies: [isOpen] },
  )

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200"
      style={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative transition-all duration-250 ${className}`}
        style={{ opacity: 0, transform: 'scale(0.95) translateY(10px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

