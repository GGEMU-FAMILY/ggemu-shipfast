import { Link, createFileRoute } from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { getGameDeals } from '#/lib/game-deals.functions'
import {
  formatHistoricalLowPrice,
  isCurrentPriceHistoricalLow,
} from '#/lib/game-deals-price'
import {
  DEFAULT_DEAL_REGION,
  dealRegions,
  normalizeDealRegion,
  toDealRegionSearch,
  validateDealRegionSearch,
  type DealRegion,
} from '#/lib/game-deals-region'
import type { GameDeal } from '#/lib/game-deals.types'
import type { Locale } from '#/lib/ggemu'
import { getI18n, normalizeLocale } from '#/lib/i18n'
import { getLocalizedSeoLinks, getSeoOrigin } from '#/lib/seo'

export const Route = createFileRoute('/$locale/deals')({
  validateSearch: validateDealRegionSearch,
  loaderDeps: ({ search }) => ({
    region: normalizeDealRegion(search.region),
  }),
  loader: async ({ deps, params }) => {
    const locale = normalizeLocale(params.locale)
    const [seoOrigin, result] = await Promise.all([
      getSeoOrigin(),
      getGameDeals({ data: { locale, region: deps.region } }),
    ])

    return { ...result, region: deps.region, seoOrigin }
  },
  head: ({ loaderData, params }) => {
    const locale = normalizeLocale(params.locale)
    const t = getI18n(locale).deals
    const canonicalUrl = loaderData?.seoOrigin
      ? `${loaderData.seoOrigin}/${locale}/deals`
      : undefined
    const image = loaderData?.deals[0]?.image

    return {
      links: loaderData?.seoOrigin
        ? getLocalizedSeoLinks({
            locale,
            origin: loaderData.seoOrigin,
            path: '/deals',
          })
        : undefined,
      meta: [
        { title: t.seoTitle },
        { name: 'description', content: t.description },
        { property: 'og:title', content: t.seoTitle },
        { property: 'og:description', content: t.description },
        { property: 'og:type', content: 'website' },
        ...(canonicalUrl ? [{ property: 'og:url', content: canonicalUrl }] : []),
        { property: 'og:locale', content: toOpenGraphLocale(locale) },
        ...(image ? [{ property: 'og:image', content: image }] : []),
        { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: t.seoTitle },
        { name: 'twitter:description', content: t.description },
        ...(image ? [{ name: 'twitter:image', content: image }] : []),
        ...(loaderData?.region !== DEFAULT_DEAL_REGION
          ? [{ name: 'robots', content: 'noindex,follow' }]
          : []),
      ],
      scripts:
        canonicalUrl && loaderData
          ? [
              {
                type: 'application/ld+json',
                children: serializeJsonLd({
                  '@context': 'https://schema.org',
                  '@type': 'CollectionPage',
                  name: t.title,
                  description: t.description,
                  url: canonicalUrl,
                  inLanguage: locale,
                  mainEntity: {
                    '@type': 'ItemList',
                    numberOfItems: loaderData.deals.length,
                    itemListElement: loaderData.deals.map((deal, index) => ({
                      '@type': 'ListItem',
                      position: index + 1,
                      name: deal.name,
                      url: `${loaderData.seoOrigin}/${locale}/deals/steam/${deal.steamAppId}`,
                    })),
                  },
                }),
              },
            ]
          : undefined,
    }
  },
  component: GameDealsPage,
})

