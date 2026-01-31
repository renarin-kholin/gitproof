// ==========================================
// GitProof Type Definitions
// ==========================================

export interface Metric {
  label: string
  value: number
  description: string
}

export interface Metrics {
  productivity: Metric
  reliability: Metric
  impact: Metric
  mastery: Metric
  endurance: Metric
}

export interface Rating {
  score: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  percentile: number
}

export interface TopRepo {
  name: string
  stars: number
  url: string
}

export interface Repo {
  name: string
  fullName: string
  description: string
  language: string
  stars: number
  forks: number
  url: string
  techStackCount: number
}

export interface Activity {
  id: string
  type: string
  repoName: string
  createdAt: string
  payload: {
    action?: string
    pull_request?: {
      title: string
      number: number
      state: string
      merged: boolean
      changed_files?: number
      additions?: number
      deletions?: number
    }
    issue?: {
      title: string
      number: number
      state: string
    }
    review?: {
      state: string
    }
    commits?: Array<{
      message: string
    }>
    head?: string
    ref_type?: string
    ref?: string
    forkee?: {
      full_name: string
    }
  }
}

export interface UserProfile {
  username: string
  fullName: string
  avatarUrl: string
  bio: string
  location: string
  email?: string
  company?: string
  yearsOnGithub: number
  followers: number
  following: number
  repositories: number
  totalStars?: number
  totalContributions?: number
  longestStreak?: number
  topRepo?: TopRepo
  rating: Rating
  metrics: Metrics
  techStack: string[]
  repos: Repo[]
  recentActivity: Activity[]
  summary: string
  lastScanned: string
}

export interface ComparisonAnalysis {
  winnerUsername: string
  headline: string
  reasoning: string
  insights: string[]
}

export interface ComparisonResult {
  user1: UserProfile
  user2: UserProfile
  analysis: ComparisonAnalysis
}

export interface Fighter {
  login: string
  name: string
  avatarUrl: string
}

export type ViewState =
  | 'LANDING'
  | 'DASHBOARD'
  | 'SCANNING'
  | 'LEADERBOARD'
  | 'COMPARE'
  | 'COMPARE_RESULT'
