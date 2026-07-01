import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SiteFooter, SiteLayout } from '#/components/site-layout'
import {
  type GameSearchSort,
  type GameSearchResult,
  type Locale,
  type PublicGame,
  searchGames,
} from '#/lib/ggemu'
import { formatCopy, getHomeFaqs, getI18n, normalizeLocale } from '#/lib/i18n'
import {
  type SiteTemplate,
  getSiteTemplate,
  normalizeSiteTemplate,
  siteConfig,
} from '#/lib/site-config'
import { getSiteThemes, normalizeSiteTheme } from '#/lib/site-themes'

const DEFAULT_HOME_REQUEST_SIZE = 20
const POKI_REQUEST_SIZE = 100
const POKI_VISIBLE_GAME_COUNT = 60
const POKI_TILE_SIZE = 100
const POKI_TILE_GAP = 16
const POKI_LAYOUT_SEED_DAY_MS = 24 * 60 * 60 * 1000
const FEATURE_NEW_ARRIVAL_LIMIT = 7
const FEATURE_SECTION_LIMIT = 10

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

const localeOptions: Array<{ label: string; value: Locale }> = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
]

type Filters = {
  query: string
  platform: string
  category: string
  sort: GameSearchSort
}

type HomeSearch = {
  template?: SiteTemplate
}

type HomeCopy = ReturnType<typeof getI18n>['home']

type HomeLoaderData = GameSearchResult & {
  featureSections?: Array<FeatureSection>
  layoutSeed: number
}

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
  Omit<SearchFormProps, 'mode'> & {
    featureSections?: Array<FeatureSection>
    layoutSeed: number
  }

type PokiTileSize = 1 | 2 | 3

type PokiGameTile = {
  game: PublicGame
  size: PokiTileSize
}

type PokiPlacedTile = {
  colSpan: number
  rowSpan: number
}

type FeatureSection = {
  games: Array<PublicGame>
  hasHeroCard: boolean
  title: string
}

const pokiTileSizeClasses: Record<PokiTileSize, string> = {
  1: 'col-span-1 row-span-1',
  2: 'col-span-2 row-span-2',
  3: 'col-span-2 row-span-2 md:col-span-3 md:row-span-3',
}

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

function validateHomeSearch(search: Record<string, unknown>): HomeSearch {
  return {
    template: normalizeSiteTemplate(search.template),
  }
}

function getSearchTemplate(search: unknown) {
  if (!search || typeof search !== 'object') {
    return undefined
  }

  return normalizeSiteTemplate((search as Record<string, unknown>).template)
}

function parseHomeSearchStr(searchStr: string) {
  const searchParams = new URLSearchParams(searchStr)
  const template = normalizeSiteTemplate(searchParams.get('template'))

  return {
    hasTemplateOnly: Boolean(template) && Array.from(searchParams.keys()).length === 1,
    template,
  }
}

