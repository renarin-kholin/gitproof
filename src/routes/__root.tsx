import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content:
          'Evaluates GitHub activity, analyzes code quality, and generates detailed performance metrics using AI.',
      },
      {
        name: 'keywords',
        content: 'GitHub, developer, rating, code quality, AI, metrics, leaderboard',
      },
      {
        property: 'og:title',
        content: 'GitProof - Developer Rating System',
      },
      {
        property: 'og:description',
        content: 'Evaluates GitHub activity, analyzes code quality, and generates detailed performance metrics using AI.',
      },
      {
        property: 'og:image',
        content: '/logo192.png',
      },
      {
        property: 'og:url',
        content: 'https://gitproof.netlify.app',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'GitProof - Developer Rating System',
      },
      {
        name: 'twitter:description',
        content: 'Evaluates GitHub activity, analyzes code quality, and generates detailed performance metrics using AI.',
      },
      {
        name: 'twitter:image',
        content: '/logo192.png',
      },
      {
        title: 'GitProof - Developer Rating System',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap',
      },
    ],
  }),

  notFoundComponent: () => <div className="flex items-center justify-center min-h-screen"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>,

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans text-gray-900 antialiased selection:bg-orange-100 selection:text-orange-900">
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
