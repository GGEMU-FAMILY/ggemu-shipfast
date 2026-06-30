import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import type { FormEvent } from 'react'
import { useState } from 'react'

import { SiteLayout } from '#/components/site-layout'
import {
  type GameSearchSort,
  type GameSearchResult,
  type Locale,
  type PublicGame,
  searchGames,
} from '#/lib/ggemu'
import { formatCopy, getI18n, normalizeLocale } from '#/lib/i18n'
import { siteConfig } from '#/lib/site-config'

const platformOptions = [
  'Game Boy Advance',
  'NES',
  'SNES',
  'PS1',
  'N64',
  'Sega Genesis',
  'Genesis',
  'Arcade',
  'Nintendo DS',
  'Game Boy',
  'Game Boy Color',
  'Nintendo 64',
  'PlayStation',
  'PlayStation 1',
  'Master System',
  'Sega CD',
  'Neo Geo',
  'Atari',
  'MS-DOS',
  'HTML5',
  'FLASH',
  'Java',
]

const platformBadges: Record<string, string> = {
  'ARCADE': 'ARCADE',
  'Atari': 'ATARI',
  'Famicom': 'NES',
  'FLASH': 'FLASH',
  'HTML5': 'HTML5',
  'DOS': 'DOS',
  'Genesis': 'GENESIS',
  'Java': 'JAVA',
  'Game Boy': 'GB',
  'Game Boy Advance': 'GBA',
  'Game Boy Color': 'GBC',
  'Master System': 'SMS',
  'MS-DOS': 'DOS',
  'N64': 'N64',
  'Neo Geo': 'NEO',
  'NES': 'NES',
  'Nintendo 64': 'N64',
  'Nintendo DS': 'NDS',
  'PlayStation 1': 'PS1',
  'PS1': 'PS1',
  'Sega CD': 'SCD',
  'Sega Genesis': 'GEN',
  'Super Famicom': 'SNES',
}

const categoryOptions = [
  'Action',
  'Adventure',
  'Arcade',
  'Puzzle',
  'RPG',
  'Fighting',
  'Platformer',
  'Sports',
  'Racing',
  'Shooter',
  'Strategy',
  'Simulation',
  'Casual',
  'Word',
]

type Filters = {
  query: string
  platform: string
  category: string
  sort: GameSearchSort
}

type HomeCopy = ReturnType<typeof getI18n>['home']

type SearchFormProps = {
  filters: Filters
  isLoading: boolean
  mode: 'default' | 'sidebar'
  onFilterChange: <Key extends keyof Filters>(
    key: Key,
    value: Filters[Key],
  ) => void
  onQueryChange: (query: string) => void
  onReset: () => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
  t: HomeCopy
}

type GamesSectionProps = {
  games: Array<PublicGame>
  gridClassName: string
  isLoading: boolean
  lang: Locale
  onLoadPage: (page: number) => void
  page: number
  pages: number
  pagination: GameSearchResult['pagination']
  sectionClassName: string
  t: HomeCopy
}

type HomeTemplateProps = Omit<GamesSectionProps, 'gridClassName' | 'sectionClassName'> &
  Omit<SearchFormProps, 'mode'>

function getPlatformBadge(game: PublicGame) {
  const slug = game.platform_slug ?? game.platformSlug

  if (slug?.trim()) {
    return slug.trim().toUpperCase()
  }

  const platform = game.platform?.trim()

  if (!platform) {
    return ''
  }

  return platformBadges[platform] ?? platformBadges[platform.toUpperCase()] ?? platform
    .split(/[\s-]+/)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

export const Route = createFileRoute('/$locale')({
  head: ({ params }) => {
    const locale = normalizeLocale(params.locale)
    const meta = getI18n(locale).homeSeo

    return {
      meta: [
        { title: meta.title },
        { name: 'description', content: meta.description },
        { name: 'keywords', content: meta.keywords },
        { property: 'og:title', content: meta.title },
        { property: 'og:description', content: meta.description },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: meta.title },
        { name: 'twitter:description', content: meta.description },
      ],
    }
  },
  validateSearch: () => ({}),
  beforeLoad: ({ location, params }) => {
    if (location.pathname === `/${params.locale}` && location.searchStr) {
      throw redirect({
        params: { locale: params.locale },
        replace: true,
        to: '/$locale',
      })
    }
  },
  loader: ({ params }) =>
    searchGames({
      data: {
        query: '',
        locale: normalizeLocale(params.locale),
        page: 1,
        sort: 'newest',
      },
    }),
  component: LocalizedHomePage,
})

