import { TECH_CATEGORIES, getIconUrl } from '@/lib/constants'

interface TechStacksTabProps {
  techStack: string[]
}

export function TechStacksTab({ techStack }: TechStacksTabProps) {
  // Categorize tech stack items
  const categorizedStack = TECH_CATEGORIES.map((category) => ({
    ...category,
    items: techStack.filter((tech) =>
      category.keywords.some((kw) =>
        tech.toLowerCase().includes(kw.toLowerCase()),
      ),
    ),
  })).filter((cat) => cat.items.length > 0)

  // Uncategorized items
  const categorizedItems = new Set(
    categorizedStack.flatMap((cat) => cat.items),
  )
  const uncategorized = techStack.filter(
    (tech) => !categorizedItems.has(tech),
  )

  return (
    <div className="space-y-6">
      {/* Categorized Stacks */}
      {categorizedStack.map((category) => (
        <div
          key={category.id}
          className={`bg-white rounded-xl border p-6 shadow-sm ${category.border}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${category.bg} ${category.color}`}
            >
              {category.label}
            </span>
            <span className="text-xs text-gray-400">
              {category.items.length} technologies
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {category.items.map((tech) => {
              const iconUrl = getIconUrl(tech)

              return (
                <div
                  key={tech}
                  className={`flex items-center gap-3 p-3 rounded-lg ${category.bg} hover:opacity-80 transition-opacity`}
                >
                  <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-white rounded-lg shadow-sm">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={tech}
                        className="w-5 h-5"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <span
                        className={`text-sm font-bold ${category.color}`}
                      >
                        {tech.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tech}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Uncategorized */}
      {uncategorized.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600">
              OTHER
            </span>
            <span className="text-xs text-gray-400">
              {uncategorized.length} technologies
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {uncategorized.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-50 text-gray-700"
              >
                {getIconUrl(tech) && (
                  <img
                    src={getIconUrl(tech)!}
                    alt={tech}
                    className="w-4 h-4"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="text-center text-xs text-gray-400">
        Detected {techStack.length} technologies across{' '}
        {categorizedStack.length} categories
      </div>
    </div>
  )
}
