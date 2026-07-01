import { createFileRoute } from '@tanstack/react-router'

import { siteConfig } from '#/lib/site-config'

const manifestCacheMaxAge = 60 * 60

type WebAppManifest = {
  short_name: string
  name: string
  description: string
  icons: Array<{
    src: string
    type: string
    sizes: string
    purpose: string
  }>
  start_url: string
  scope: string
  display: 'standalone'
  theme_color: string
  background_color: string
}

export const Route = createFileRoute('/manifest.webmanifest')({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(buildManifest()), {
          headers: {
            'Cache-Control': `public, max-age=${manifestCacheMaxAge}`,
            'Content-Type': 'application/manifest+json; charset=utf-8',
          },
        }),
    },
  },
})

function buildManifest(): WebAppManifest {
  return {
    short_name: siteConfig.SITE_NAME,
    name: siteConfig.SITE_NAME,
    description:
      'Play classic retro games directly in your browser. No downloads required.',
    icons: [
      {
        src: '/logo.png',
        type: 'image/png',
        sizes: '240x240',
        purpose: 'any maskable',
      },
    ],
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: '#000000',
    background_color: '#ffffff',
  }
}
