import type { Activity } from '@/types'

export interface GitHubRawData {
  user: any
  repos: any[]
  totalStars: number
  topLanguages: string[]
  events: Activity[]
  topRepo: { name: string; stars: number }
  totalContributions?: number
  longestStreak?: number
  prStats?: {
    total: number
    merged: number
    closed: number
    open: number
  }
}

const GRAPHQL_QUERY = `
  query($username: String!) {
    user(login: $username) {
      name
      login
      avatarUrl
      bio
      company
      location
      email
      createdAt
      followers { totalCount }
      following { totalCount }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
      pullRequests(first: 1) {
        totalCount
      }
      mergedPRs: pullRequests(states: MERGED) {
        totalCount
      }
      closedPRs: pullRequests(states: CLOSED) {
        totalCount
      }
      openPRs: pullRequests(states: OPEN) {
        totalCount
      }
      repositories(first: 60, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}, isFork: false) {
        nodes {
          name
          description
          stargazersCount
          forkCount
          url
          languages(first: 8) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
    }
  }
`

// Helper to safely access process.env
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key]
    }
    // @ts-ignore - Check for Vite env
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || import.meta.env[`VITE_${key}`]
    }
  } catch {
    return undefined
  }
  return undefined
}

const fetchEventsRest = async (username: string): Promise<Activity[]> => {
  try {
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=50`,
    )
    const rawEvents = eventsResponse.ok ? await eventsResponse.json() : []
    if (!Array.isArray(rawEvents)) return []
    return rawEvents.map((ev: any) => ({
      id: ev.id,
      type: ev.type,
      repoName: ev.repo?.name || 'Unknown',
      createdAt: ev.created_at,
      payload: ev.payload,
    }))
  } catch (e) {
    console.warn('Failed to fetch events', e)
    return []
  }
}

const calculateStreak = (weeks: any[]): number => {
  let currentStreak = 0
  let maxStreak = 0

  const days = weeks.flatMap((w: any) => w.contributionDays)

  for (const day of days) {
    if (day.contributionCount > 0) {
      currentStreak++
    } else {
      maxStreak = Math.max(maxStreak, currentStreak)
      currentStreak = 0
    }
  }
  return Math.max(maxStreak, currentStreak)
}

const fetchViaGraphQL = async (username: string, token: string): Promise<GitHubRawData> => {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { username },
    }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL Error: ${response.statusText}`)
  }

  const json = await response.json()
  if (json.errors) {
    console.warn('GraphQL Errors:', json.errors)
    throw new Error('GraphQL Query Failed')
  }

  const userData = json.data.user
  if (!userData) throw new Error('User not found')

  let totalStars = 0
  const languageMap: Record<string, number> = {}
  let topRepo = { name: '', stars: 0 }

  userData.repositories.nodes.forEach((repo: any) => {
    totalStars += repo.stargazersCount
    if (repo.stargazersCount > topRepo.stars) {
      topRepo = { name: `${userData.login}/${repo.name}`, stars: repo.stargazersCount }
    }
    repo.languages.edges.forEach((edge: any) => {
      languageMap[edge.node.name] = (languageMap[edge.node.name] || 0) + edge.size
    })
  })

  const topLanguages = Object.entries(languageMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([lang]) => lang)

  const events = await fetchEventsRest(username)

  return {
    user: {
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatarUrl,
      bio: userData.bio,
      location: userData.location,
      email: userData.email,
      created_at: userData.createdAt,
      followers: userData.followers.totalCount,
      following: userData.following.totalCount,
      public_repos: userData.repositories.nodes.length,
    },
    repos: userData.repositories.nodes,
    totalStars,
    topLanguages,
    events,
    topRepo,
    totalContributions: userData.contributionsCollection.contributionCalendar.totalContributions,
    longestStreak: calculateStreak(userData.contributionsCollection.contributionCalendar.weeks),
    prStats: {
      total: userData.pullRequests.totalCount,
      merged: userData.mergedPRs.totalCount,
      closed: userData.closedPRs.totalCount,
      open: userData.openPRs.totalCount,
    },
  }
}

const fetchViaREST = async (username: string): Promise<GitHubRawData> => {
  // 1. Fetch User Profile
  const userResponse = await fetch(`https://api.github.com/users/${username}`)
  if (userResponse.status === 404) throw new Error('User not found')
  if (!userResponse.ok) throw new Error('GitHub API Error: ' + userResponse.statusText)
  const user = await userResponse.json()

  // 2. Fetch User Repositories
  const reposResponse = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
  )
  const repos = reposResponse.ok ? await reposResponse.json() : []

  // 3. Fetch Events
  const events = await fetchEventsRest(username)

  // 4. Process Data
  let totalStars = 0
  const languageMap: Record<string, number> = {}
  let topRepo = { name: '', stars: 0 }

  if (Array.isArray(repos)) {
    repos.forEach((repo: any) => {
      totalStars += repo.stargazers_count
      if (repo.stargazers_count > topRepo.stars) {
        topRepo = { name: repo.full_name, stars: repo.stargazers_count }
      }
      if (repo.language) {
        languageMap[repo.language] = (languageMap[repo.language] || 0) + 1
      }
    })
  }

  const topLanguages = Object.entries(languageMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([lang]) => lang)

  return {
    user,
    repos: Array.isArray(repos) ? repos : [],
    totalStars,
    topLanguages,
    events,
    topRepo,
    totalContributions: undefined,
    longestStreak: undefined,
    prStats: undefined, // Cannot easily get accurate PR stats via REST without search API
  }
}

export const fetchGitHubData = async (username: string): Promise<GitHubRawData> => {
  const token = getEnv('GITHUB_TOKEN') || getEnv('REACT_APP_GITHUB_TOKEN')

  if (token) {
    try {
      return await fetchViaGraphQL(username, token)
    } catch (e) {
      console.warn('GraphQL fetch failed, falling back to REST', e)
      return await fetchViaREST(username)
    }
  } else {
    return await fetchViaREST(username)
  }
}
