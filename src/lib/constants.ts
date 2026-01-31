// ==========================================
// GitProof Constants & Helpers
// ==========================================

import type { UserProfile } from '@/types'

// Scanning overlay step messages
export const SCAN_STEPS = [
  'Connecting to GitHub API...',
  'Fetching repository data...',
  'Analyzing contribution history...',
  'Processing language statistics...',
  'Running AI analysis...',
  'Calculating PRIME metrics...',
  'Generating profile summary...',
  'Finalizing results...',
]

// Tech stack classification categories
export const TECH_CATEGORIES = [
  {
    id: 'FRAMEWORK',
    label: 'FRAMEWORK',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    keywords: [
      'React',
      'Vue',
      'Angular',
      'Svelte',
      'Next',
      'Remix',
      'Express',
      'Nest',
      'Spring',
      'Django',
      'Flask',
      'Rails',
      'Laravel',
      'Gatsby',
      'Nuxt',
    ],
  },
  {
    id: 'LANGUAGE',
    label: 'LANGUAGE',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    keywords: [
      'Script',
      'Java',
      'Python',
      'C',
      'Go',
      'Rust',
      'Ruby',
      'PHP',
      'Swift',
      'Kotlin',
      'HTML',
      'CSS',
      'Solidity',
      'Shell',
      'JSON',
      'YAML',
      'TOML',
      'XML',
      'Markdown',
    ],
  },
  {
    id: 'STYLING',
    label: 'STYLING & UI',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    keywords: [
      'Tailwind',
      'Bootstrap',
      'Material',
      'Chakra',
      'Sass',
      'Less',
      'Styled',
      'CSS',
    ],
  },
  {
    id: 'BACKEND',
    label: 'API & BACKEND',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    keywords: [
      'Node',
      'Deno',
      'Bun',
      'GraphQL',
      'Apollo',
      'TRPC',
      'Prisma',
      'Sequelize',
      'Mongoose',
    ],
  },
  {
    id: 'DATABASE',
    label: 'DATABASE',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    keywords: [
      'SQL',
      'Mongo',
      'Redis',
      'Firebase',
      'Supabase',
      'Dynamo',
      'Postgres',
    ],
  },
  {
    id: 'DEVOPS',
    label: 'DEVOPS & TOOLS',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    keywords: [
      'Docker',
      'Kuber',
      'AWS',
      'Azure',
      'GCP',
      'Git',
      'Linux',
      'Vite',
      'Webpack',
      'Babel',
    ],
  },
  {
    id: 'TESTING',
    label: 'TESTING',
    color: 'text-lime-600',
    bg: 'bg-lime-50',
    border: 'border-lime-100',
    keywords: ['Jest', 'Vitest', 'Cypress', 'Playwright', 'Mocha', 'Jasmine'],
  },
]

// Devicon URL mapping
const DEVICON_MAP: Record<string, string> = {
  React: 'react/react-original',
  TypeScript: 'typescript/typescript-original',
  JavaScript: 'javascript/javascript-original',
  Python: 'python/python-original',
  Java: 'java/java-original',
  C: 'c/c-original',
  'C++': 'cplusplus/cplusplus-original',
  'C#': 'csharp/csharp-original',
  Go: 'go/go-original-wordmark',
  Rust: 'rust/rust-original',
  HTML: 'html5/html5-original',
  CSS: 'css3/css3-original',
  Tailwind: 'tailwindcss/tailwindcss-original',
  'Node.js': 'nodejs/nodejs-original',
  Docker: 'docker/docker-original',
  PostgreSQL: 'postgresql/postgresql-original',
  MongoDB: 'mongodb/mongodb-original',
  Git: 'git/git-original',
  Linux: 'linux/linux-original',
  Shell: 'bash/bash-original',
  Solidity: 'solidity/solidity-original',
  Ruby: 'ruby/ruby-original',
  PHP: 'php/php-original',
  'Next.js': 'nextjs/nextjs-original',
  Vue: 'vuejs/vuejs-original',
  Angular: 'angularjs/angularjs-original',
  Svelte: 'svelte/svelte-original',
  Sass: 'sass/sass-original',
  Bootstrap: 'bootstrap/bootstrap-original',
  Redis: 'redis/redis-original',
  Firebase: 'firebase/firebase-plain',
  AWS: 'amazonwebservices/amazonwebservices-original-wordmark',
  GraphQL: 'graphql/graphql-plain',
  JSON: 'json/json-original',
  Spring: 'spring/spring-original',
  Django: 'django/django-plain',
  Flask: 'flask/flask-original',
  Kotlin: 'kotlin/kotlin-original',
  Swift: 'swift/swift-original',
}

export function getIconUrl(tech: string): string | null {
  // Exact match
  if (DEVICON_MAP[tech]) {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${DEVICON_MAP[tech]}.svg`
  }

  // Partial match
  const key = Object.keys(DEVICON_MAP).find(
    (k) =>
      tech.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(tech.toLowerCase()),
  )

  if (key) {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${DEVICON_MAP[key]}.svg`
  }

  return null
}

// Language style mapping for badges
export function getLanguageStyle(lang: string): string {
  switch (lang.toLowerCase()) {
    case 'typescript':
      return 'bg-blue-100 text-blue-700'
    case 'javascript':
      return 'bg-yellow-100 text-yellow-700'
    case 'rust':
      return 'bg-orange-100 text-orange-700'
    case 'solidity':
      return 'bg-gray-100 text-gray-700'
    case 'go':
      return 'bg-cyan-100 text-cyan-700'
    case 'python':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}




