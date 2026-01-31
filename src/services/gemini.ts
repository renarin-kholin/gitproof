import { GoogleGenAI, Type } from '@google/genai'
import type { UserProfile, ComparisonResult, Repo } from '@/types'
import type { GitHubRawData } from './github'

// Helper to safely access process.env
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key]
    }
  } catch {
    return undefined
  }
  return undefined
}

// Helper to map raw repos to internal type
const mapRepositories = (ghData: GitHubRawData): Repo[] => {
  if (!ghData.repos || !Array.isArray(ghData.repos)) return []

  return ghData.repos.map((repo: any) => {
    const name = repo.name || 'Unknown'
    const stars =
      repo.stargazersCount !== undefined ? repo.stargazersCount : repo.stargazers_count || 0
    const forks = repo.forkCount !== undefined ? repo.forkCount : repo.forks_count || 0
    const url = repo.url || repo.html_url || ''
    const description = repo.description || ''

    let language = 'Unknown'
    let techStackCount = 1

    if (repo.languages && repo.languages.edges) {
      language = repo.languages.edges[0]?.node?.name || 'Unknown'
      techStackCount = repo.languages.edges.length || 1
    } else {
      language = repo.language || 'Unknown'
    }

    const fullName = repo.full_name || `${ghData.user.login}/${name}`

    return {
      name,
      fullName,
      description,
      language,
      stars,
      forks,
      url,
      techStackCount,
    }
  })
}

// ==========================================
// Deterministic Scoring Algorithm
// ==========================================
// Each metric is scored 0-10 using specific formulas
// Final score = weighted average of all metrics

const METRIC_WEIGHTS = {
  productivity: 0.25,  // 25% - volume (was Contribution)
  reliability: 0.15,   // 15% - quality & engagement
  impact: 0.25,        // 25% - influence
  mastery: 0.15,       // 15% - technical breadth
  endurance: 0.20,     // 20% - longevity & consistency (was Consistency)
}

// Normalize a value to 0-10 scale using logarithmic scaling for large ranges
const logScale = (value: number, maxExpected: number): number => {
  if (value <= 0) return 0
  // Log base 10 scaling with max cap
  const scaled = (Math.log10(value + 1) / Math.log10(maxExpected + 1)) * 10
  return Math.min(10, Math.max(0, scaled))
}

// Linear scale with cap
const linearScale = (value: number, maxExpected: number): number => {
  return Math.min(10, Math.max(0, (value / maxExpected) * 10))
}

