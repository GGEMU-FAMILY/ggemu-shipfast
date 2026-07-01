import { createServerFn } from '@tanstack/react-start'
import { getRequestUrl } from '@tanstack/react-start/server'

const API_BASE_URL = 'https://ggemu.com'
const PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export type Locale = 'zh-CN' | 'en' | 'ja'
export type GameSearchSort =
  | 'newest'
  | 'popular'
  | 'oldest'
  | 'name_asc'
  | 'likes'
  | 'plays_count'
  | 'views'
  | 'likes_count'
  | 'views_count'

export type PublicGame = {
  _id?: string
  url_slug?: string
  name?: string
  description?: string
  how_to_play?: string
  developer?: string
  released_year?: string
  keywords?: string
  platform?: string
  platform_slug?: string
  platformSlug?: string
  categories?: Array<string>
  languages?: Array<string>
  players?: number
  play_online?: number
  downloadable?: number
  game_cover?: string
  game_video?: string
  likes_count?: number
  comments_count?: number
  views_count?: number
  plays_count?: number
}

export type Pagination = {
  total: number
  page: number
  limit: number
  pages: number
}

export type GameSearchResult = {
  games: Array<PublicGame>
  pagination: Pagination
}

export type GameDetailPageData = {
  canonicalUrl: string
  game: PublicGame
}

export type RelatedGamesData = {
  relatedByCategory: Array<PublicGame>
  relatedByDeveloper: Array<PublicGame>
}

type GameSearchPayload = {
  query?: string
  locale?: Locale
  page?: number
  limit?: number
  platform?: string
  category?: string
  sort?: GameSearchSort
}

type GameDetailPayload = {
  id: string
  locale?: Locale
}

type RelatedGamesPayload = {
  category?: string
  currentId: string
  developer?: string
}

type GameSearchResponse = {
  success: true
  data: Array<PublicGame>
  pagination: Pagination
}

type GameDetailResponse = {
  success: true
  data: PublicGame
}

function normalizePage(page: unknown) {
  const parsed = Number(page)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function normalizeLimit(limit: unknown) {
  const parsed = Number(limit)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return PAGE_SIZE
  }

  return Math.min(parsed, MAX_PAGE_SIZE)
}

function normalizeLocale(locale: unknown): Locale {
  return locale === 'en' || locale === 'ja' ? locale : 'zh-CN'
}

function normalizeSort(sort: unknown): GameSearchSort {
  if (
    sort === 'popular' ||
    sort === 'oldest' ||
    sort === 'name_asc' ||
    sort === 'likes' ||
    sort === 'plays_count' ||
    sort === 'views' ||
    sort === 'likes_count' ||
    sort === 'views_count'
  ) {
    return sort
  }

  return 'newest'
}

function addOptionalParam(
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) {
  const trimmed = value?.trim()

  if (trimmed) {
    params.set(key, trimmed)
  }
}

async function fetchJson<T>(path: string, params: URLSearchParams) {
  const response = await fetch(`${API_BASE_URL}${path}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`GGEMU API request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function fetchGames(params: URLSearchParams) {
  const result = await fetchJson<GameSearchResponse>('/api/games/search', params)

  return {
    games: result.data,
    pagination: result.pagination,
  } satisfies GameSearchResult
}

function getGameId(game: PublicGame) {
  return game.url_slug?.trim() || game._id?.trim() || ''
}

function getAbsoluteGameUrl(origin: string, locale: Locale, game: PublicGame, fallbackId: string) {
  const id = encodeURIComponent(getGameId(game) || fallbackId)

  return `${origin}/${locale}/games/${id}`
}

function isSameGame(game: PublicGame, id: string) {
  return getGameId(game) === id
}

function dedupeGames(games: Array<PublicGame>) {
  const seen = new Set<string>()

  return games.filter((game) => {
    const id = getGameId(game)

    if (!id || seen.has(id)) {
      return false
    }

    seen.add(id)
    return true
  })
}

async function fetchRelatedGames({
  category,
  currentId,
  developer,
}: {
  category?: string
  currentId: string
  developer?: string
}) {
  const categoryParams = new URLSearchParams({
    limit: '8',
    page: '1',
    play_online: '1',
    sort: 'popular',
  })
  const developerParams = new URLSearchParams({
    limit: '8',
    page: '1',
    play_online: '1',
    sort: 'popular',
  })

  addOptionalParam(categoryParams, 'category', category)
  addOptionalParam(developerParams, 'query', developer)

  const [categoryResult, developerResult] = await Promise.all([
    category ? fetchGames(categoryParams).catch(() => null) : null,
    developer ? fetchGames(developerParams).catch(() => null) : null,
  ])

  const relatedByCategory = dedupeGames(categoryResult?.games ?? [])
    .filter((game) => !isSameGame(game, currentId))
    .slice(0, 6)
  const relatedByDeveloper = dedupeGames(developerResult?.games ?? [])
    .filter((game) => !isSameGame(game, currentId))
    .filter((game) => game.developer?.trim() === developer?.trim())
    .slice(0, 6)

  return { relatedByCategory, relatedByDeveloper }
}

export const searchGames = createServerFn({ method: 'GET' })
  .validator((payload: GameSearchPayload) => ({
    query: payload.query ?? '',
    locale: normalizeLocale(payload.locale),
    page: normalizePage(payload.page),
    limit: normalizeLimit(payload.limit),
    platform: payload.platform ?? '',
    category: payload.category ?? '',
    sort: normalizeSort(payload.sort),
  }))
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      page: String(data.page),
      limit: String(data.limit),
      play_online: '1',
    })

    addOptionalParam(params, 'query', data.query)
    addOptionalParam(params, 'platform', data.platform)
    addOptionalParam(params, 'category', data.category)
    addOptionalParam(params, 'sort', data.sort)

    return fetchGames(params)
  })

export const getGameDetail = createServerFn({ method: 'GET' })
  .validator((payload: GameDetailPayload) => ({
    id: payload.id,
  }))
  .handler(async ({ data }) => {
    const params = new URLSearchParams({ id: data.id })
    const result = await fetchJson<GameDetailResponse>('/api/game/detail', params)

    return result.data
  })

export const getGameDetailPageData = createServerFn({ method: 'GET' })
  .validator((payload: GameDetailPayload) => ({
    id: payload.id,
    locale: normalizeLocale(payload.locale),
  }))
  .handler(async ({ data }) => {
    const params = new URLSearchParams({ id: data.id })
    const result = await fetchJson<GameDetailResponse>('/api/game/detail', params)
    const game = result.data
    const origin = getRequestUrl({ xForwardedHost: true }).origin

    return {
      canonicalUrl: getAbsoluteGameUrl(origin, data.locale, game, data.id),
      game,
    } satisfies GameDetailPageData
  })

export const getRelatedGamePageData = createServerFn({ method: 'GET' })
  .validator((payload: RelatedGamesPayload) => ({
    category: payload.category,
    currentId: payload.currentId,
    developer: payload.developer,
  }))
  .handler(async ({ data }) => {
    return fetchRelatedGames(data) satisfies Promise<RelatedGamesData>
  })
