import { env as cloudflareEnv } from 'cloudflare:workers'

import type {
  GameDeal,
  GameDealDetail,
  GameDealDetailResult,
  GameDealPriceStatus,
  GameDealsResult,
} from '#/lib/game-deals.types'
import type { DealRegion } from '#/lib/game-deals-region'
import type { Locale } from '#/lib/ggemu'

const STEAM_FEATURED_CATEGORIES_URL =
  'https://store.steampowered.com/api/featuredcategories'
const GG_DEALS_PRICES_URL =
  'https://api.gg.deals/v1/prices/by-steam-app-id/'
const STEAM_APP_DETAILS_URL = 'https://store.steampowered.com/api/appdetails'

type SteamFeaturedItem = {
  id?: unknown
  type?: unknown
  name?: unknown
  discounted?: unknown
  discount_percent?: unknown
  original_price?: unknown
  final_price?: unknown
  currency?: unknown
  discount_expiration?: unknown
  large_capsule_image?: unknown
  header_image?: unknown
}

type SteamFeaturedCategory = {
  id?: unknown
  items?: unknown
}

type GgDealsPriceEntry = {
  url?: unknown
  prices?: {
    currency?: unknown
    currentRetail?: unknown
    currentKeyshops?: unknown
    historicalRetail?: unknown
    historicalKeyshops?: unknown
  }
}

type GgDealsResponse = {
  success?: unknown
  data?: unknown
}

type SteamAppDetailsData = {
  type?: unknown
  name?: unknown
  steam_appid?: unknown
  is_free?: unknown
  short_description?: unknown
  supported_languages?: unknown
  header_image?: unknown
  developers?: unknown
  publishers?: unknown
  platforms?: unknown
  genres?: unknown
  screenshots?: unknown
  release_date?: unknown
  price_overview?: unknown
}

type SteamAppDetailsEntry = {
  success?: unknown
  data?: unknown
}

export async function fetchGameDeals(
  locale: Locale,
  region: DealRegion,
): Promise<GameDealsResult> {
  const steamDeals = await fetchSteamDeals(locale, region)
  const apiKey = getGgDealsApiKey()

  if (!apiKey) {
    return buildResult(steamDeals, {}, 'missing-key')
  }

  try {
    const prices = await fetchGgDealsPrices(
      steamDeals.map((deal) => deal.steamAppId),
      apiKey,
      region,
    )

    return buildResult(steamDeals, prices, 'available')
  } catch (error) {
    const priceStatus =
      error instanceof GgDealsRequestError ? error.priceStatus : 'unavailable'

    return buildResult(steamDeals, {}, priceStatus)
  }
}

export async function fetchGameDealDetail(
  steamAppId: number,
  locale: Locale,
  region: DealRegion,
): Promise<GameDealDetailResult | null> {
  const game = await fetchSteamGameDetail(steamAppId, locale, region)

  if (!game) {
    return null
  }

  const apiKey = getGgDealsApiKey()

  if (!apiKey) {
    return buildDetailResult(game, 'missing-key')
  }

  try {
    const prices = await fetchGgDealsPrices([steamAppId], apiKey, region)
    const mergedGame = mergeGgDealsPrice(game, prices[String(steamAppId)])

    return buildDetailResult(mergedGame, 'available')
  } catch (error) {
    const priceStatus =
      error instanceof GgDealsRequestError ? error.priceStatus : 'unavailable'

    return buildDetailResult(game, priceStatus)
  }
}

async function fetchSteamGameDetail(
  steamAppId: number,
  locale: Locale,
  region: DealRegion,
) {
  const params = new URLSearchParams({
    appids: String(steamAppId),
    cc: region,
    l: getSteamLanguage(locale),
  })
  const response = await fetch(`${STEAM_APP_DETAILS_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Steam game detail request failed with ${response.status}`)
  }

  const payload = (await response.json()) as Record<string, SteamAppDetailsEntry>
  const entry = payload[String(steamAppId)]

  if (entry?.success !== true || !isRecord(entry.data)) {
    return null
  }

  return toGameDealDetail(entry.data as SteamAppDetailsData, steamAppId)
}