function GameDealsPage() {
  const { deals, region, updatedAt } = Route.useLoaderData()
  const lang = normalizeLocale(Route.useParams().locale)
  const navigate = Route.useNavigate()
  const t = getI18n(lang).deals
  const regionLabels: Record<DealRegion, string> = {
    us: t.regionUs,
    jp: t.regionJp,
    cn: t.regionCn,
    gb: t.regionGb,
    de: t.regionDe,
    th: t.regionTh,
  }

  return (
    <SiteLayout locale={lang}>
      <section className="border-b border-base-300 bg-base-200/45">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {t.updated.replace('{time}', formatUpdatedAt(updatedAt, lang))}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-base-content/70">
            {t.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-base-content/60">
            <label className="flex items-center gap-2" htmlFor="deal-region">
              <span className="whitespace-nowrap">{t.regionLabel}</span>
              <select
                className="select select-bordered select-sm min-w-44 bg-base-100 text-sm text-base-content"
                id="deal-region"
                onChange={(event) => {
                  const nextRegion = normalizeDealRegion(event.target.value)

                  void navigate({
                    search: (previous) => ({
                      ...previous,
                      ...toDealRegionSearch(nextRegion),
                    }),
                  })
                }}
                value={region}
              >
                {dealRegions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {regionLabels[option.code]} · {option.currency}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {deals.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {deals.map((deal) => (
              <GameDealCard
                deal={deal}
                key={deal.steamAppId}
                lang={lang}
                region={region}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-box border border-base-300 bg-base-100 p-10 text-center text-base-content/65">
            {t.empty}
          </div>
        )}

        <p className="mt-8 text-sm leading-6 text-base-content/55">
          {t.attribution}{' '}
          <a className="link" href="https://store.steampowered.com/" rel="noreferrer" target="_blank">
            Steam
          </a>
        </p>
      </section>
    </SiteLayout>
  )
}

function GameDealCard({
  deal,
  lang,
  region,
}: {
  deal: GameDeal
  lang: Locale
  region: DealRegion
}) {
  const t = getI18n(lang).deals
  const isHistoricalLow = isCurrentPriceHistoricalLow(deal)

  return (
    <Link
      className="group block h-full rounded-box focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      params={{ locale: lang, steamAppId: String(deal.steamAppId) }}
      preload="intent"
      search={toDealRegionSearch(region)}
      to="/$locale/deals/steam/$steamAppId"
    >
      <article
        className={`flex h-full flex-col overflow-hidden rounded-box border shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg ${
          isHistoricalLow
            ? 'border-warning bg-warning/5 ring-2 ring-warning/40 shadow-warning/20'
            : 'border-base-300 bg-base-100'
        }`}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-base-300">
          <img
            alt={deal.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            src={deal.image}
          />
          <span className="badge badge-error absolute left-3 top-3 border-0 font-semibold text-error-content">
            -{deal.discountPercent}%
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h2 className="line-clamp-2 min-h-11 text-lg font-semibold leading-tight">
            {deal.name}
          </h2>

          <div className="mt-4 flex min-h-8 items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                isHistoricalLow ? 'text-warning' : 'text-primary'
              }`}
            >
              {formatSteamPrice(deal.steamPrice, deal.steamCurrency, lang)}
            </span>
            {deal.originalPrice !== null ? (
              <span className="text-sm text-base-content/45 line-through">
                {formatSteamPrice(deal.originalPrice, deal.steamCurrency, lang)}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-base-content/50">{t.steamReference}</p>

          <dl className="mt-4 min-h-9 border-t border-base-300 pt-4 text-sm">
            {isHistoricalLow ? (
              <div className="flex items-center font-semibold text-warning">
                <dt className="sr-only">{t.historicalLowest}</dt>
                <dd className="flex items-center gap-1.5">
                  <i className="ri-fire-line" />
                  {t.historicalLowNow}
                </dd>
              </div>
            ) : (
              <PriceRow
                label={t.historicalLowest}
                value={formatHistoricalLowPrice(deal, lang, t.noData)}
              />
            )}
          </dl>

          <div className="mt-auto pt-5">
            <span
              className={`btn btn-sm w-full ${
                isHistoricalLow ? 'btn-warning' : 'btn-primary'
              }`}
            >
              {t.viewDetails}
              <i className="ri-arrow-right-line" />
            </span>
          </div>
        </div>
      </article>
    </Link>
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

function formatSteamPrice(value: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value / 100)
}

function formatUpdatedAt(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function toOpenGraphLocale(locale: Locale) {
  return locale === 'zh-CN' ? 'zh_CN' : locale === 'ja' ? 'ja_JP' : 'en_US'
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