function LocalizedHomePage() {
  const { locale } = Route.useParams()
  const initialResult = Route.useLoaderData()
  const runSearch = useServerFn(searchGames)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const lang = normalizeLocale(locale)
  const t = getI18n(lang).home
  const [result, setResult] = useState<GameSearchResult>(initialResult)
  const [filters, setFilters] = useState<Filters>({
    query: '',
    platform: '',
    category: '',
    sort: 'newest',
  })
  const [isLoading, setIsLoading] = useState(false)
  const { games, pagination } = result
  const page = pagination.page
  const pages = Math.max(pagination.pages, 1)
  const templateProps = {
    filters,
    games,
    isLoading,
    lang,
    onFilterChange: updateFilter,
    onLoadPage: (nextPage: number) => loadGames(filters, nextPage),
    onQueryChange: (query: string) => {
      setFilters((current) => ({
        ...current,
        query,
      }))
    },
    onReset: resetFilters,
    onSearch: handleSearch,
    page,
    pages,
    pagination,
    t,
  }

  if (pathname !== `/${locale}`) {
    return <Outlet />
  }

  async function loadGames(nextFilters: Filters, nextPage: number) {
    setIsLoading(true)

    try {
      const nextResult = await runSearch({
        data: {
          query: nextFilters.query,
          locale: lang,
          page: nextPage,
          platform: nextFilters.platform,
          category: nextFilters.category,
          sort: nextFilters.sort,
        },
      })

      setResult(nextResult)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    loadGames(filters, 1)
  }

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    const nextFilters = { ...filters, [key]: value }
    setFilters(nextFilters)
    loadGames(nextFilters, 1)
  }

  function resetFilters() {
    const nextFilters = {
      query: '',
      platform: '',
      category: '',
      sort: 'newest',
    }

    setFilters(nextFilters)
    loadGames(nextFilters, 1)
  }

  if (siteConfig.template === 'two-column') {
    return (
      <SiteLayout locale={lang}>
        <TwoColumnHomeTemplate {...templateProps} />
      </SiteLayout>
    )
  }

  return (
    <SiteLayout locale={lang}>
      <DefaultHomeTemplate {...templateProps} />
    </SiteLayout>
  )
}

function DefaultHomeTemplate(props: HomeTemplateProps) {
  const { t } = props

  return (
    <>
      <section className="border-b border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-tight text-base-content sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-base-content/70 sm:text-lg">
              {t.subtitle}
            </p>
          </div>

          <SearchForm {...props} mode="default" />
        </div>
      </section>

      <GamesSection
        {...props}
        gridClassName="grid gap-4 sm:grid-cols-3 lg:grid-cols-5"
        sectionClassName="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8"
      />
    </>
  )
}

function TwoColumnHomeTemplate(props: HomeTemplateProps) {
  const { t } = props

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-8">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-box border border-base-300 bg-base-100 p-4">
          <h1 className="text-2xl font-semibold leading-tight text-base-content">
            {t.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-base-content/70">
            {t.subtitle}
          </p>
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-4">
          <SearchForm {...props} mode="sidebar" />
        </section>
      </aside>

      <GamesSection
        {...props}
        gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        sectionClassName="flex min-w-0 flex-col gap-5"
      />
    </section>
  )
}

function SearchForm({
  filters,
  isLoading,
  mode,
  onFilterChange,
  onQueryChange,
  onReset,
  onSearch,
  t,
}: SearchFormProps) {
  if (mode === 'sidebar') {
    return (
      <form className="flex flex-col gap-3" onSubmit={onSearch}>
        <input
          className="input input-bordered w-full"
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={t.searchPlaceholder}
          type="search"
          value={filters.query}
        />
        <button className="btn btn-primary w-full" disabled={isLoading} type="submit">
          <i className="ri-search-line" />
          {t.search}
        </button>
        <FilterSelects
          filters={filters}
          isLoading={isLoading}
          onFilterChange={onFilterChange}
          onReset={onReset}
          t={t}
        />
      </form>
    )
  }

  return (
    <form className="flex max-w-5xl flex-col gap-3" onSubmit={onSearch}>
      <div className="join w-full">
        <input
          className="input input-bordered join-item min-w-0 flex-1"
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={t.searchPlaceholder}
          type="search"
          value={filters.query}
        />
        <button className="btn btn-primary join-item" disabled={isLoading} type="submit">
          <i className="ri-search-line" />
          {t.search}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <FilterSelects
          filters={filters}
          isLoading={isLoading}
          onFilterChange={onFilterChange}
          onReset={onReset}
          t={t}
        />
      </div>
    </form>
  )
}

