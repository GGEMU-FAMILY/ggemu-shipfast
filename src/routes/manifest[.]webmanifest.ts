import { createFileRoute } from '@tanstack/react-router'

import { siteConfig } from '#/lib/site-config'

const manifestCacheMaxAge = 60 * 60

type WebAppManifest = {
  short_name: string
  name: string
  description: string
  icons: Array<{
    src: string
    sizes: string
    purpose: string
    type?: string
  }>
  id: string
  start_url: string
  scope: string
  display: 'standalone'
  theme_color: string
  background_color: string
  prefer_related_applications: false
}

export const Route = createFileRoute('/manifest.webmanifest')({
  server: {
    handlers: {
      GET: ({ request }) =>
        new Response(JSON.stringify(buildManifest(request)), {
          headers: {
            'Cache-Control': `public, max-age=${manifestCacheMaxAge}`,
            'Content-Type': 'application/manifest+json; charset=utf-8',
          },
        }),
    },
  },
})

function buildManifest(request: Request): WebAppManifest {
  const url = new URL(request.url)
  const name = getSearchValue(url, 'name') || siteConfig.SITE_NAME
  const description =
    getSearchValue(url, 'description') ||
    'Play classic retro games directly in your browser. No downloads required.'
  const startUrl = normalizeStartUrl(getSearchValue(url, 'start_url'))

  return {
    short_name: name,
    name,
    description,
    icons: buildIcons(),
    id: startUrl,
    start_url: startUrl,
    scope: getScope(startUrl),
    display: 'standalone',
    theme_color: '#000000',
    background_color: '#ffffff',
    prefer_related_applications: false,
  }
}

function buildIcons() {
  return [
    {
      src: '/icon-192.png',
      sizes: '192x192',
      purpose: 'any maskable',
      type: 'image/png',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      purpose: 'any',
      type: 'image/png',
    },
  ]
}

function getSearchValue(url: URL, key: string) {
  return url.searchParams.get(key)?.trim() ?? ''
}

function normalizeStartUrl(value: string) {
  if (!value) {
    return '/'
  }

  try {
    const url = new URL(value, 'https://ggemu.local')

    return `${url.pathname}${url.search}${url.hash}` || '/'
  } catch {
    return '/'
  }
}

function getScope(startUrl: string) {
  const directory = startUrl.endsWith('/')
    ? startUrl
    : startUrl.slice(0, startUrl.lastIndexOf('/') + 1)

  return directory || '/'
}