const calculateMetrics = (ghData: GitHubRawData) => {
  const { user, totalStars, topLanguages, totalContributions, longestStreak, prStats } = ghData
  
  // PR Stats (defaults if missing/REST fallback)
  const totalPRs = prStats?.total ?? 0
  const mergedPRs = prStats?.merged ?? 0
  const closedPRs = prStats?.closed ?? 0
  // Acceptance rate: merged / (merged + closed without merge)
  const finishedPRs = mergedPRs + closedPRs
  const acceptanceRate = finishedPRs > 0 ? mergedPRs / finishedPRs : 0.0

  // === ENDURANCE (0-10) === (formerly Consistency)
  // Based on: years active (40%), streak (40%), contribution regularity (20%)
  const yearsActive = (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
  const yearsScore = linearScale(yearsActive, 10) // 10 years = max
  const streakScore = longestStreak ? linearScale(longestStreak, 100) : 5 // 100 day streak = max
  const regularityScore = totalContributions ? linearScale(totalContributions / Math.max(1, yearsActive), 200) : 5
  const endurance = (yearsScore * 0.4) + (streakScore * 0.4) + (regularityScore * 0.2)

  // === PRODUCTIVITY (0-10) === (formerly Contribution)
  // Based on: total contributions (40%), repos (30%), PR volume (20%), commits/repo (10%)
  const contribScore = totalContributions ? logScale(totalContributions, 5000) : 5
  const repoScore = logScale(user.public_repos || 0, 100)
  const prVolumeScore = logScale(totalPRs, 500) // 500 PRs = max score
  const commitsPerRepo = totalContributions && user.public_repos 
    ? totalContributions / user.public_repos 
    : 50
  const avgCommitScore = linearScale(commitsPerRepo, 100)
  const productivity = (contribScore * 0.4) + (repoScore * 0.3) + (prVolumeScore * 0.2) + (avgCommitScore * 0.1)

  // === RELIABILITY (0-10) ===
  // Based on: PR acceptance rate (30%), profile completeness (40%), follower ratio (15%), account age (15%)
  let profileScore = 0
  if (user.name) profileScore += 2
  if (user.bio) profileScore += 2
  if (user.location) profileScore += 1.5
  if (user.company) profileScore += 1.5
  if (user.email) profileScore += 1
  if (user.blog || user.twitter_username) profileScore += 1
  if (user.hireable) profileScore += 1
  profileScore = Math.min(10, profileScore)
  
  const followRatio = user.followers > 0 ? Math.min(10, user.followers / Math.max(1, user.following) * 2) : 5
  const ageScore = linearScale(yearsActive, 8)
  const acceptanceScore = acceptanceRate * 10 // 0-1 mapped to 0-10
  
  const reliability = (profileScore * 0.4) + (acceptanceScore * 0.3) + (followRatio * 0.15) + (ageScore * 0.15)

  // === IMPACT (0-10) ===
  // Based on: total stars (40%), followers (35%), top repo stars (25%)
  const starsScore = logScale(totalStars, 1000)
  const followersScore = logScale(user.followers || 0, 10000)
  const topRepoScore = ghData.topRepo?.stars ? logScale(ghData.topRepo.stars, 500) : 0
  const impact = (starsScore * 0.4) + (followersScore * 0.35) + (topRepoScore * 0.25)

  // === MASTERY (0-10) ===
  // Based on: language diversity (40%), primary language depth (30%), framework signals (30%)
  const langDiversity = linearScale(topLanguages.length, 8) // 8+ languages = max
  const primaryLangDepth = ghData.repos?.length > 0 ? 7 : 5 // Placeholder - could analyze repo depth
  const frameworkSignals = topLanguages.some(l => 
    ['React', 'Vue', 'Angular', 'Django', 'Rails', 'Spring', 'Next.js'].includes(l)
  ) ? 8 : 5
  const mastery = (langDiversity * 0.4) + (primaryLangDepth * 0.3) + (frameworkSignals * 0.3)

  return {
    productivity: parseFloat(productivity.toFixed(1)),
    reliability: parseFloat(reliability.toFixed(1)),
    impact: parseFloat(impact.toFixed(1)),
    mastery: parseFloat(mastery.toFixed(1)),
    endurance: parseFloat(endurance.toFixed(1)),
  }
}

const calculateFinalScore = (metrics: ReturnType<typeof calculateMetrics>): number => {
  const weightedSum = 
    (metrics.productivity * METRIC_WEIGHTS.productivity) +
    (metrics.reliability * METRIC_WEIGHTS.reliability) +
    (metrics.impact * METRIC_WEIGHTS.impact) +
    (metrics.mastery * METRIC_WEIGHTS.mastery) +
    (metrics.endurance * METRIC_WEIGHTS.endurance)
  
  return parseFloat(weightedSum.toFixed(2))
}

const getGrade = (score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 9.0) return 'S'
  if (score >= 7.5) return 'A'
  if (score >= 6.0) return 'B'
  if (score >= 4.5) return 'C'
  if (score >= 3.0) return 'D'
  return 'F'
}

const getPercentile = (score: number): number => {
  // Approximate percentile based on score distribution
  // Score 5 = 50th percentile (median), logarithmic curve for higher scores
  if (score >= 9) return 99
  if (score >= 8) return 95
  if (score >= 7) return 85
  if (score >= 6) return 70
  if (score >= 5) return 50
  if (score >= 4) return 30
  if (score >= 3) return 15
  return 5
}



