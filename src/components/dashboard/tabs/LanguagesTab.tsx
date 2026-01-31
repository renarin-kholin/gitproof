import { getIconUrl, getLanguageStyle } from '@/lib/constants'

interface LanguagesTabProps {
  techStack: string[]
}

export function LanguagesTab({ techStack }: LanguagesTabProps) {
  // Filter to just languages (exclude frameworks, etc.)
  const languages = techStack.filter((tech) =>
    [
      'TypeScript',
      'JavaScript',
      'Python',
      'Java',
      'C',
      'C++',
      'C#',
      'Go',
      'Rust',
      'Ruby',
      'PHP',
      'Swift',
      'Kotlin',
      'Solidity',
      'HTML',
      'CSS',
      'Shell',
    ].some((lang) => tech.toLowerCase().includes(lang.toLowerCase())),
  )

  // If no languages found, show all tech stack items
  const itemsToShow = languages.length > 0 ? languages : techStack.slice(0, 10)

  // We assume techStack is already sorted by importance/usage from the backend
  const primaryLanguages = itemsToShow.slice(0, 5)
  const otherLanguages = itemsToShow.slice(5)

  return (
    <div className="space-y-6">
      {/* Primary Languages */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-lg">⭐</span> Top Languages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryLanguages.map((lang, index) => (
                <div key={lang} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-white rounded-lg shadow-sm">
                        {getIconUrl(lang) ? (
                            <img
                                src={getIconUrl(lang)!}
                                alt={lang}
                                className="w-6 h-6"
                                onError={(e) => {
                                    ;(e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        ) : (
                            <div className="text-lg font-bold text-gray-500">
                                {lang.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{lang}</div>
                        <div className="text-xs text-gray-500">Rank #{index + 1}</div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* All detected languages */}
      {otherLanguages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Other Detected Languages</h3>
            <div className="flex flex-wrap gap-2">
            {otherLanguages.map((lang) => (
                <span
                key={lang}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${getLanguageStyle(lang)}`}
                >
                {getIconUrl(lang) && (
                    <img
                    src={getIconUrl(lang)!}
                    alt={lang}
                    className="w-4 h-4"
                    onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                    />
                )}
                {lang}
                </span>
            ))}
            </div>
        </div>
      )}
    </div>
  )
}
