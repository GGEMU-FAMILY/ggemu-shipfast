import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { getGameDetail } from '#/lib/ggemu'
import { buildGameDetailSeo, getI18n, normalizeLocale } from '#/lib/i18n'

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
  loader: ({ params }) => getGameDetail({ data: { id: params.gameId } }),
  head: ({ loaderData, params }) => {
    const game = loaderData
    const locale = normalizeLocale(params.locale)
    const seo = buildGameDetailSeo(game, locale)
    const image = game.game_cover

    return {
      meta: [
        { title: seo.title },
        { name: 'description', content: seo.description },
        { name: 'keywords', content: seo.keywords },
        { property: 'og:title', content: seo.title },
        { property: 'og:description', content: seo.description },
        { property: 'og:type', content: 'article' },
        ...(image ? [{ property: 'og:image', content: image }] : []),
        { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: seo.title },
        { name: 'twitter:description', content: seo.description },
        ...(image ? [{ name: 'twitter:image', content: image }] : []),
      ],
    }
  },
  component: LocalizedGameDetailPage,
})

function LocalizedGameDetailPage() {
  const game = Route.useLoaderData()
  const { gameId, locale } = Route.useParams()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const lang = normalizeLocale(locale)
  const t = getI18n(lang).detail
  const categories = game.categories ?? []
  const languages = game.languages ?? []

  if (pathname.endsWith('/play')) {
    return <Outlet />
  }

  return (
    <SiteLayout locale={lang}>
      <section className="border-b border-base-300 bg-base-100">
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
          <div className="overflow-hidden rounded-box border border-base-300 bg-base-200 shadow-sm">
            {game.game_cover ? (
              <img
                alt={game.name ?? 'Game cover'}
                className="aspect-[4/3] w-full object-cover"
                src={game.game_cover}
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-base-300 text-base-content/40">
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

            <div className="stats stats-vertical overflow-hidden rounded-box border border-base-300 bg-base-200 sm:stats-horizontal">
              <Stat icon="ri-play-circle-line" label={t.plays} value={game.plays_count ?? 0} />
              <Stat icon="ri-eye-line" label={t.views} value={game.views_count ?? 0} />
              <Stat icon="ri-user-smile-line" label={t.players} value={game.players ?? 1} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="flex flex-col gap-6">
          <ContentPanel title={t.overview} value={game.description} />
          <ContentPanel title={t.howToPlay} value={game.how_to_play} />
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
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: number
}) {
  return (
    <div className="stat">
      <div className="stat-title flex items-center gap-2">
        <i className={icon} />
        {label}
      </div>
      <div className="stat-value text-2xl">{value}</div>
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