export const analyzeProfileWithGemini = async (ghData: GitHubRawData): Promise<UserProfile> => {
  // 1. Calculate Deterministic Scores (Always)
  const metrics = calculateMetrics(ghData)
  const score = calculateFinalScore(metrics)
  const grade = getGrade(score)
  const percentile = getPercentile(score)
  const yearsOnGithub =
    (new Date().getTime() - new Date(ghData.user.created_at).getTime()) /
    (1000 * 60 * 60 * 24 * 365)
  
  const prStats = ghData.prStats
  const mergedPRs = prStats?.merged ?? 0
  const closedPRs = prStats?.closed ?? 0
  const finishedPRs = mergedPRs + closedPRs
  const acceptanceRate = finishedPRs > 0 ? mergedPRs / finishedPRs : 0.0

  // 2. Prepare result objects
  const finalRating = { score, grade, percentile }
  const finalMetrics = {
    productivity: {
      label: 'Productivity',
      value: metrics.productivity,
      description: 'Total contributions (40%) + volume (30%) + PR activity (20%)',
    },
    reliability: {
      label: 'Reliability',
      value: metrics.reliability,
      description: 'Profile completeness (40%) + PR acceptance (30%) + reputation',
    },
    impact: {
      label: 'Impact',
      value: metrics.impact,
      description: 'Stars earned (40%) + followers (35%) + viral reach (25%)',
    },
    mastery: {
      label: 'Mastery',
      value: metrics.mastery,
      description: 'Language diversity (40%) + depth signals (30%) + toolchain (30%)',
    },
    endurance: {
      label: 'Endurance',
      value: metrics.endurance,
      description: 'Years active (40%) + contribution streak (40%) + regularity (20%)',
    },
  }

  let summary = `${ghData.user.name || ghData.user.login} has a GitProof score of ${score} (${grade}). Strongest in ${Object.entries(metrics).sort((a, b) => b[1] - a[1])[0][0]}.`

  // 3. Optional: Enrich Summary with AI (if key exists)
  // We ONLY ask AI for a summary, passing the calculated scores to it
  try {
    const apiKey = getEnv('API_KEY')
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey })
      const prompt = `
        Write a 2-sentence professional summary for a developer profile.
        
        Developer: ${ghData.user.name || ghData.user.login}
        Calculated Score: ${score}/10 (Grade: ${grade})
        Key Strength: ${Object.entries(metrics).sort((a, b) => b[1] - a[1])[0][0]}
        
        Bio: ${ghData.user.bio}
        Company: ${ghData.user.company}
        Top Languages: ${ghData.topLanguages.join(', ')}
        
        Context:
        - Endurance: ${metrics.endurance}
        - Productivity: ${metrics.productivity}
        - Reliability: ${metrics.reliability} (PR Acceptance: ${(acceptanceRate * 100).toFixed(0)}%)
        - Impact: ${metrics.impact}
        - Mastery: ${metrics.mastery}
        
        Output JSON: { "summary": "string" }
      `

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
      const data = JSON.parse(response.text || '{}')
      if (data.summary) {
        summary = data.summary
      }
    }
  } catch (e) {
    console.warn('AI summary generation failed, utilizing default summary', e)
  }

  return {
    username: ghData.user.login,
    fullName: ghData.user.name || ghData.user.login,
    email: ghData.user.email || undefined,
    avatarUrl: ghData.user.avatar_url || ghData.user.avatarUrl,
    bio: ghData.user.bio || 'No bio available',
    location: ghData.user.location || 'Remote',
    company: ghData.user.company,
    followers: ghData.user.followers,
    following: ghData.user.following,
    repositories: ghData.user.public_repos,
    yearsOnGithub: parseFloat(yearsOnGithub.toFixed(1)),
    totalStars: ghData.totalStars,
    totalContributions: ghData.totalContributions,
    longestStreak: ghData.longestStreak,
    rating: finalRating,
    metrics: finalMetrics,
    techStack: ghData.topLanguages,
    summary,
    lastScanned: new Date().toLocaleDateString(),
    recentActivity: ghData.events,
    repos: mapRepositories(ghData),
    topRepo: {
      name: ghData.topRepo.name,
      stars: ghData.topRepo.stars,
      url: `https://github.com/${ghData.topRepo.name}`,
    },
  }
}

