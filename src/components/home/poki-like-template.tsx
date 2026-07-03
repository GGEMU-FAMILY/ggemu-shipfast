import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { SiteFooter } from '#/components/site-layout'
import type { Locale, PublicGame } from '#/lib/ggemu'
import { siteConfig } from '#/lib/site-config'
import { getSiteThemes, normalizeSiteTheme } from '#/lib/site-themes'

import {
  HomeFaqSection,
  HomeLatestBlogPostsSection,
} from './shared'
import {
  type RecentPlayedGame,
  useRecentPlayedGames,
} from './recent-played-games'
import { HomeSearchOverlay } from './search-overlay'
import type { HomeCopy, HomeTemplateProps } from './types'

export const POKI_REQUEST_SIZE = 100

const POKI_VISIBLE_GAME_COUNT = 60
const POKI_TILE_SIZE = 100
const POKI_TILE_GAP = 16
const POKI_LAYOUT_SEED_DAY_MS = 24 * 60 * 60 * 1000

const localeOptions: Array<{ label: string; value: Locale }> = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
]

type PokiTileSize = 1 | 2 | 3

type PokiGameTile = {
  game: PublicGame
  size: PokiTileSize
}

type PokiGridSizeTile = {
  size: PokiTileSize
}

type PokiPlacedTile = {
  colSpan: number
  rowSpan: number
}

const pokiTileSizeClasses: Record<PokiTileSize, string> = {
  1: 'col-span-1 row-span-1',
  2: 'col-span-2 row-span-2',
  3: 'col-span-2 row-span-2 md:col-span-3 md:row-span-3',
}

export function PokiLikeHomeTemplate(props: HomeTemplateProps) {
  const {
    filterOptions,
    games,
    isLoading,
    lang,
    latestBlogPosts,
    layoutSeed,
    t,
  } = props
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const recentGames = useRecentPlayedGames()
  const tiles = useMemo(() => getPokiGameTiles(games, layoutSeed), [games, layoutSeed])
  const recentGameIds = useMemo(
    () => new Set(recentGames.map((game) => game.id)),
    [recentGames],
  )
  const regularTiles = useMemo(
    () => tiles.filter((tile) => !recentGameIds.has(getGameRouteId(tile.game))),
    [recentGameIds, tiles],
  )
  const visibleTileCount = Math.max(0, POKI_VISIBLE_GAME_COUNT - recentGames.length)
  const visibleTiles = useMemo(
    () => regularTiles.slice(0, visibleTileCount),
    [regularTiles, visibleTileCount],
  )
  const reserveTiles = useMemo(
    () => regularTiles.slice(visibleTileCount),
    [regularTiles, visibleTileCount],
  )
  const fillerBaseTiles = useMemo(
    () => [
      ...recentGames.map((game) => ({ game, size: 1 as const })),
      ...visibleTiles,
    ],
    [recentGames, visibleTiles],
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

      setFillerCount(getPokiFillerCount(fillerBaseTiles, grid))
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
  }, [fillerBaseTiles])

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <section className="relative overflow-hidden px-3 py-3 pb-6">
        <div
          className={`relative grid grid-flow-dense auto-rows-[100px] grid-cols-[repeat(auto-fill,100px)] justify-center gap-4 ${isLoading ? 'opacity-60' : ''}`}
          ref={gridRef}
        >
          <PokiControlTiles
            lang={lang}
            onToggleSearch={() => setIsSearchOpen((isOpen) => !isOpen)}
            t={t}
          />

          {recentGames.map((game) => (
            <PokiRecentGameTile game={game} key={game.id} lang={lang} />
          ))}

          {visibleTiles.length > 0 ? (
            visibleTiles.map((tile, index) => (
              <PokiGameCard
                game={tile.game}
                key={`${tile.game._id ?? tile.game.url_slug ?? tile.game.name ?? 'game'}-${index}`}
                lang={lang}
                size={tile.size}
              />
            ))
          ) : recentGames.length === 0 ? (
            <div className="col-span-full grid min-h-[220px] place-items-center rounded-lg bg-base-100/70 p-8 text-center text-base-content/60 shadow">
              {t.empty}
            </div>
          ) : null}

          {fillerTiles.map((tile, index) => (
            <PokiGameCard
              game={tile.game}
              key={`poki-reserve-${tile.game._id ?? tile.game.url_slug ?? tile.game.name ?? index}`}
              lang={lang}
              size={1}
            />
          ))}

        </div>
        <HomeSearchOverlay
          filterOptions={filterOptions}
          isOpen={isSearchOpen}
          lang={lang}
          onClose={() => setIsSearchOpen(false)}
          t={t}
        />
      </section>
      <HomeLatestBlogPostsSection blogPosts={latestBlogPosts} lang={lang} />
      <HomeFaqSection lang={lang} />
      <SiteFooter locale={lang} />
    </main>
  )
}

function PokiRecentGameTile({
  game,
  lang,
}: {
  game: RecentPlayedGame
  lang: Locale
}) {
  return (
    <Link
      className="group relative col-span-1 row-span-1 overflow-hidden rounded-2xl bg-white shadow-lg transition duration-200 hover:scale-[1.03] hover:shadow-2xl"
      params={{ gameId: game.id, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      {game.cover ? (
        <img
          alt={game.name}
          className="h-full w-full object-cover"
          loading="lazy"
          src={game.cover}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-base-200 text-xs font-semibold text-base-content/50">
          Retro
        </div>
      )}
      <span className="absolute right-0 top-0 grid h-8 w-8 place-items-start justify-items-end overflow-hidden rounded-tr-2xl">
        <span className="h-0 w-0 border-l-[32px] border-t-[32px] border-l-transparent border-t-primary" />
        <i className="ri-history-line absolute right-1 top-1 text-[13px] leading-none text-primary-content" />
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-2 pb-2 pt-8 text-[11px] font-semibold leading-tight text-white">
        <span className="line-clamp-2">{game.name}</span>
      </span>
    </Link>
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

function getPokiFillerCount(tiles: Array<PokiGridSizeTile>, grid: HTMLDivElement) {
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

export function getPokiDailyLayoutSeed(date = new Date()) {
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

function getGameRouteId(game: PublicGame) {
  return game.url_slug?.trim() || game._id?.trim() || ''
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
