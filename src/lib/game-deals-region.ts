export const DEFAULT_DEAL_REGION = 'us' as const

export const dealRegions = [
  { code: 'us', currency: 'USD' },
  { code: 'jp', currency: 'JPY' },
  { code: 'cn', currency: 'CNY' },
  { code: 'gb', currency: 'GBP' },
  { code: 'de', currency: 'EUR' },
  { code: 'th', currency: 'THB' },
] as const

export type DealRegion = (typeof dealRegions)[number]['code']
export type NonDefaultDealRegion = Exclude<
  DealRegion,
  typeof DEFAULT_DEAL_REGION
>

export type DealRegionSearch = {
  region: NonDefaultDealRegion | undefined
}

export function normalizeDealRegion(value: unknown): DealRegion {
  return dealRegions.some((region) => region.code === value)
    ? (value as DealRegion)
    : DEFAULT_DEAL_REGION
}

export function validateDealRegionSearch(search: Record<string, unknown>) {
  const region = normalizeDealRegion(search.region)

  return {
    region: region === DEFAULT_DEAL_REGION ? undefined : region,
  } satisfies DealRegionSearch
}

export function toDealRegionSearch(region: DealRegion): DealRegionSearch {
  return {
    region:
      region === DEFAULT_DEAL_REGION
        ? undefined
        : (region as NonDefaultDealRegion),
  }
}
