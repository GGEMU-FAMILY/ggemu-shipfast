import { createFileRoute, Link, notFound } from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { getGameDealDetail } from '#/lib/game-deals.functions'
import {
  formatHistoricalLowPrice,
  isCurrentPriceHistoricalLow,
} from '#/lib/game-deals-price'
import {
  DEFAULT_DEAL_REGION,
  normalizeDealRegion,
  toDealRegionSearch,
  validateDealRegionSearch,
} from '#/lib/game-deals-region'
import type { GameDealDetail } from '#/lib/game-deals.types'
import type { Locale } from '#/lib/ggemu'
import { getI18n, normalizeLocale } from '#/lib/i18n'
import { getLocalizedSeoLinks, getSeoOrigin } from '#/lib/seo'

export const Route = createFileRoute('/$locale/deals_/steam/$steamAppId')({
  validateSearch: validateDealRegionSearch,
  loaderDeps: ({ search }) => ({
    region: normalizeDealRegion(search.region),
  }),
  loader: async ({ deps, params }) => {
    const locale = normalizeLocale(params.locale)
    const steamAppId = Number(params.steamAppId)
    const [seoOrigin, result] = await Promise.all([
      getSeoOrigin(),
      getGameDealDetail({ data: { locale, region: deps.region, steamAppId } }),
    ])

    if (!result) {
      throw notFound()
    }

    return { ...result, region: deps.region, seoOrigin }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {}
    }

    const locale = normalizeLocale(params.locale)
    const t = getI18n(locale).deals
    const { game } = loaderData
    const path = `/deals/steam/${game.steamAppId}`
    const canonicalUrl = `${loaderData.seoOrigin}/${locale}${path}`
    const price = formatSteamPrice(
      game.steamPrice,
      game.steamCurrency,
      locale,
      t.noData,
      t.free,
    )
    const historicalLow = formatHistoricalLowPrice(game, locale, t.noData)
    const title = fillSeoTemplate(t.detailSeoTitle, {
      name: game.name,
    })
    const description = fillSeoTemplate(t.detailSeoDescription, {
      discount: String(game.discountPercent),
      historicalLow,
      name: game.name,
      price,
    })

    return {
      links: getLocalizedSeoLinks({
        locale,
        origin: loaderData.seoOrigin,
        path,
      }),
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'product' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:locale', content: toOpenGraphLocale(locale) },
        { property: 'og:image', content: game.image },
        ...(game.steamPrice !== null
          ? [
              {
                property: 'product:price:amount',
                content: toPriceAmount(game.steamPrice),
              },
              {
                property: 'product:price:currency',
                content: game.steamCurrency,
              },
            ]
          : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: game.image },
        ...(loaderData.region !== DEFAULT_DEAL_REGION
          ? [{ name: 'robots', content: 'noindex,follow' }]
          : []),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: serializeJsonLd(
            buildDealStructuredData({
              canonicalUrl,
              description,
              game,
              locale,
            }),
          ),
        },
      ],
    }
  },
  notFoundComponent: DealNotFound,
  component: SteamDealDetailPage,
})

