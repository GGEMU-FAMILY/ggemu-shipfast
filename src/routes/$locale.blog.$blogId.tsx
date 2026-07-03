import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { SiteLayout } from '#/components/site-layout'
import {
  getGameDetail,
  getBlogPostDetailPageData,
  type BlogPost,
  type Locale,
  type PublicGame,
} from '#/lib/ggemu'
import { getI18n, normalizeLocale } from '#/lib/i18n'

export const Route = createFileRoute('/$locale/blog/$blogId')({
  loader: async ({ params }) => {
    const detail = await getBlogPostDetailPageData({
      data: {
        id: params.blogId,
        locale: normalizeLocale(params.locale),
      },
    })

    return {
      ...detail,
      linkedGames: await loadLinkedGames(
        detail.blogPost.content || detail.blogPost.excerpt || '',
      ),
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {}
    }

    const locale = normalizeLocale(params.locale)
    const { blogPost, canonicalUrl } = loaderData
    const title = blogPost.title || getI18n(locale).blog.title
    const description = blogPost.excerpt || getI18n(locale).blog.description
    const image = blogPost.cover_image_url

    return {
      links: [{ rel: 'canonical', href: canonicalUrl }],
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: canonicalUrl },
        ...(image ? [{ property: 'og:image', content: image }] : []),
        { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        ...(image ? [{ name: 'twitter:image', content: image }] : []),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: serializeJsonLd(buildArticleStructuredData(blogPost, canonicalUrl)),
        },
      ],
    }
  },
  component: BlogDetailPage,
})

function BlogDetailPage() {
  const { blogPost, linkedGames } = Route.useLoaderData()
  const { locale } = Route.useParams()
  const lang = normalizeLocale(locale)
  const t = getI18n(lang).blog

  return (
    <SiteLayout locale={lang}>
      <section className="bg-base-100">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link params={{ locale: lang }} to="/$locale/blog">
                  {t.title}
                </Link>
              </li>
              <li>{blogPost.title}</li>
            </ul>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {t.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            {blogPost.title}
          </h1>
          <div className="mt-5 text-sm text-base-content/55">
            <span>{formatDate(blogPost.created_at, lang)}</span>
          </div>
        </header>

        {blogPost.cover_image_url ? (
          <div className="mt-8 overflow-hidden rounded-box border border-base-300 bg-base-200">
            <img
              alt={blogPost.title ?? 'Blog cover'}
              className="h-full w-full object-cover"
              src={blogPost.cover_image_url}
            />
          </div>
        ) : null}

        <div className="mt-10 space-y-6 text-base leading-8 text-base-content/75">
          {renderContent(
            blogPost.content || '',
            lang,
            linkedGames,
          )}
        </div>
      </article>
    </SiteLayout>
  )
}

async function loadLinkedGames(content: string) {
  const gameIds = Array.from(extractGgemuGameIds(content))
  const entries = await Promise.all(
    gameIds.map(async (gameId) => {
      const game = await getGameDetail({ data: { id: gameId } }).catch(() => null)

      return [gameId, game] as const
    }),
  )

  return Object.fromEntries(entries) as Record<string, PublicGame | null>
}

function extractGgemuGameIds(content: string) {
  const gameIds = new Set<string>()
  const pattern = /https?:\/\/ggemu\.com\/[^/\s]+\/game\/([^/?#\s]+)/g

  for (const match of content.matchAll(pattern)) {
    gameIds.add(decodeURIComponent(match[1]))
  }

  return gameIds
}

function renderContent(
  content: string,
  locale: Locale,
  linkedGames: Record<string, PublicGame | null>,
) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => renderBlock(block, index, locale, linkedGames))
}

function renderBlock(
  block: string,
  index: number,
  locale: Locale,
  linkedGames: Record<string, PublicGame | null>,
) {
  const image = block.match(/^!\[(?<alt>.*)]\((?<src>https?:\/\/[^)]+)\)$/)

  if (image?.groups) {
    return (
      <figure className="overflow-hidden rounded-box border border-base-300 bg-base-200" key={index}>
        <img
          alt={image.groups.alt || 'Blog image'}
          className="h-full w-full object-cover"
          loading="lazy"
          src={image.groups.src}
        />
      </figure>
    )
  }

  if (block.startsWith('### ')) {
    return (
      <h3 className="pt-3 text-2xl font-semibold text-base-content" key={index}>
        {block.slice(4)}
      </h3>
    )
  }

  if (block.startsWith('## ')) {
    return (
      <h2 className="pt-4 text-3xl font-semibold text-base-content" key={index}>
        {block.slice(3)}
      </h2>
    )
  }

  if (hasInternalGameLink(block)) {
    return (
      <div className="space-y-4" key={index}>
        {renderBlockWithGameCards(block, locale, linkedGames)}
      </div>
    )
  }

  return (
    <p className="whitespace-pre-line" key={index}>
      {renderInlineLinks(block, locale)}
    </p>
  )
}