export const compareProfilesWithGemini = async (
  p1: UserProfile,
  p2: UserProfile,
): Promise<ComparisonResult> => {
  try {
    const apiKey = getEnv('API_KEY')
    if (!apiKey) {
      const winner = p1.rating.score > p2.rating.score ? p1 : p2
      return {
        user1: p1,
        user2: p2,
        analysis: {
          winnerUsername: winner.username,
          headline: `${winner.fullName} is the stronger developer based on available metrics.`,
          reasoning: `${winner.fullName} has a higher overall score (${winner.rating.score}) compared to ${p1.username === winner.username ? p2.fullName : p1.fullName}.`,
          insights: [
            `${winner.fullName} has higher impact scores.`,
            `${p1.followers > p2.followers ? p1.fullName : p2.fullName} has a larger following.`,
            `Both developers have distinct strengths in their tech stacks.`,
          ],
        },
      }
    }

    const ai = new GoogleGenAI({ apiKey })
    const prompt = `
            Compare these two GitHub developers head-to-head.
            
            Developer 1: ${p1.fullName} (@${p1.username})
            - Score: ${p1.rating.score} (${p1.rating.grade})
            - Metrics: endurance ${p1.metrics.endurance.value}, productivity ${p1.metrics.productivity.value}, impact ${p1.metrics.impact.value}, reliability ${p1.metrics.reliability.value}, mastery ${p1.metrics.mastery.value}
            - Repos: ${p1.repositories}, Followers: ${p1.followers}, Total Stars: ${p1.totalStars}
            - Total Contributions (Year): ${p1.totalContributions || 'N/A'}, Streak: ${p1.longestStreak || 'N/A'}
            - Top Languages: ${p1.techStack.join(', ')}
            
            Developer 2: ${p2.fullName} (@${p2.username})
            - Score: ${p2.rating.score} (${p2.rating.grade})
            - Metrics: endurance ${p2.metrics.endurance.value}, productivity ${p2.metrics.productivity.value}, impact ${p2.metrics.impact.value}, reliability ${p2.metrics.reliability.value}, mastery ${p2.metrics.mastery.value}
            - Repos: ${p2.repositories}, Followers: ${p2.followers}, Total Stars: ${p2.totalStars}
            - Total Contributions (Year): ${p2.totalContributions || 'N/A'}, Streak: ${p2.longestStreak || 'N/A'}
            - Top Languages: ${p2.techStack.join(', ')}
            
            Task:
            1. Determine a "winner" based on overall profile strength.
            2. Write a headline (e.g., "X is the stronger developer").
            3. Write a 2-3 sentence paragraph reasoning for the decision.
            4. Provide 4 bullet point "Key Insights" comparing specific data points.
        `

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winnerUsername: { type: Type.STRING },
            headline: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['winnerUsername', 'headline', 'reasoning', 'insights'],
        },
      },
    })

    const aiData = JSON.parse(response.text || '{}')

    return {
      user1: p1,
      user2: p2,
      analysis: {
        winnerUsername: aiData.winnerUsername || p1.username,
        headline: aiData.headline || 'Comparison Complete',
        reasoning: aiData.reasoning || 'AI analysis provided.',
        insights: aiData.insights || [],
      },
    }
  } catch (e) {
    console.error('Gemini comparison failed', e)
    return {
      user1: p1,
      user2: p2,
      analysis: {
        winnerUsername: p1.rating.score > p2.rating.score ? p1.username : p2.username,
        headline: 'Analysis Unavailable',
        reasoning: 'Could not generate AI comparison at this time.',
        insights: [],
      },
    }
  }
}
