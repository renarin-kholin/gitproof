import { Search } from 'lucide-react'
import { forwardRef } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  className?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder = 'Search...',
      className = '',
    },
    ref,
  ) => {
    return (
      <div className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSubmit) {
              e.preventDefault()
              onSubmit()
            }
          }}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 transition-all placeholder-gray-400 bg-white text-gray-900"
        />
      </div>
    )
  },
)

SearchInput.displayName = 'SearchInput'
