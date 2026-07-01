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
import { formatCopy, getI18n, normalizeLocale } from '#/lib/i18n'
import { siteConfig } from '#/lib/site-config'
import { normalizeSiteTheme, siteThemes } from '#/lib/site-themes'

const POKI_REQUEST_SIZE = 100
const POKI_VISIBLE_GAME_COUNT = 60
const POKI_TILE_SIZE = 100
const POKI_TILE_GAP = 12

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

type PokiTileSize = 1 | 2 | 3

type PokiGameTile = {
  game: PublicGame
  size: PokiTileSize
}

type PokiPlacedTile = {
  colSpan: number
  rowSpan: number
}

const pokiTileSizeClasses: Record<PokiTileSize, string> = {
  1: 'col-span-1 row-span-1',
  2: 'col-span-1 row-span-1 sm:col-span-2 sm:row-span-2',
  3: 'col-span-1 row-span-1 md:col-span-3 md:row-span-3',
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
        limit: siteConfig.SITE_TEMPLATE === 'poki-like' ? POKI_REQUEST_SIZE : undefined,
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
  const isPokiLike = siteConfig.SITE_TEMPLATE === 'poki-like'
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
          limit: isPokiLike ? POKI_REQUEST_SIZE : undefined,
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

  if (isPokiLike) {
    return <PokiLikeHomeTemplate {...templateProps} />
  }

  if (siteConfig.SITE_TEMPLATE === 'two-column') {
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
    filters,
    games,
    isLoading,
    lang,
    onQueryChange,
    onSearch,
    t,
  } = props
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const tiles = useMemo(() => getPokiGameTiles(games), [games])
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
    <main className="min-h-screen bg-[#25dcc6] text-base-content">
      <section className="relative overflow-hidden px-3 py-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.32),transparent_24rem),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_35%)]" />
        <div
          className={`relative grid grid-flow-dense auto-rows-[100px] grid-cols-[repeat(auto-fill,100px)] gap-3 ${isLoading ? 'opacity-60' : ''}`}
          ref={gridRef}
        >
          <PokiControlTiles
            filters={filters}
            isLoading={isLoading}
            isSearchOpen={isSearchOpen}
            lang={lang}
            onQueryChange={onQueryChange}
            onSearch={onSearch}
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
            <div className="col-span-full grid min-h-[220px] place-items-center rounded-lg bg-white/70 p-8 text-center text-base-content/60 shadow">
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
      </section>
      <SiteFooter locale={lang} />
    </main>
  )
}

function PokiControlTiles({
  filters,
  isLoading,
  isSearchOpen,
  lang,
  onQueryChange,
  onSearch,
  onToggleSearch,
  t,
}: {
  filters: Filters
  isLoading: boolean
  isSearchOpen: boolean
  lang: Locale
  onQueryChange: (query: string) => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
  onToggleSearch: () => void
  t: HomeCopy
}) {
  const location = useRouterState({ select: (state) => state.location })
  const [theme, setTheme] = useState('light')
  const themeMenuRef = useRef<HTMLDetailsElement>(null)
  const localeMenuRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const storedTheme = normalizeSiteTheme(
      window.localStorage.getItem('retro-games-theme'),
    )
    setTheme(storedTheme)
    document.documentElement.dataset.theme = storedTheme
  }, [])

  function handleLocaleChange(nextLocale: Locale) {
    const nextPath = location.pathname.replace(
      /^\/(zh-CN|en|ja)(?=\/|$)/,
      `/${nextLocale}`,
    )

    window.location.assign(nextPath)
  }

  function handleThemeChange(nextTheme: string) {
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem('retro-games-theme', nextTheme)
    themeMenuRef.current?.removeAttribute('open')
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    onSearch(event)
    onToggleSearch()
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
          src="/logo192.png"
        />
      </Link>

      <div className="grid h-[40px] grid-cols-3 divide-x divide-slate-200">
        <details className="dropdown" ref={localeMenuRef}>
          <summary className="grid h-[40px] cursor-pointer list-none place-items-center text-xl text-sky-600 transition hover:bg-sky-50">
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

        <details className="dropdown" ref={themeMenuRef}>
          <summary className="grid h-[40px] cursor-pointer list-none place-items-center text-xl text-violet-600 transition hover:bg-violet-50">
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
          className="grid h-[40px] place-items-center text-xl text-blue-600 transition hover:bg-blue-50"
          onClick={onToggleSearch}
          type="button"
        >
          <i className="ri-search-line" />
        </button>
      </div>

      {isSearchOpen ? (
        <form
          className="absolute left-0 top-[calc(100%+0.75rem)] z-50 flex w-[min(20rem,calc(100vw-1.5rem))] gap-2 rounded-2xl bg-white p-3 shadow-2xl"
          onSubmit={handleSearchSubmit}
        >
          <input
            autoFocus
            className="input input-bordered min-w-0 flex-1"
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            placeholder={t.searchPlaceholder}
            type="search"
            value={filters.query}
          />
          <button className="btn btn-primary" disabled={isLoading} type="submit">
            <i className="ri-search-line" />
          </button>
        </form>
      ) : null}
    </div>
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

function getPokiGameTiles(games: Array<PublicGame>) {
  return [...games]
    .sort((left, right) => getGameStableHash(left) - getGameStableHash(right))
    .map((game) => ({
      game,
      size: getPokiTileSize(game),
    })) satisfies Array<PokiGameTile>
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

  if (size >= 2 && window.matchMedia('(min-width: 640px)').matches) {
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

function getPokiTileSize(game: PublicGame): PokiTileSize {
  const hash = getGameStableHash(game)
  const bucket = hash % 12

  if (bucket === 0) {
    return 3
  }

  if (bucket <= 3) {
    return 2
  }

  return 1
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

  return (
    <Link
      className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg transition duration-200 hover:scale-[1.03] hover:shadow-2xl ${pokiTileSizeClasses[size]}`}
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
      <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl text-blue-600 shadow-lg">
          <i className="ri-play-fill" />
        </span>
      </span>
    </Link>
  )
}
