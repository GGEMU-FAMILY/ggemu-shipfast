import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin

        return new Response(buildRobotsTxt(origin), {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      },
    },
  },
})

function buildRobotsTxt(origin: string) {
  return `User-agent: *
Disallow:
Sitemap: ${origin}/sitemap.xml
`
}
