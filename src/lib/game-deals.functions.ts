import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'

import {
  fetchGameDealDetail,
  fetchGameDeals,
} from '#/lib/game-deals.server'
import {
  normalizeDealRegion,
  type DealRegion,
} from '#/lib/game-deals-region'
import type { Locale } from '#/lib/ggemu'

type GameDealsPayload = {
  locale: Locale
  region: DealRegion
}

export const getGameDeals = createServerFn({ method: 'GET' })
  .validator((payload: GameDealsPayload) => ({
    locale: payload.locale,
    region: normalizeDealRegion(payload.region),
  }))
  .handler(async ({ data }) => {
    setResponseHeader('Cache-Control', 'public, max-age=300, s-maxage=900')

    return fetchGameDeals(data.locale, data.region)
  })

type GameDealDetailPayload = {
  steamAppId: number
  locale: Locale
  region: DealRegion
}

export const getGameDealDetail = createServerFn({ method: 'GET' })
  .validator((payload: GameDealDetailPayload) => ({
    steamAppId: Number(payload.steamAppId),
    locale: payload.locale,
    region: normalizeDealRegion(payload.region),
  }))
  .handler(async ({ data }) => {
    setResponseHeader('Cache-Control', 'public, max-age=300, s-maxage=900')

    if (!Number.isInteger(data.steamAppId) || data.steamAppId <= 0) {
      return null
    }

    return fetchGameDealDetail(data.steamAppId, data.locale, data.region)
  })
