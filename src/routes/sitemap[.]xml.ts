import { createFileRoute } from '@tanstack/react-router'

import type { Locale, PublicGame } from '#/lib/ggemu'

const GGEMU_API_BASE_URL = 'https://ggemu.com'
const SITEMAP_PAGE_SIZE = 100
const SITEMAP_MAX_PAGES = 50
const SITEMAP_CACHE_TTL_MS = 1000 * 60 * 60 * 24
const locales = ['zh-CN', 'en', 'ja'] as const satisfies ReadonlyArray<Locale>

let sitemapCache: {
  expiresAt: number
  xml: string
} | null = null

type SitemapEntry = {
  loc: string
  changefreq?: 'daily' | 'weekly'
  priority?: number
}

type GameSearchResponse = {
  success: true
  data: Array<PublicGame>
  pagination: {
    pages: number
  }
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const xml = await getSitemapXml(origin)

        return new Response(xml, {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400',
            'Content-Type': 'application/xml; charset=utf-8',
          },
        })
      },
    },
  },
})

async function getSitemapXml(origin: string) {
  if (sitemapCache && sitemapCache.expiresAt > Date.now()) {
    return sitemapCache.xml
  }

  const games = await fetchSitemapGames().catch(() => [])
  const entries = buildSitemapEntries(origin, games)
  const xml = buildSitemapXml(entries)

  sitemapCache = {
    expiresAt: Date.now() + SITEMAP_CACHE_TTL_MS,
    xml,
  }

  return xml
}

async function fetchSitemapGames() {
  const firstPage = await fetchGamesPage(1)
  const pageCount = Math.min(firstPage.pagination.pages, SITEMAP_MAX_PAGES)
  const games = [...firstPage.data]

  for (let page = 2; page <= pageCount; page += 1) {
    const result = await fetchGamesPage(page)
    games.push(...result.data)
  }

  return dedupeGames(games)
}

async function fetchGamesPage(page: number) {
  const params = new URLSearchParams({
    is_gcoin_game: '0',
    limit: String(SITEMAP_PAGE_SIZE),
    page: String(page),
    play_online: '1',
    sort: 'newest',
  })

  const response = await fetch(`${GGEMU_API_BASE_URL}/api/games/search?${params}`)

  if (!response.ok) {
    throw new Error(`GGEMU sitemap request failed with ${response.status}`)
  }

  return response.json() as Promise<GameSearchResponse>
}

function dedupeGames(games: Array<PublicGame>) {
  const seen = new Set<string>()

  return games.filter((game) => {
    const id = getGameRouteId(game)

    if (!id || seen.has(id)) {
      return false
    }

    seen.add(id)
    return true
  })
}

function getGameRouteId(game: PublicGame) {
  return game.url_slug?.trim() || game._id?.trim() || ''
}

function buildSitemapEntries(origin: string, games: Array<PublicGame>) {
  const entries: Array<SitemapEntry> = []

  for (const locale of locales) {
    entries.push({
      loc: toAbsoluteUrl(origin, `/${locale}`),
      changefreq: 'daily',
      priority: 1,
    })
    entries.push({
      loc: toAbsoluteUrl(origin, `/${locale}/about`),
      changefreq: 'weekly',
      priority: 0.4,
    })
    entries.push({
      loc: toAbsoluteUrl(origin, `/${locale}/privacy-policy`),
      changefreq: 'weekly',
      priority: 0.3,
    })
    entries.push({
      loc: toAbsoluteUrl(origin, `/${locale}/terms-of-service`),
      changefreq: 'weekly',
      priority: 0.3,
    })

    for (const game of games) {
      const gameId = encodeURIComponent(getGameRouteId(game))

      entries.push({
        loc: toAbsoluteUrl(origin, `/${locale}/games/${gameId}`),
        changefreq: 'weekly',
        priority: 0.8,
      })
    }
  }

  return entries
}

function toAbsoluteUrl(origin: string, path: string) {
  return `${origin}${path}`
}

function buildSitemapXml(entries: Array<SitemapEntry>) {
  const urls = entries.map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${formatOptionalTag('changefreq', entry.changefreq)}${formatOptionalTag('priority', entry.priority)}
  </url>`,
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

function formatOptionalTag(name: string, value: string | number | undefined) {
  if (value === undefined) {
    return ''
  }

  return `
    <${name}>${escapeXml(String(value))}</${name}>`
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
