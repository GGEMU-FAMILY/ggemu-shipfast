import { createFileRoute } from '@tanstack/react-router'

import type { BlogPost, Locale, PublicGame } from '#/lib/ggemu'

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
  locale: Locale
  loc: string
  path: string
  changefreq?: 'daily' | 'weekly'
  lastmod?: string
  priority?: number
}

type GameSearchResponse = {
  success: true
  data: Array<PublicGame>
  pagination: {
    pages: number
  }
}

type BlogPostSearchResponse = {
  success: true
  blogPosts: Array<BlogPost>
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

  let games: Array<PublicGame> = []
  let blogPosts: Array<BlogPost> = []

  try {
    ;[games, blogPosts] = await Promise.all([
      fetchSitemapGames(),
      fetchSitemapBlogPosts(),
    ])
  } catch {
    if (sitemapCache) {
      return sitemapCache.xml
    }
  }

  const entries = buildSitemapEntries(origin, games, blogPosts)
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

async function fetchSitemapBlogPosts() {
  const firstPage = await fetchBlogPostsPage(1)
  const pageCount = Math.min(firstPage.pagination.pages, SITEMAP_MAX_PAGES)
  const blogPosts = [...firstPage.blogPosts]

  for (let page = 2; page <= pageCount; page += 1) {
    const result = await fetchBlogPostsPage(page)
    blogPosts.push(...result.blogPosts)
  }

  return dedupeBlogPosts(blogPosts)
}

async function fetchBlogPostsPage(page: number) {
  const params = new URLSearchParams({
    limit: String(SITEMAP_PAGE_SIZE),
    page: String(page),
  })

  const response = await fetch(`${GGEMU_API_BASE_URL}/api/blog-posts?${params}`)

  if (!response.ok) {
    throw new Error(`GGEMU blog sitemap request failed with ${response.status}`)
  }

  return response.json() as Promise<BlogPostSearchResponse>
}

function dedupeGames(games: Array<PublicGame>) {
  return dedupeByRouteId(games, getGameRouteId)
}

function dedupeBlogPosts(blogPosts: Array<BlogPost>) {
  return dedupeByRouteId(blogPosts, getBlogPostRouteId)
}

function dedupeByRouteId<T>(items: Array<T>, getRouteId: (item: T) => string) {
  const seen = new Set<string>()

  return items.filter((item) => {
    const id = getRouteId(item)

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

function getBlogPostRouteId(blogPost: BlogPost) {
  return blogPost.slug?.trim() || blogPost._id?.trim() || ''
}

function buildSitemapEntries(
  origin: string,
  games: Array<PublicGame>,
  blogPosts: Array<BlogPost>,
) {
  const entries: Array<SitemapEntry> = []

  for (const locale of locales) {
    entries.push({
      locale,
      loc: toAbsoluteLocalizedUrl(origin, locale, '/'),
      path: '/',
      changefreq: 'daily',
      priority: 1,
    })
    entries.push({
      locale,
      loc: toAbsoluteLocalizedUrl(origin, locale, '/about'),
      path: '/about',
      changefreq: 'weekly',
      priority: 0.4,
    })
    entries.push({
      locale,
      loc: toAbsoluteLocalizedUrl(origin, locale, '/privacy-policy'),
      path: '/privacy-policy',
      changefreq: 'weekly',
      priority: 0.3,
    })
    entries.push({
      locale,
      loc: toAbsoluteLocalizedUrl(origin, locale, '/terms-of-service'),
      path: '/terms-of-service',
      changefreq: 'weekly',
      priority: 0.3,
    })
    entries.push({
      locale,
      loc: toAbsoluteLocalizedUrl(origin, locale, '/blog'),
      path: '/blog',
      changefreq: 'weekly',
      priority: 0.7,
    })

    for (const game of games) {
      const gameId = encodeURIComponent(getGameRouteId(game))
      const path = `/games/${gameId}`

      entries.push({
        locale,
        loc: toAbsoluteLocalizedUrl(origin, locale, path),
        path,
        changefreq: 'weekly',
        priority: 0.8,
      })
    }

    for (const blogPost of blogPosts) {
      const blogPostId = encodeURIComponent(getBlogPostRouteId(blogPost))
      const path = `/blog/${blogPostId}`

      entries.push({
        locale,
        loc: toAbsoluteLocalizedUrl(origin, locale, path),
        path,
        changefreq: 'weekly',
        lastmod: blogPost.updated_at || blogPost.created_at,
        priority: 0.6,
      })
    }
  }

  return entries
}

function toAbsoluteLocalizedUrl(origin: string, locale: Locale, path: string) {
  return path === '/' ? `${origin}/${locale}` : `${origin}/${locale}${path}`
}

function buildSitemapXml(entries: Array<SitemapEntry>) {
  const urls = entries.map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${formatSitemapAlternateLinks(entry)}${formatOptionalTag('lastmod', entry.lastmod)}${formatOptionalTag('changefreq', entry.changefreq)}${formatOptionalTag('priority', entry.priority)}
  </url>`,
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`
}

function formatSitemapAlternateLinks(entry: SitemapEntry) {
  const origin = new URL(entry.loc).origin
  const links = [
    ...locales.map((locale) => ({
      href: toAbsoluteLocalizedUrl(origin, locale, entry.path),
      hrefLang: locale,
    })),
    {
      href: toAbsoluteLocalizedUrl(origin, 'en', entry.path),
      hrefLang: 'x-default',
    },
  ]

  return links
    .map(
      (link) => `
    <xhtml:link rel="alternate" hreflang="${escapeXml(link.hrefLang)}" href="${escapeXml(link.href)}" />`,
    )
    .join('')
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
