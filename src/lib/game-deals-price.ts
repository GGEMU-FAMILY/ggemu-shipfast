type DealPrice = {
  discountPercent: number
  steamPrice: number | null
  historicalRetail: number | null
  historicalKeyshops: number | null
}

type FormattableDealPrice = DealPrice & {
  ggDealsCurrency: string
  steamCurrency: string
}

export function getHistoricalLowPrice(deal: DealPrice) {
  const prices = [deal.historicalRetail, deal.historicalKeyshops].filter(
    (price): price is number => price !== null,
  )

  return prices.length > 0 ? Math.min(...prices) : null
}

export function isCurrentPriceHistoricalLow(deal: DealPrice) {
  const historicalLow = getHistoricalLowPrice(deal)

  return (
    deal.discountPercent > 0 &&
    deal.steamPrice !== null &&
    historicalLow !== null &&
    deal.steamPrice === Math.round(historicalLow * 100)
  )
}

export function formatHistoricalLowPrice(
  deal: FormattableDealPrice,
  locale: string,
  fallback: string,
) {
  const historicalLow = getHistoricalLowPrice(deal)

  if (historicalLow === null) {
    return fallback
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: deal.steamCurrency,
    }).format(historicalLow)
  } catch {
    return `${deal.ggDealsCurrency}${historicalLow.toFixed(2)}`
  }
}