function SteamDealDetailPage() {
  const { game, region, updatedAt } = Route.useLoaderData()
  const lang = normalizeLocale(Route.useParams().locale)
  const t = getI18n(lang).deals

  return (
    <SiteLayout locale={lang}>
      <main className="bg-base-200/45">
        <section className="border-b border-base-300 bg-base-100">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="breadcrumbs mb-6 text-sm text-base-content/60">
              <ul>
                <li>
                  <Link
                    params={{ locale: lang }}
                    search={toDealRegionSearch(region)}
                    to="/$locale/deals"
                  >
                    {t.backToDeals}
                  </Link>
                </li>
                <li>{game.name}</li>
              </ul>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="grid gap-7 md:grid-cols-[minmax(16rem,28rem)_minmax(0,1fr)] md:items-start">
                <img
                  alt={game.name}
                  className="aspect-[460/215] w-full rounded-box bg-base-300 object-cover shadow-lg"
                  src={game.image}
                />

                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">Steam</span>
                    {game.discountPercent > 0 ? (
                      <span className="badge badge-error border-0 font-semibold text-error-content">
                        -{game.discountPercent}%
                      </span>
                    ) : null}
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                    {game.name}
                  </h1>
                  <p className="mt-5 leading-7 text-base-content/70">
                    {game.description || t.noData}
                  </p>
                  {game.genres.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {game.genres.map((genre) => (
                        <span className="badge badge-primary badge-outline" key={genre}>
                          {genre}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <PricePanel game={game} lang={lang} />
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
          <div className="grid gap-8">
            <section className="rounded-box border border-base-300 bg-base-100 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold">{t.overview}</h2>
              <p className="mt-4 leading-7 text-base-content/70">
                {game.description || t.noData}
              </p>
            </section>

            {game.screenshots.length > 0 ? (
              <section className="rounded-box border border-base-300 bg-base-100 p-6 sm:p-8">
                <h2 className="text-2xl font-semibold">{t.screenshots}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {game.screenshots.slice(0, 6).map((screenshot) => (
                    <img
                      alt={`${game.name} ${t.screenshots} ${screenshot.id + 1}`}
                      className="aspect-video w-full rounded-box bg-base-300 object-cover"
                      key={screenshot.id}
                      loading="lazy"
                      src={screenshot.thumbnail}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <section className="rounded-box border border-base-300 bg-base-100 p-6 lg:self-start">
            <h2 className="text-xl font-semibold">{t.gameInfo}</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <InfoRow
                label={t.developer}
                value={joinOrFallback(game.developers, t.noData)}
              />
              <InfoRow
                label={t.publisher}
                value={joinOrFallback(game.publishers, t.noData)}
              />
              <InfoRow label={t.releaseDate} value={game.releaseDate || t.noData} />
              <InfoRow
                label={t.genres}
                value={joinOrFallback(game.genres, t.noData)}
              />
              <InfoRow
                label={t.platforms}
                value={joinOrFallback(game.platforms, t.noData)}
              />
              <InfoRow
                label={t.languages}
                value={game.supportedLanguages || t.noData}
              />
            </dl>
          </section>

          <p className="text-xs text-base-content/50 lg:col-span-2">
            {t.updated.replace('{time}', formatUpdatedAt(updatedAt, lang))} ·{' '}
            {t.attribution} Steam
          </p>
        </div>
      </main>
    </SiteLayout>
  )
}

function PricePanel({
  game,
  lang,
}: {
  game: GameDealDetail
  lang: Locale
}) {
  const t = getI18n(lang).deals
  const isHistoricalLow = isCurrentPriceHistoricalLow(game)

  return (
    <aside
      className={`rounded-box border p-6 shadow-sm ${
        isHistoricalLow
          ? 'border-warning bg-warning/10 ring-2 ring-warning/40 shadow-warning/20'
          : 'border-base-300 bg-base-200/50'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t.priceSummary}</h2>
        {isHistoricalLow ? (
          <span className="badge badge-warning border-0 font-semibold text-warning-content">
            <i className="ri-fire-line" />
            {t.historicalLowNow}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        <span
          className={`text-3xl font-bold ${
            isHistoricalLow ? 'text-warning' : 'text-primary'
          }`}
        >
          {formatSteamPrice(game.steamPrice, game.steamCurrency, lang, t.noData, t.free)}
        </span>
        {game.originalPrice !== null && game.originalPrice !== game.steamPrice ? (
          <span className="text-sm text-base-content/45 line-through">
            {formatSteamPrice(
              game.originalPrice,
              game.steamCurrency,
              lang,
              t.noData,
              t.free,
            )}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-base-content/50">{t.steamReference}</p>

      {!isHistoricalLow ? (
        <dl className="mt-5 border-y border-base-300 py-5 text-sm">
          <PriceRow
            label={t.historicalLowest}
            value={formatHistoricalLowPrice(game, lang, t.noData)}
          />
        </dl>
      ) : null}

      <div className="mt-5 grid gap-3">
        <a
          className={`btn ${isHistoricalLow ? 'btn-warning' : 'btn-primary'}`}
          href={game.steamUrl}
          rel="noreferrer"
          target="_blank"
        >
          {t.buyOnSteam}
          <i className="ri-external-link-line" />
        </a>
      </div>
    </aside>
  )
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-base-content/60">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function DealNotFound() {
  const lang = normalizeLocale(Route.useParams().locale)
  const region = normalizeDealRegion(Route.useSearch().region)
  const t = getI18n(lang).deals

  return (
    <SiteLayout locale={lang}>
      <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <i className="ri-gamepad-line text-5xl text-base-content/30" />
        <p className="mt-5 text-lg text-base-content/70">{t.notFound}</p>
        <Link
          className="btn btn-primary mt-8"
          params={{ locale: lang }}
          search={toDealRegionSearch(region)}
          to="/$locale/deals"
        >
          {t.backToDeals}
        </Link>
      </main>
    </SiteLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-base-content/55">{label}</dt>
      <dd className="mt-1 leading-6">{value}</dd>
    </div>
  )
}

function formatSteamPrice(
  value: number | null,
  currency: string,
  locale: Locale,
  fallback: string,
  freeLabel: string,
) {
  if (value === null) {
    return fallback
  }

  if (value === 0) {
    return freeLabel
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value / 100)
}

function joinOrFallback(values: Array<string>, fallback: string) {
  return values.length > 0 ? values.join(', ') : fallback
}

function formatUpdatedAt(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function fillSeoTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  )
}

function buildDealStructuredData({
  canonicalUrl,
  description,
  game,
  locale,
}: {
  canonicalUrl: string
  description: string
  game: GameDealDetail
  locale: Locale
}) {
  const images = [game.image, ...game.screenshots.map((item) => item.image)].slice(0, 7)
  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#game`,
    additionalType: 'https://schema.org/VideoGame',
    name: game.name,
    description: game.description || description,
    image: images,
    sku: `steam-${game.steamAppId}`,
    category: 'Video Game',
    genre: game.genres,
    gamePlatform: game.platforms,
    inLanguage: locale,
    brand: game.publishers[0]
      ? { '@type': 'Brand', name: game.publishers[0] }
      : undefined,
    offers:
      game.steamPrice !== null
        ? {
            '@type': 'Offer',
            url: game.steamUrl,
            price: toPriceAmount(game.steamPrice),
            priceCurrency: game.steamCurrency,
            availability: 'https://schema.org/OnlineOnly',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: 'Steam' },
          }
        : undefined,
  }
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: getI18n(locale).deals.title,
        item: new URL(`/${locale}/deals`, canonicalUrl).toString(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: game.name,
        item: canonicalUrl,
      },
    ],
  }

  return [removeEmptySchemaValues(product), breadcrumbs]
}

function removeEmptySchemaValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (Array.isArray(item)) {
        return item.length > 0
      }

      return item !== undefined && item !== ''
    }),
  )
}

function toPriceAmount(value: number | null) {
  return value === null ? '' : (value / 100).toFixed(2)
}

function toOpenGraphLocale(locale: Locale) {
  return locale === 'zh-CN' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : 'en_US'
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
