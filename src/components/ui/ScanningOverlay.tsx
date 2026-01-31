import { useState } from 'react'
import { useGSAP } from '@gsap/react'
import { Loader2, CheckCircle2, Circle, AlertCircle, XCircle } from 'lucide-react'
import { SCAN_STEPS } from '@/lib/constants'

interface Props {
  username: string
  isLoading: boolean
  error?: string | null
  onCancel: () => void
}

export function ScanningOverlay({ username, isLoading, error, onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useGSAP(
    () => {
      if (error) {
        setProgress(100)
        return
      }

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (isLoading && prev >= 90) return 90
          if (!isLoading && prev >= 100) return 100
          return prev + 1
        })
      }, 50)

      // Step stepper animation
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (isLoading && prev >= SCAN_STEPS.length - 2) {
            return prev
          }
          if (prev < SCAN_STEPS.length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 600)

      return () => {
        clearInterval(progressInterval)
        clearInterval(stepInterval)
      }
    },
    { dependencies: [isLoading, error] },
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
              {error ? (
                <XCircle className="text-red-500" />
              ) : (
                <img
                  src={`https://github.com/${username}.png`}
                  onError={(e) =>
                    (e.currentTarget.src =
                      'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png')
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">@{username}</h3>
              <p className="text-xs text-gray-500">{error ? 'Scan Failed' : 'Analyzing ID...'}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${error ? 'bg-red-50' : 'bg-gray-100'}`}
          >
            {!error && <Loader2 className="w-3 h-3 animate-spin text-gray-600" />}
            <span className={`text-xs font-medium ${error ? 'text-red-600' : 'text-gray-600'}`}>
              {error ? 'Error' : 'Scanning'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h4 className="font-bold text-red-900">Scan Failed</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={onCancel}
                className="text-sm bg-white border border-red-200 text-red-700 px-4 py-2 rounded-md font-medium hover:bg-red-50 transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Main Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-gray-700">
                  <span>Scanning Profile</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">Connecting to GitHub API & Gemini AI...</p>
              </div>

              {/* Current Action Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
                  <span className="text-sm text-gray-700 font-medium">
                    {SCAN_STEPS[currentStep]}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">...</span>
              </div>

              {/* Steps List (Visual only) */}
              <div className="space-y-3 pl-2">
                {SCAN_STEPS.slice(0, 5).map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {idx < currentStep ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : idx === currentStep ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-200" />
                    )}
                    <span
                      className={`text-sm ${idx <= currentStep ? 'text-gray-600' : 'text-gray-300'}`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