export const Route = createFileRoute('/$locale')({
  validateSearch: validateHomeSearch,
  headers: ({ match }) =>
    getSearchTemplate(match.search)
      ? {
          'X-Robots-Tag': 'noindex, nofollow',
        }
      : undefined,
  head: ({ params, match }) => {
    const locale = normalizeLocale(params.locale)
    const meta = getI18n(locale).homeSeo
    const isTemplatePreview = Boolean(getSearchTemplate(match.search))

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
        ...(isTemplatePreview
          ? [{ name: 'robots', content: 'noindex,nofollow' }]
          : []),
      ],
    }
  },
  beforeLoad: ({ location, params }) => {
    if (!location.searchStr || location.pathname !== `/${params.locale}`) {
      return undefined as never
    }

    const { hasTemplateOnly, template } = parseHomeSearchStr(location.searchStr)

    if (!hasTemplateOnly) {
      throw redirect({
        params: { locale: params.locale },
        replace: true,
        search: template ? { template } : {},
        to: '/$locale',
      })
    }

    return undefined as never
  },
  loaderDeps: ({ search }): HomeSearch => ({
    template: getSearchTemplate(search),
  }),
  loader: async ({ deps, params }): Promise<HomeLoaderData> => {
    const locale = normalizeLocale(params.locale)
    const template = getSiteTemplate(getSearchTemplate(deps))

    if (template === 'features') {
      const [newArrival, topPlays, topLikes, topViews] = await Promise.all([
        loadFeatureGames(locale, 'newest', FEATURE_NEW_ARRIVAL_LIMIT),
        loadFeatureGames(locale, 'popular'),
        loadFeatureGames(locale, 'likes'),
        loadFeatureGames(locale, 'views'),
      ])

      return {
        ...newArrival,
        featureSections: getFeatureSections({
          newArrival: newArrival.games,
          topLikes: topLikes.games,
          topPlays: topPlays.games,
          topViews: topViews.games,
        }),
        layoutSeed: getPokiDailyLayoutSeed(),
      }
    }

    const result = await searchGames({
      data: {
        query: '',
        limit: getHomeRequestLimit(),
        locale,
        page: 1,
        sort: 'newest',
      },
    })

    return {
      ...result,
      layoutSeed: getPokiDailyLayoutSeed(),
    }
  },
  component: LocalizedHomePage,
})

function LocalizedHomePage() {
  const { locale } = Route.useParams()
  const template = getSearchTemplate(Route.useSearch())
  const initialResult = Route.useLoaderData() as HomeLoaderData
  const runSearch = useServerFn(searchGames)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const lang = normalizeLocale(locale)
  const currentTemplate = getSiteTemplate(template)
  const t = getI18n(lang).home
  const [result, setResult] = useState<GameSearchResult>(initialResult)
  const [filters, setFilters] = useState<Filters>({
    query: '',
    platform: '',
    category: '',
    sort: 'newest',
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setResult(initialResult)
  }, [initialResult])

  const { games, pagination } = result
  const page = pagination.page
  const pages = Math.max(pagination.pages, 1)
  const isPokiLike = currentTemplate === 'poki-like'
  const isFeatures = currentTemplate === 'features'
  const templateProps = {
    filters,
    featureSections: initialResult.featureSections,
    games,
    isLoading,
    lang,
    layoutSeed: initialResult.layoutSeed,
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
          limit: getHomeRequestLimit(),
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
    const nextFilters: Filters = {
      query: '',
      platform: '',
      category: '',
      sort: 'newest',
    }

    setFilters(nextFilters)
    loadGames(nextFilters, 1)
  }

  if (isPokiLike) {
    return <PokiLikeHomeTemplate {...templateProps} />
  }

  if (isFeatures) {
    return <FeaturesHomeTemplate {...templateProps} />
  }

  if (currentTemplate === 'two-column') {
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

function PokiLikeHomeTemplate(props: HomeTemplateProps) {
  const {
    games,
    isLoading,
    lang,
    layoutSeed,
    t,
  } = props
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const tiles = useMemo(() => getPokiGameTiles(games, layoutSeed), [games, layoutSeed])
  const visibleTiles = useMemo(
    () => tiles.slice(0, POKI_VISIBLE_GAME_COUNT),
    [tiles],
  )
  const reserveTiles = useMemo(
    () => tiles.slice(POKI_VISIBLE_GAME_COUNT),
    [tiles],
  )
  const gridRef = useRef<HTMLDivElement>(null)
  const [fillerCount, setFillerCount] = useState(0)
  const fillerTiles = reserveTiles.slice(0, fillerCount)

  useEffect(() => {
    function updateFillerCount() {
      const grid = gridRef.current

      if (!grid) {
        return
      }

      setFillerCount(getPokiFillerCount(visibleTiles, grid))
    }

    updateFillerCount()

    const observer = new ResizeObserver(updateFillerCount)
    const grid = gridRef.current

    if (grid) {
      observer.observe(grid)
    }

    window.addEventListener('resize', updateFillerCount)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateFillerCount)
    }
  }, [visibleTiles])

  return (
    <main className="min-h-screen bg-primary/20 text-base-content">
      <section className="relative overflow-hidden px-3 py-3">
        <div
          className={`relative grid grid-flow-dense auto-rows-[100px] grid-cols-[repeat(auto-fill,100px)] justify-center gap-4 ${isLoading ? 'opacity-60' : ''}`}
          ref={gridRef}
        >
          <PokiControlTiles
            lang={lang}
            onToggleSearch={() => setIsSearchOpen((isOpen) => !isOpen)}
            t={t}
          />

          {visibleTiles.length > 0 ? (
            visibleTiles.map((tile, index) => (
              <PokiGameCard
                game={tile.game}
                key={`${tile.game._id ?? tile.game.url_slug ?? tile.game.name ?? 'game'}-${index}`}
                lang={lang}
                size={tile.size}
              />
            ))
          ) : (
            <div className="col-span-full grid min-h-[220px] place-items-center rounded-lg bg-base-100/70 p-8 text-center text-base-content/60 shadow">
              {t.empty}
            </div>
          )}

          {fillerTiles.map((tile, index) => (
            <PokiGameCard
              game={tile.game}
              key={`poki-reserve-${tile.game._id ?? tile.game.url_slug ?? tile.game.name ?? index}`}
              lang={lang}
              size={1}
            />
          ))}

        </div>
        <PokiSearchOverlay
          isOpen={isSearchOpen}
          lang={lang}
          onClose={() => setIsSearchOpen(false)}
          t={t}
        />
      </section>
      <HomeFaqSection lang={lang} />
      <SiteFooter locale={lang} />
    </main>
  )
}