function FilterSelects({
  filters,
  isLoading,
  onFilterChange,
  onReset,
  t,
}: Omit<SearchFormProps, 'mode' | 'onQueryChange' | 'onSearch'>) {
  return (
    <>
      <select
        className="select select-bordered w-full"
        onChange={(event) => onFilterChange('platform', event.currentTarget.value)}
        value={filters.platform}
      >
        <option value="">{t.allPlatforms}</option>
        {platformOptions.map((platform) => (
          <option key={platform} value={platform}>
            {platform}
          </option>
        ))}
      </select>

      <select
        className="select select-bordered w-full"
        onChange={(event) => onFilterChange('category', event.currentTarget.value)}
        value={filters.category}
      >
        <option value="">{t.allCategories}</option>
        {categoryOptions.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        className="select select-bordered w-full"
        onChange={(event) =>
          onFilterChange('sort', event.currentTarget.value as GameSearchSort)
        }
        value={filters.sort}
      >
        <option value="newest">{t.newest}</option>
        <option value="popular">{t.popular}</option>
        <option value="oldest">{t.oldest}</option>
        <option value="name_asc">{t.nameAsc}</option>
      </select>

      <button
        className="btn btn-ghost"
        disabled={isLoading}
        onClick={onReset}
        type="button"
      >
        <i className="ri-refresh-line" />
        {t.reset}
      </button>
    </>
  )
}

function GamesSection({
  games,
  gridClassName,
  isLoading,
  lang,
  onLoadPage,
  page,
  pages,
  pagination,
  sectionClassName,
  t,
}: GamesSectionProps) {
  return (
    <section className={sectionClassName}>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold">{t.featured}</h2>
          <p className="text-sm text-base-content/60">
            {formatCopy(t.page, { page, pages })}
          </p>
        </div>
        <span className="text-sm text-base-content/60">
          {pagination.total} / {pagination.limit}
        </span>
      </div>

      {games.length > 0 ? (
        <div className={`${gridClassName} ${isLoading ? 'opacity-60' : ''}`}>
          {games.map((game) => (
            <GameCard game={game} key={game._id ?? game.url_slug} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="rounded-box border border-base-300 bg-base-100 p-12 text-center text-base-content/60">
          {t.empty}
        </div>
      )}

      <div className="join mx-auto pt-2">
        <button
          className={`btn join-item ${page <= 1 ? 'btn-disabled' : ''}`}
          disabled={isLoading || page <= 1}
          onClick={() => onLoadPage(Math.max(1, page - 1))}
          type="button"
        >
          <i className="ri-arrow-left-s-line" />
          {t.previous}
        </button>
        <button className="btn join-item btn-disabled">
          {formatCopy(t.page, { page, pages })}
        </button>
        <button
          className={`btn join-item ${page >= pages ? 'btn-disabled' : ''}`}
          disabled={isLoading || page >= pages}
          onClick={() => onLoadPage(Math.min(pages, page + 1))}
          type="button"
        >
          {t.next}
          <i className="ri-arrow-right-s-line" />
        </button>
      </div>
    </section>
  )
}

function GameCard({ game, lang }: { game: PublicGame; lang: Locale }) {
  const t = getI18n(lang).home
  const gameId = game.url_slug || game._id || ''
  const platformBadge = getPlatformBadge(game)

  return (
    <Link
      className="card card-compact group h-full overflow-hidden border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      params={{ gameId, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      <figure className="relative aspect-[4/3] bg-base-300">
        {game.game_cover ? (
          <img
            alt={game.name ?? 'Game cover'}
            className="h-full w-full object-cover"
            loading="lazy"
            src={game.game_cover}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base-content/40">
            Retro
          </div>
        )}
        {platformBadge ? (
          <span className="badge badge-primary badge-sm absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate border-0 shadow">
            {platformBadge}
          </span>
        ) : null}
        <span className="absolute inset-0 grid place-items-center bg-base-300/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-2xl text-primary-content shadow-lg">
            <i className="ri-play-fill" />
          </span>
        </span>
      </figure>
      <div className="card-body gap-2 p-3">
        <h3 className="line-clamp-2 min-h-11 text-sm font-semibold leading-snug">
          {game.name}
        </h3>
        <div className="mt-auto border-t border-base-300 pt-2 text-xs text-base-content/60">
          <i className="ri-play-circle-line mr-1" />
          {t.plays}: {game.plays_count ?? 0}
        </div>
      </div>
    </Link>
  )
}