function toGameDealDetail(data: SteamAppDetailsData, fallbackAppId: number) {
  const steamAppId = toNumber(data.steam_appid) ?? fallbackAppId
  const name = getString(data.name)
  const image = getString(data.header_image)

  if (data.type !== 'game' || !name || !image) {
    return null
  }

  const price = isRecord(data.price_overview) ? data.price_overview : {}
  const platforms = isRecord(data.platforms) ? data.platforms : {}

  return {
    steamAppId,
    name,
    image,
    description: getString(data.short_description),
    developers: toStringArray(data.developers),
    publishers: toStringArray(data.publishers),
    releaseDate: isRecord(data.release_date)
      ? getString(data.release_date.date)
      : '',
    genres: toDescriptionArray(data.genres),
    platforms: [
      ...(platforms.windows === true ? ['Windows'] : []),
      ...(platforms.mac === true ? ['macOS'] : []),
      ...(platforms.linux === true ? ['Linux'] : []),
    ],
    supportedLanguages: stripHtml(getString(data.supported_languages)),
    screenshots: toScreenshots(data.screenshots),
    discountPercent: toNumber(price.discount_percent) ?? 0,
    originalPrice: toNumber(price.initial),
    steamPrice: data.is_free === true ? 0 : toNumber(price.final),
    steamCurrency: getString(price.currency) || 'USD',
    steamUrl: `https://store.steampowered.com/app/${steamAppId}/`,
    ggDealsUrl: `https://gg.deals/steam/app/${steamAppId}/`,
    ggDealsCurrency: '$',
    currentRetail: null,
    currentKeyshops: null,
    historicalRetail: null,
    historicalKeyshops: null,
  } satisfies GameDealDetail
}

function getSteamLanguage(locale: Locale) {
  if (locale === 'zh-CN') {
    return 'schinese'
  }

  return locale === 'ja' ? 'japanese' : 'english'
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map(getString).filter((item) => item.length > 0)
    : []
}

function toDescriptionArray(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => (isRecord(item) ? getString(item.description) : ''))
    .filter((item) => item.length > 0)
}

function toScreenshots(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item, index) => {
    if (!isRecord(item)) {
      return []
    }

    const thumbnail = getString(item.path_thumbnail)
    const image = getString(item.path_full)

    return thumbnail && image
      ? [{ id: toNumber(item.id) ?? index, thumbnail, image }]
      : []
  })
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, ' · ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s*·\s*/g, ' · ')
    .trim()
}

async function fetchSteamDeals(locale: Locale, region: DealRegion) {
  const params = new URLSearchParams({
    cc: region,
    l: getSteamLanguage(locale),
  })
  const response = await fetch(`${STEAM_FEATURED_CATEGORIES_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Steam deals request failed with ${response.status}`)
  }

  const payload = (await response.json()) as Record<string, unknown>
  const seen = new Set<number>()
  const deals: Array<GameDeal> = []

  for (const value of Object.values(payload)) {
    if (!isFeaturedCategory(value)) {
      continue
    }

    for (const item of value.items) {
      const deal = toSteamDeal(item)

      if (!deal || seen.has(deal.steamAppId)) {
        continue
      }

      seen.add(deal.steamAppId)
      deals.push(deal)
    }
  }

  return deals
}

function isFeaturedCategory(value: unknown): value is SteamFeaturedCategory & {
  items: Array<SteamFeaturedItem>
} {
  if (!value || typeof value !== 'object') {
    return false
  }

  const category = value as SteamFeaturedCategory
  const supportedCategoryIds = new Set([
    'cat_dailydeal',
    'cat_specials',
    'cat_topsellers',
    'cat_newreleases',
  ])

  return supportedCategoryIds.has(String(category.id)) && Array.isArray(category.items)
}