function PokiControlTiles({
  lang,
  onToggleSearch,
  t,
}: {
  lang: Locale
  onToggleSearch: () => void
  t: HomeCopy
}) {
  const location = useRouterState({ select: (state) => state.location })
  const siteThemes = getSiteThemes()
  const [theme, setTheme] = useState('light')
  const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDetailsElement>(null)
  const localeMenuRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const storedTheme = normalizeSiteTheme(
      window.localStorage.getItem('retro-games-theme'),
    )
    setTheme(storedTheme)
    document.documentElement.dataset.theme = storedTheme
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        !localeMenuRef.current?.contains(target) &&
        !themeMenuRef.current?.contains(target)
      ) {
        setIsLocaleMenuOpen(false)
        setIsThemeMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  function handleLocaleChange(nextLocale: Locale) {
    setIsLocaleMenuOpen(false)

    const nextPath = location.pathname.replace(
      /^\/(zh-CN|en|ja)(?=\/|$)/,
      `/${nextLocale}`,
    )

    window.location.assign(nextPath)
  }

  function handleThemeChange(nextTheme: string) {
    setTheme(nextTheme)
    setIsThemeMenuOpen(false)
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem('retro-games-theme', nextTheme)
  }

  return (
    <div className="relative h-[100px] w-[100px] overflow-visible rounded-2xl bg-white shadow-lg">
      <Link
        aria-label={siteConfig.SITE_NAME}
        className="grid h-[60px] place-items-center border-b border-slate-200"
        params={{ locale: lang }}
        search={{}}
        to="/$locale"
      >
        <img
          alt={siteConfig.SITE_NAME}
          className="h-full max-h-[52px] w-full object-contain px-3 py-2"
          src="/logo.png"
        />
      </Link>

      <div className="grid h-[40px] grid-cols-3 divide-x divide-slate-200">
        <details
          className="dropdown"
          onToggle={(event) => setIsLocaleMenuOpen(event.currentTarget.open)}
          open={isLocaleMenuOpen}
          ref={localeMenuRef}
        >
          <summary
            className="grid h-[40px] cursor-pointer list-none place-items-center rounded-bl-2xl text-xl text-sky-600 transition hover:bg-sky-50"
            onClick={(event) => {
              event.preventDefault()
              setIsLocaleMenuOpen((isOpen) => !isOpen)
              setIsThemeMenuOpen(false)
            }}
          >
            <i className="ri-global-line" />
          </summary>
          <ul className="menu dropdown-content z-50 mt-2 w-40 rounded-box bg-base-100 p-2 shadow-xl">
            {localeOptions.map((option) => (
              <li key={option.value}>
                <button
                  className={option.value === lang ? 'active' : ''}
                  onClick={() => handleLocaleChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </details>

        <details
          className="dropdown"
          onToggle={(event) => setIsThemeMenuOpen(event.currentTarget.open)}
          open={isThemeMenuOpen}
          ref={themeMenuRef}
        >
          <summary
            className="grid h-[40px] cursor-pointer list-none place-items-center text-xl text-violet-600 transition hover:bg-violet-50"
            onClick={(event) => {
              event.preventDefault()
              setIsThemeMenuOpen((isOpen) => !isOpen)
              setIsLocaleMenuOpen(false)
            }}
          >
            <i className="ri-palette-line" />
          </summary>
          <ul className="menu dropdown-content z-50 mt-2 max-h-96 w-56 overflow-y-auto rounded-box bg-base-100 p-2 shadow-xl">
            {siteThemes.map((nextTheme) => (
              <li key={nextTheme}>
                <button
                  className={theme === nextTheme ? 'active' : ''}
                  onClick={() => handleThemeChange(nextTheme)}
                  type="button"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full bg-primary"
                    data-theme={nextTheme}
                  />
                  <span className="capitalize">{nextTheme}</span>
                </button>
              </li>
            ))}
          </ul>
        </details>

        <button
          aria-label={t.search}
          className="grid h-[40px] place-items-center rounded-br-2xl text-xl text-blue-600 transition hover:bg-blue-50"
          onClick={onToggleSearch}
          type="button"
        >
          <i className="ri-search-line" />
        </button>
      </div>

    </div>
  )
}

function PokiSearchOverlay({
  isOpen,
  lang,
  onClose,
  t,
}: {
  isOpen: boolean
  lang: Locale
  onClose: () => void
  t: HomeCopy
}) {
  const runSearch = useServerFn(searchGames)
  const [filters, setFilters] = useState<Filters>({
    query: '',
    platform: '',
    category: '',
    sort: 'newest',
  })
  const [result, setResult] = useState<GameSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchGamesList = result?.games ?? []

  async function searchOverlayGames(nextFilters: Filters) {
    setIsSearching(true)

    try {
      const nextResult = await runSearch({
        data: {
          query: nextFilters.query,
          limit: 24,
          locale: lang,
          page: 1,
          platform: nextFilters.platform,
          category: nextFilters.category,
          sort: nextFilters.sort,
        },
      })

      setResult(nextResult)
    } finally {
      setIsSearching(false)
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    searchOverlayGames(filters)
  }

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function resetSearch() {
    setFilters({
      query: '',
      platform: '',
      category: '',
      sort: 'newest',
    })
    setResult(null)
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(28rem,calc(100vw-1.5rem))] flex-col bg-base-100 shadow-2xl transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <header className="flex items-center justify-between border-b border-base-300 px-4 py-3">
          <h2 className="text-base font-semibold">{t.search}</h2>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose} type="button">
            <i className="ri-close-line text-xl" />
          </button>
        </header>

        <form className="grid gap-3 border-b border-base-300 p-4" onSubmit={handleSearch}>
          <input
            autoFocus={isOpen}
            className="input input-bordered w-full"
            onChange={(event) => updateFilter('query', event.currentTarget.value)}
            placeholder={t.searchPlaceholder}
            type="search"
            value={filters.query}
          />

          <FilterSelects
            filters={filters}
            isLoading={isSearching}
            onFilterChange={updateFilter}
            onReset={resetSearch}
            t={t}
          />

          <button className="btn btn-primary w-full" disabled={isSearching} type="submit">
            <i className="ri-search-line" />
            {t.search}
          </button>
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {result ? (
            searchGamesList.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {searchGamesList.map((game) => (
                  <PokiSearchResultCard
                    game={game}
                    key={game._id ?? game.url_slug ?? game.name}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-box border border-base-300 p-8 text-center text-sm text-base-content/60">
                {t.empty}
              </div>
            )
          ) : (
            <div className="rounded-box border border-dashed border-base-300 p-8 text-center text-sm text-base-content/60">
              {t.search}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

function PokiSearchResultCard({
  game,
  lang,
}: {
  game: PublicGame
  lang: Locale
}) {
  const gameId = game.url_slug || game._id || ''

  return (
    <Link
      className="group overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm transition hover:border-primary/40 hover:shadow-md"
      params={{ gameId, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      <div className="aspect-square bg-base-200">
        {game.game_cover ? (
          <img
            alt={game.name ?? 'Game cover'}
            className="h-full w-full object-cover"
            loading="lazy"
            src={game.game_cover}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-base-content/50">
            Retro
          </div>
        )}
      </div>
      <div className="p-2 text-[12px] font-medium leading-tight">
        <span className="line-clamp-2">{game.name}</span>
      </div>
    </Link>
  )
}

function DefaultHomeTemplate(props: HomeTemplateProps) {
  const { lang, t } = props

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

      <HomeFaqSection lang={lang} />
    </>
  )
}

function TwoColumnHomeTemplate(props: HomeTemplateProps) {
  const { lang, t } = props

  return (
    <>
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

      <HomeFaqSection lang={lang} />
    </>
  )
}

function FeaturesHomeTemplate({
  featureSections,
  games,
  isLoading,
  lang,
  t,
}: HomeTemplateProps) {
  const sections = featureSections ?? getFeatureSections({ newArrival: games })
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <SiteLayout
      headerActions={
        <button
          aria-label={t.search}
          className="btn btn-sm btn-ghost border border-base-300 px-3"
          onClick={() => setIsSearchOpen(true)}
          type="button"
        >
          <i className="ri-search-line text-lg" />
          <span className="hidden sm:inline">{t.search}</span>
        </button>
      }
      locale={lang}
    >
      <section className="overflow-hidden bg-base-200 text-base-content">
        <div
          className={`mx-auto flex max-w-7xl flex-col gap-7 px-4 py-5 sm:px-6 lg:px-8 ${isLoading ? 'opacity-60' : ''}`}
        >
          {sections.map((section) => (
            <FeatureGamesSection
              games={section.games}
              hasHeroCard={section.hasHeroCard}
              key={section.title}
              lang={lang}
              title={section.title}
            />
          ))}
        </div>
      </section>
      <HomeFaqSection lang={lang} />
      <PokiSearchOverlay
        isOpen={isSearchOpen}
        lang={lang}
        onClose={() => setIsSearchOpen(false)}
        t={t}
      />
    </SiteLayout>
  )
}

function FeatureGamesSection({
  games,
  hasHeroCard,
  lang,
  title,
}: {
  games: Array<PublicGame>
  hasHeroCard: boolean
  lang: Locale
  title: string
}) {
  if (games.length === 0) {
    return null
  }

  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-[22px] font-black leading-none tracking-normal sm:text-2xl">
          {title}
        </h2>
      </div>

      {hasHeroCard ? (
        <FeatureHeroGamesRow games={games} lang={lang} title={title} />
      ) : (
        <FeatureSmallGamesRow games={games} lang={lang} title={title} />
      )}
    </section>
  )
}

function FeatureHeroGamesRow({
  games,
  lang,
  title,
}: {
  games: Array<PublicGame>
  lang: Locale
  title: string
}) {
  const [heroGame, ...smallGames] = games
  const leadGames = smallGames.slice(0, 4)
  const remainingGames = smallGames.slice(4)

  if (!heroGame) {
    return null
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <FeatureGameCard game={heroGame} isHeroCard={true} lang={lang} />
      <div className="grid shrink-0 grid-cols-2 grid-rows-2 gap-3">
        {leadGames.map((game, index) => (
          <FeatureGameCard
            game={game}
            isHeroCard={false}
            key={`${title}-lead-${game._id ?? game.url_slug ?? game.name ?? index}`}
            lang={lang}
          />
        ))}
      </div>
      {remainingGames.length > 0 ? (
        <div className="grid shrink-0 grid-flow-col grid-rows-2 gap-3">
          {remainingGames.map((game, index) => (
            <FeatureGameCard
              game={game}
              isHeroCard={false}
              key={`${title}-rest-${game._id ?? game.url_slug ?? game.name ?? index}`}
              lang={lang}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function FeatureSmallGamesRow({
  games,
  lang,
  title,
}: {
  games: Array<PublicGame>
  lang: Locale
  title: string
}) {
  return (
    <div className="grid grid-flow-col grid-rows-2 gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {games.map((game, index) => (
        <FeatureGameCard
          game={game}
          isHeroCard={false}
          key={`${title}-${game._id ?? game.url_slug ?? game.name ?? index}`}
          lang={lang}
        />
      ))}
    </div>
  )
}

function FeatureGameCard({
  game,
  isHeroCard,
  lang,
}: {
  game: PublicGame
  isHeroCard: boolean
  lang: Locale
}) {
  const gameId = game.url_slug || game._id || ''
  const gameName = game.name?.trim() || 'Game'

  return (
    <Link
      className={`group relative aspect-[4/3] shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:z-10 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg ${isHeroCard ? 'w-[320px] sm:w-[520px]' : 'w-[154px] sm:w-[248px]'}`}
      params={{ gameId, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      {game.game_cover ? (
        <img
          alt={gameName}
          className="h-full w-full object-cover"
          loading="lazy"
          src={game.game_cover}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-base-300 text-sm font-semibold text-base-content/50">
          Retro
        </div>
      )}

      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10 text-sm font-black leading-tight text-white">
        <span className="line-clamp-2">{gameName}</span>
      </span>
    </Link>
  )
}

function HomeFaqSection({ lang }: { lang: Locale }) {
  const faq = getHomeFaqs(lang)

  return (
    <section className="border-t border-base-300 bg-base-100/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-base-content">{faq.title}</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/65">
            {faq.subtitle}
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          {faq.items.map((item) => (
            <article
              className="rounded-lg border border-base-300 bg-base-100 p-4"
              key={item.question}
            >
              <h3 className="text-sm font-semibold text-base-content">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-6 text-base-content/65">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function getHomeRequestLimit() {
  if (siteConfig.SITE_TEMPLATE === 'poki-like') {
    return POKI_REQUEST_SIZE
  }

  if (siteConfig.SITE_TEMPLATE === 'features') {
    return FEATURE_SECTION_LIMIT
  }

  return DEFAULT_HOME_REQUEST_SIZE
}

async function loadFeatureGames(
  locale: Locale,
  sort: GameSearchSort,
  limit = FEATURE_SECTION_LIMIT,
) {
  return searchGames({
    data: {
      limit,
      locale,
      page: 1,
      sort,
    },
  })
}

function getFeatureSections({
  newArrival,
  topLikes = newArrival,
  topPlays = newArrival,
  topViews = newArrival,
}: {
  newArrival: Array<PublicGame>
  topLikes?: Array<PublicGame>
  topPlays?: Array<PublicGame>
  topViews?: Array<PublicGame>
}): Array<FeatureSection> {
  return [
    {
      title: 'New Arrival',
      games: newArrival.slice(0, FEATURE_NEW_ARRIVAL_LIMIT),
      hasHeroCard: true,
    },
    {
      title: 'Top Plays',
      games: sortFeatureGames(topPlays, 'plays_count'),
      hasHeroCard: false,
    },
    {
      title: 'Top Likes',
      games: sortFeatureGames(topLikes, 'likes_count'),
      hasHeroCard: false,
    },
    {
      title: 'Top Views',
      games: sortFeatureGames(topViews, 'views_count'),
      hasHeroCard: false,
    },
  ]
}

function sortFeatureGames(games: Array<PublicGame>, key: keyof PublicGame) {
  return [...games]
    .sort((left, right) => getFeatureScore(right, key) - getFeatureScore(left, key))
    .slice(0, FEATURE_SECTION_LIMIT)
}

function getFeatureScore(game: PublicGame, key: keyof PublicGame) {
  const value = game[key]

  return typeof value === 'number' ? value : 0
}

function getPokiGameTiles(games: Array<PublicGame>, layoutSeed: number) {
  const sortedGames = [...games]
    .sort((left, right) => (
      getPokiLayoutHash(left, layoutSeed) - getPokiLayoutHash(right, layoutSeed)
    ))
  const tiles: Array<PokiGameTile> = []
  let smallTilesSinceLarge = 2

  for (const game of sortedGames) {
    const previousSize = tiles.at(-1)?.size
    const size = getPokiBalancedTileSize(
      game,
      layoutSeed,
      previousSize,
      smallTilesSinceLarge,
    )

    tiles.push({ game, size })

    if (size >= 2) {
      smallTilesSinceLarge = 0
    } else {
      smallTilesSinceLarge += 1
    }
  }

  return tiles
}

function getPokiFillerCount(tiles: Array<PokiGameTile>, grid: HTMLDivElement) {
  const columns = getPokiGridColumns(grid)

  if (columns <= 0 || tiles.length === 0) {
    return 0
  }

  const placedTiles = [
    { colSpan: 1, rowSpan: 1 },
    ...tiles.map((tile) => getPokiPlacedTile(tile.size)),
  ]
  const occupied: Array<Array<boolean>> = []
  let rowCount = 0

  for (const tile of placedTiles) {
    const nextRowCount = placePokiTile(occupied, columns, tile)
    rowCount = Math.max(rowCount, nextRowCount)
  }

  return countPokiEmptyCells(occupied, columns, rowCount)
}

function getPokiGridColumns(grid: HTMLDivElement) {
  const computedColumns = window.getComputedStyle(grid).gridTemplateColumns
  const columns = computedColumns.split(' ').filter(Boolean).length

  if (columns > 0) {
    return columns
  }

  return Math.max(
    1,
    Math.floor((grid.clientWidth + POKI_TILE_GAP) / (POKI_TILE_SIZE + POKI_TILE_GAP)),
  )
}

function getPokiPlacedTile(size: PokiTileSize): PokiPlacedTile {
  if (size === 3 && window.matchMedia('(min-width: 768px)').matches) {
    return { colSpan: 3, rowSpan: 3 }
  }

  if (size >= 2) {
    return { colSpan: 2, rowSpan: 2 }
  }

  return { colSpan: 1, rowSpan: 1 }
}

function placePokiTile(
  occupied: Array<Array<boolean>>,
  columns: number,
  tile: PokiPlacedTile,
) {
  const colSpan = Math.min(tile.colSpan, columns)
  const rowSpan = tile.rowSpan
  let row = 0

  while (true) {
    for (let column = 0; column <= columns - colSpan; column += 1) {
      if (canPlacePokiTile(occupied, column, row, colSpan, rowSpan)) {
        fillPokiTileCells(occupied, column, row, colSpan, rowSpan)
        return row + rowSpan
      }
    }

    row += 1
  }
}

function canPlacePokiTile(
  occupied: Array<Array<boolean>>,
  column: number,
  row: number,
  colSpan: number,
  rowSpan: number,
) {
  for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
    for (let colOffset = 0; colOffset < colSpan; colOffset += 1) {
      if (occupied[row + rowOffset]?.[column + colOffset]) {
        return false
      }
    }
  }

  return true
}

function fillPokiTileCells(
  occupied: Array<Array<boolean>>,
  column: number,
  row: number,
  colSpan: number,
  rowSpan: number,
) {
  for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
    const nextRow = row + rowOffset
    occupied[nextRow] ??= []

    for (let colOffset = 0; colOffset < colSpan; colOffset += 1) {
      occupied[nextRow][column + colOffset] = true
    }
  }
}

function countPokiEmptyCells(
  occupied: Array<Array<boolean>>,
  columns: number,
  rowCount: number,
) {
  let count = 0

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (!occupied[row]?.[column]) {
        count += 1
      }
    }
  }

  return count
}

function getPokiTileSize(game: PublicGame, layoutSeed: number): PokiTileSize {
  const hash = getPokiLayoutHash(game, layoutSeed)
  const bucket = hash % 12

  if (bucket === 0) {
    return 3
  }

  if (bucket <= 3) {
    return 2
  }

  return 1
}

function getPokiBalancedTileSize(
  game: PublicGame,
  layoutSeed: number,
  previousSize: PokiTileSize | undefined,
  smallTilesSinceLarge: number,
): PokiTileSize {
  const size = getPokiTileSize(game, layoutSeed)
  const hash = getPokiLayoutHash(game, layoutSeed + 17)

  if (size === 3 && previousSize === 3) {
    return 2
  }

  if (size >= 2 && smallTilesSinceLarge < 3 && hash % 5 !== 0) {
    return 1
  }

  return size
}

function getPokiDailyLayoutSeed(date = new Date()) {
  const utcDayStart = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  )

  return Math.floor(utcDayStart / POKI_LAYOUT_SEED_DAY_MS)
}

function getPokiLayoutHash(game: PublicGame, layoutSeed: number) {
  return mixPokiHash(getGameStableHash(game) ^ layoutSeed)
}

function mixPokiHash(value: number) {
  let hash = value >>> 0
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x7feb352d)
  hash ^= hash >>> 15
  hash = Math.imul(hash, 0x846ca68b)
  hash ^= hash >>> 16

  return hash >>> 0
}

function getGameStableHash(game: PublicGame) {
  const key = game._id || game.url_slug || game.name || ''
  let hash = 0

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0
  }

  return hash
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

function PokiGameCard({
  game,
  lang,
  size,
}: {
  game: PublicGame
  lang: Locale
  size: PokiTileSize
}) {
  const gameId = game.url_slug || game._id || ''
  const gameName = game.name?.trim() || 'Game'
  const videoRef = useRef<HTMLVideoElement>(null)

  function playPreviewVideo() {
    videoRef.current?.play().catch(() => {})
  }

  function stopPreviewVideo() {
    const video = videoRef.current

    if (!video) {
      return
    }

    video.pause()
    video.currentTime = 0
  }

  return (
    <Link
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg transition duration-200 hover:scale-[1.03] hover:shadow-2xl ${pokiTileSizeClasses[size]}`}
      onBlur={stopPreviewVideo}
      onFocus={playPreviewVideo}
      onMouseEnter={playPreviewVideo}
      onMouseLeave={stopPreviewVideo}
      params={{ gameId, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      {game.game_cover ? (
        <img
          alt={game.name ?? 'Game cover'}
          className="h-full w-full object-cover"
          loading="lazy"
          src={game.game_cover}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-base-200 text-sm font-semibold text-base-content/50">
          Retro
        </div>
      )}
      {game.game_video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          loop
          muted
          playsInline
          preload="none"
          ref={videoRef}
          src={game.game_video}
        />
      ) : null}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent px-2 pb-2 pt-8 text-[12px] font-semibold leading-tight text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="line-clamp-2">{gameName}</span>
      </span>
    </Link>
  )
}