function hasInternalGameLink(text: string) {
  return /https?:\/\/ggemu\.com\/[^/\s]+\/game\/[^/?#\s]+/.test(text)
}

function renderBlockWithGameCards(
  text: string,
  locale: Locale,
  linkedGames: Record<string, PublicGame | null>,
) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  const nodes: Array<ReactNode> = []
  let paragraphParts: Array<ReactNode> = []

  function flushParagraph() {
    if (paragraphParts.length === 0) {
      return
    }

    nodes.push(
      <p className="whitespace-pre-line" key={`text-${nodes.length}`}>
        {paragraphParts}
      </p>,
    )
    paragraphParts = []
  }

  parts.forEach((part, index) => {
    if (!part.startsWith('http')) {
      paragraphParts.push(part)
      return
    }

    const internalGameLink = getInternalGameLink(part, locale)

    if (!internalGameLink) {
      paragraphParts.push(renderExternalLink(part, index))
      return
    }

    flushParagraph()
    nodes.push(
      <LinkedGameCard
        game={linkedGames[internalGameLink.gameId]}
        gameId={internalGameLink.gameId}
        key={`game-${internalGameLink.gameId}-${index}`}
        locale={locale}
      />,
    )
  })

  flushParagraph()

  return nodes
}

function renderInlineLinks(text: string, locale: Locale) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)

  return parts.map((part, index) => {
    if (!part.startsWith('http')) {
      return part
    }

    const internalGameLink = getInternalGameLink(part, locale)

    if (internalGameLink) {
      return (
        <Link
          className="link link-primary"
          key={`${part}-${index}`}
          params={{
            gameId: internalGameLink.gameId,
            locale: internalGameLink.locale,
          }}
          to="/$locale/games/$gameId"
        >
          {internalGameLink.label}
        </Link>
      )
    }

    return (
      renderExternalLink(part, index)
    )
  })
}

function renderExternalLink(urlValue: string, index: number) {
  return (
    <a
      className="link link-primary"
      href={urlValue}
      key={`${urlValue}-${index}`}
      rel="noreferrer"
      target="_blank"
    >
      {urlValue}
    </a>
  )
}

function LinkedGameCard({
  game,
  gameId,
  locale,
}: {
  game: PublicGame | null | undefined
  gameId: string
  locale: Locale
}) {
  const title = game?.name?.trim() || gameId
  const description = game?.description?.trim()

  return (
    <Link
      className="group grid gap-4 rounded-box border border-base-300 bg-base-100 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg sm:grid-cols-[160px_1fr]"
      params={{ gameId, locale }}
      to="/$locale/games/$gameId"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-base-300">
        {game?.game_cover ? (
          <img
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            src={game.game_cover}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-base-content/45">
            Game
          </div>
        )}
      </div>
      <div className="min-w-0 self-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Game
        </p>
        <h3 className="mt-1 line-clamp-2 text-xl font-semibold leading-tight text-base-content">
          {title}
        </h3>
        {description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-base-content/65">
            {description}
          </p>
        ) : null}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Play now
          <i className="ri-arrow-right-line" />
        </span>
      </div>
    </Link>
  )
}

function getInternalGameLink(urlValue: string, locale: Locale) {
  try {
    const url = new URL(urlValue)

    if (url.hostname !== 'ggemu.com') {
      return undefined
    }

    const [, , routeType, gameId] = url.pathname.split('/')

    if (routeType !== 'game' || !gameId) {
      return undefined
    }

    return {
      gameId,
      label: `/${locale}/games/${gameId}`,
      locale,
    }
  } catch {
    return undefined
  }
}

function formatDate(value: string | undefined, locale: Locale) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function buildArticleStructuredData(blogPost: BlogPost, canonicalUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blogPost.title,
    description: blogPost.excerpt,
    image: blogPost.cover_image_url,
    datePublished: blogPost.created_at,
    dateModified: blogPost.updated_at,
    url: canonicalUrl,
  }
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