function toSteamDeal(item: SteamFeaturedItem): GameDeal | null {
  const steamAppId = toNumber(item.id)
  const discountPercent = toNumber(item.discount_percent)
  const steamPrice = toNumber(item.final_price)
  const name = typeof item.name === 'string' ? item.name.trim() : ''
  const image = getString(item.large_capsule_image) || getString(item.header_image)

  if (
    item.type !== 0 ||
    item.discounted !== true ||
    !steamAppId ||
    !discountPercent ||
    steamPrice === null ||
    !name ||
    !image
  ) {
    return null
  }

  const discountExpiration = toNumber(item.discount_expiration)

  return {
    steamAppId,
    name,
    image,
    discountPercent,
    originalPrice: toNumber(item.original_price),
    steamPrice,
    steamCurrency: getString(item.currency) || 'USD',
    discountExpiresAt: discountExpiration
      ? new Date(discountExpiration * 1000).toISOString()
      : undefined,
    steamUrl: `https://store.steampowered.com/app/${steamAppId}/`,
    ggDealsUrl: `https://gg.deals/steam/app/${steamAppId}/`,
    ggDealsCurrency: '$',
    currentRetail: null,
    currentKeyshops: null,
    historicalRetail: null,
    historicalKeyshops: null,
  }
}

async function fetchGgDealsPrices(
  appIds: Array<number>,
  apiKey: string,
  region: DealRegion,
) {
  if (appIds.length === 0) {
    return {}
  }

  const params = new URLSearchParams({
    ids: appIds.join(','),
    key: apiKey,
    region,
  })
  const response = await fetch(`${GG_DEALS_PRICES_URL}?${params}`)
  const payload = (await response.json().catch(() => null)) as GgDealsResponse | null

  if (!response.ok || payload?.success !== true) {
    const message = getApiErrorMessage(payload)
    const priceStatus = message.toLowerCase().includes('confirm your email')
      ? 'account-unverified'
      : 'unavailable'

    throw new GgDealsRequestError(priceStatus)
  }

  return isRecord(payload.data)
    ? (payload.data as Record<string, GgDealsPriceEntry | null>)
    : {}
}

function buildResult(
  steamDeals: Array<GameDeal>,
  priceEntries: Record<string, GgDealsPriceEntry | null>,
  priceStatus: GameDealPriceStatus,
): GameDealsResult {
  return {
    deals: steamDeals.map((deal) => mergeGgDealsPrice(deal, priceEntries[String(deal.steamAppId)])),
    priceStatus,
    updatedAt: new Date().toISOString(),
  }
}

function buildDetailResult(
  game: GameDealDetail,
  priceStatus: GameDealPriceStatus,
): GameDealDetailResult {
  return {
    game,
    priceStatus,
    updatedAt: new Date().toISOString(),
  }
}

function mergeGgDealsPrice(
  deal: GameDeal,
  entry: GgDealsPriceEntry | null | undefined,
): GameDeal
function mergeGgDealsPrice(
  deal: GameDealDetail,
  entry: GgDealsPriceEntry | null | undefined,
): GameDealDetail
function mergeGgDealsPrice(
  deal: GameDeal | GameDealDetail,
  entry: GgDealsPriceEntry | null | undefined,
): GameDeal | GameDealDetail {
  const prices = entry?.prices

  if (!prices) {
    return deal
  }

  return {
    ...deal,
    ggDealsUrl: getString(entry.url) || deal.ggDealsUrl,
    ggDealsCurrency: getString(prices.currency) || deal.ggDealsCurrency,
    currentRetail: toNumber(prices.currentRetail),
    currentKeyshops: toNumber(prices.currentKeyshops),
    historicalRetail: toNumber(prices.historicalRetail),
    historicalKeyshops: toNumber(prices.historicalKeyshops),
  }
}

function getGgDealsApiKey() {

  const processEnv = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> }
    }
  ).process?.env

  return cloudflareEnv.GG_DEALS_API_KEY ?? processEnv?.GG_DEALS_API_KEY ?? 'Yuu1vh4w0UgWhA1J29Gx_60-jHIuNCAC'
}

function getApiErrorMessage(payload: GgDealsResponse | null) {
  if (!isRecord(payload?.data)) {
    return ''
  }

  return getString(payload.data.message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

class GgDealsRequestError extends Error {
  constructor(readonly priceStatus: GameDealPriceStatus) {
    super('GG.deals price request failed')
  }
}
