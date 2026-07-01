import {
  Await,
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import {
  getGameDetailPageData,
  getRelatedGamePageData,
  type Locale,
  type PublicGame,
} from '#/lib/ggemu'
import {
  buildGameDetailSeo,
  getGameDetailFaqs,
  getI18n,
  normalizeLocale,
} from '#/lib/i18n'

export const Route = createFileRoute('/$locale/games/$gameId')({
  beforeLoad: ({ location, params }) => {
    if (location.pathname.endsWith('/play') || !location.searchStr) {
      return
    }

    throw redirect({
      params,
      replace: true,
      to: '/$locale/games/$gameId',
    })
  },
  loader: async ({ params }) => {
    const detail = await getGameDetailPageData({
      data: { id: params.gameId, locale: normalizeLocale(params.locale) },
    })
    const currentId = getGameRouteId(detail.game) || params.gameId

    return {
      ...detail,
      relatedGamesPromise: getRelatedGamePageData({
        data: {
          category: detail.game.categories?.[0],
          currentId,
          developer: detail.game.developer,
        },
      }),
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {}
    }

    const { canonicalUrl, game } = loaderData
    const locale = normalizeLocale(params.locale)
    const seo = buildGameDetailSeo(game, locale)
    const image = game.game_cover
    const faqItems = getGameDetailFaqs(game, locale)
    const structuredData = buildGameStructuredData({
      canonicalUrl,
      faqItems,
      game,
      locale,
      seo,
    })

    return {
      links: [
        { rel: 'canonical', href: canonicalUrl },
        ...getAlternateLinks(canonicalUrl),
      ],
      meta: [
        { title: seo.title },
        { name: 'description', content: seo.description },
        { name: 'keywords', content: seo.keywords },
        { property: 'og:title', content: seo.title },
        { property: 'og:description', content: seo.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:locale', content: toOpenGraphLocale(locale) },
        ...(image ? [{ property: 'og:image', content: image }] : []),
        { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: seo.title },
        { name: 'twitter:description', content: seo.description },
        ...(image ? [{ name: 'twitter:image', content: image }] : []),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: serializeJsonLd(structuredData),
        },
      ],
    }
  },
  component: LocalizedGameDetailPage,
})

const supportedLocales = ['zh-CN', 'en', 'ja'] as const satisfies ReadonlyArray<Locale>

function getRelatedGames(
  relatedByCategory: Array<PublicGame>,
  relatedByDeveloper: Array<PublicGame>,
) {
  const seen = new Set<string>()

  return [...relatedByCategory, ...relatedByDeveloper]
    .filter((game) => {
      const id = getGameRouteId(game)

      if (!id || seen.has(id)) {
        return false
      }

      seen.add(id)
      return true
    })
    .slice(0, 6)
}

function getGameRouteId(game: PublicGame) {
  return game.url_slug?.trim() || game._id?.trim() || ''
}

function getAlternateLinks(canonicalUrl: string) {
  const url = new URL(canonicalUrl)
  const [, , ...restPath] = url.pathname.split('/')

  return [
    ...supportedLocales.map((locale) => ({
      rel: 'alternate',
      hrefLang: locale,
      href: `${url.origin}/${locale}/${restPath.join('/')}`,
    })),
    {
      rel: 'alternate',
      hrefLang: 'x-default',
      href: `${url.origin}/en/${restPath.join('/')}`,
    },
  ]
}

function toOpenGraphLocale(locale: Locale) {
  if (locale === 'zh-CN') {
    return 'zh_CN'
  }

  return locale
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function buildGameStructuredData({
  canonicalUrl,
  faqItems,
  game,
  locale,
  seo,
}: {
  canonicalUrl: string
  faqItems: ReturnType<typeof getGameDetailFaqs>
  game: PublicGame
  locale: Locale
  seo: ReturnType<typeof buildGameDetailSeo>
}) {
  const homeUrl = new URL(`/${locale}`, canonicalUrl).toString()
  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    '@id': `${canonicalUrl}#game`,
    name: game.name,
    description: seo.description,
    url: canonicalUrl,
    image: game.game_cover,
    gamePlatform: game.platform,
    applicationCategory: 'Game',
    genre: game.categories,
    inLanguage: game.languages,
    numberOfPlayers: game.players,
    publisher: game.developer
      ? {
          '@type': 'Organization',
          name: game.developer,
        }
      : undefined,
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: getI18n(locale).detail.home,
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: game.name,
        item: canonicalUrl,
      },
    ],
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return [removeEmptySchemaValues(gameSchema), breadcrumbSchema, faqSchema]
}

function removeEmptySchemaValues<T extends Record<string, unknown>>(schema: T) {
  return Object.fromEntries(
    Object.entries(schema).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }

      return value !== undefined && value !== ''
    }),
  )
}

