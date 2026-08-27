export type GameDealPriceStatus =
  | 'available'
  | 'missing-key'
  | 'account-unverified'
  | 'unavailable'

export type GameDeal = {
  steamAppId: number
  name: string
  image: string
  discountPercent: number
  originalPrice: number | null
  steamPrice: number
  steamCurrency: string
  discountExpiresAt?: string
  steamUrl: string
  ggDealsUrl: string
  ggDealsCurrency: string
  currentRetail: number | null
  currentKeyshops: number | null
  historicalRetail: number | null
  historicalKeyshops: number | null
}

export type GameDealsResult = {
  deals: Array<GameDeal>
  priceStatus: GameDealPriceStatus
  updatedAt: string
}

export type GameDealScreenshot = {
  id: number
  thumbnail: string
  image: string
}

export type GameDealDetail = {
  steamAppId: number
  name: string
  image: string
  description: string
  developers: Array<string>
  publishers: Array<string>
  releaseDate: string
  genres: Array<string>
  platforms: Array<string>
  supportedLanguages: string
  screenshots: Array<GameDealScreenshot>
  discountPercent: number
  originalPrice: number | null
  steamPrice: number | null
  steamCurrency: string
  steamUrl: string
  ggDealsUrl: string
  ggDealsCurrency: string
  currentRetail: number | null
  currentKeyshops: number | null
  historicalRetail: number | null
  historicalKeyshops: number | null
}

export type GameDealDetailResult = {
  game: GameDealDetail
  priceStatus: GameDealPriceStatus
  updatedAt: string
}