function LocalizedGameDetailPage() {
  const { game, relatedGamesPromise } = Route.useLoaderData()
  const { gameId, locale } = Route.useParams()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const lang = normalizeLocale(locale)
  const t = getI18n(lang).detail
  const categories = game.categories ?? []
  const languages = game.languages ?? []
  const faqItems = getGameDetailFaqs(game, lang)

  if (pathname.endsWith('/play')) {
    return <Outlet />
  }

  return (
    <SiteLayout locale={lang}>
      <section className="bg-base-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link params={{ locale: lang }} search={{}} to="/$locale">
                  {t.home}
                </Link>
              </li>
              <li>{game.name}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-base-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(320px,440px)_1fr] lg:px-8">
          <div className="aspect-[4/3] self-start overflow-hidden rounded-box border border-base-300 bg-base-200 shadow-sm">
            {game.game_cover ? (
              <img
                alt={game.name ?? 'Game cover'}
                className="h-full w-full object-cover"
                src={game.game_cover}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-base-300 text-base-content/40">
                Retro
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="badge badge-success badge-outline gap-1">
                  <i className="ri-global-line" />
                  {t.browserReady}
                </span>
                <span className="badge badge-primary badge-outline gap-1">
                  <i className="ri-download-cloud-2-line" />
                  {t.noDownload}
                </span>
                {game.platform ? (
                  <span className="badge badge-primary gap-1">
                    <i className="ri-gamepad-line" />
                    {game.platform}
                  </span>
                ) : null}
              </div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
                {game.name}
              </h1>
              {game.description ? (
                <p className="mt-4 max-w-3xl text-base leading-7 text-base-content/70 sm:text-lg">
                  {game.description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className="btn btn-primary btn-lg px-8 text-primary-content hover:text-primary-content"
                href={`/${lang}/games/${gameId}/play`}
                rel="noreferrer"
                target="_blank"
              >
                <i className="ri-play-fill text-xl" />
                {t.play}
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 text-left sm:max-w-md">
              <Stat label={t.plays} value={game.plays_count ?? 0} />
              <Stat label={t.views} value={game.views_count ?? 0} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="flex flex-col gap-6">
          <ContentPanel title={t.overview} value={game.description} />
          <ContentPanel title={t.howToPlay} value={game.how_to_play} />
          <FaqSection items={faqItems} title={t.faq} />
          <Await promise={relatedGamesPromise} fallback={<RelatedGamesFallback title={t.relatedGames} />}>
            {(related) => (
              <RelatedGameSection
                games={getRelatedGames(
                  related.relatedByCategory,
                  related.relatedByDeveloper,
                )}
                lang={lang}
                title={t.relatedGames}
              />
            )}
          </Await>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.details}</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <Fact icon="ri-gamepad-line" label={t.platform} value={game.platform} />
              <Fact icon="ri-building-2-line" label={t.developer} value={game.developer} />
              <Fact icon="ri-calendar-line" label={t.released} value={game.released_year} />
              <Fact icon="ri-user-line" label={t.players} value={String(game.players ?? 1)} />
            </dl>
          </section>

          <TagSection emptyText={t.noData} items={categories} title={t.categories} />
          <TagSection emptyText={t.noData} items={languages} title={t.languages} />
        </aside>
      </section>
    </SiteLayout>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <div className="text-sm text-base-content/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

function ContentPanel({ title, value }: { title: string; value?: string }) {
  if (!value) {
    return null
  }

  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <i className="ri-file-text-line text-primary" />
        {title}
      </h2>
      <p className="mt-4 whitespace-pre-line leading-7 text-base-content/75">{value}</p>
    </section>
  )
}

function FaqSection({
  items,
  title,
}: {
  items: ReturnType<typeof getGameDetailFaqs>
  title: string
}) {
  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4">
        {items.map((item) => (
          <article key={item.question}>
            <h3 className="text-base font-semibold">{item.question}</h3>
            <p className="mt-2 leading-7 text-base-content/75">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function RelatedGameSection({
  games,
  lang,
  title,
}: {
  games: Array<PublicGame>
  lang: Locale
  title: string
}) {
  if (games.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <RelatedGameCard game={game} key={game.url_slug ?? game._id} lang={lang} />
        ))}
      </div>
    </section>
  )
}

function RelatedGamesFallback({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm"
            key={index}
          >
            <div className="aspect-[4/3] animate-pulse bg-base-300" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-4/5 animate-pulse rounded bg-base-300" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-base-300" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RelatedGameCard({ game, lang }: { game: PublicGame; lang: Locale }) {
  const gameId = game.url_slug || game._id || ''

  if (!gameId) {
    return null
  }

  return (
    <Link
      className="group overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      params={{ gameId, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      <div className="aspect-[4/3] bg-base-300">
        {game.game_cover ? (
          <img
            alt={game.name ?? 'Game cover'}
            className="h-full w-full object-cover"
            loading="lazy"
            src={game.game_cover}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-base-content/40">
            Retro
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">
          {game.name}
        </h3>
        {game.platform ? (
          <p className="mt-2 truncate text-xs text-base-content/60">{game.platform}</p>
        ) : null}
      </div>
    </Link>
  )
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-base-300 pb-3 last:border-0 last:pb-0">
      <dt className="flex items-center gap-2 text-base-content/55">
        <i className={icon} />
        {label}
      </dt>
      <dd className="text-right font-medium">{value || '-'}</dd>
    </div>
  )
}

function TagSection({
  emptyText,
  items,
  title,
}: {
  emptyText: string
  items: Array<string>
  title: string
}) {
  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <i className="ri-price-tag-3-line text-primary" />
        {title}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span className="badge badge-outline" key={item}>
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-base-content/50">{emptyText}</span>
        )}
      </div>
    </section>
  )
}
