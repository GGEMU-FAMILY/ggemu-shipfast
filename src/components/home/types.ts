import type { FormEvent } from 'react'

import type {
  BlogPost,
  GameFilterOptions,
  GameSearchResult,
  GameSearchSort,
  Locale,
  PublicGame,
} from '#/lib/ggemu'
import type { getI18n } from '#/lib/i18n'

export type HomeCopy = ReturnType<typeof getI18n>['home']

export type Filters = {
  query: string
  platform: string
  category: string
  sort: GameSearchSort
}

export type FeatureSection = {
  games: Array<PublicGame>
  hasHeroCard: boolean
  title: string
}

export type HomeLoaderData = GameSearchResult & {
  featureSections?: Array<FeatureSection>
  filterOptions: GameFilterOptions
  layoutSeed: number
  latestBlogPosts: Array<BlogPost>
  seoOrigin: string
}

export type SearchFormProps = {
  filterOptions: GameFilterOptions
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
  pagination: GameSearchResult['pagination']
  t: HomeCopy
}

export type GamesSectionProps = {
  games: Array<PublicGame>
  gridClassName: string
  isLoading: boolean
  lang: Locale
  onLoadPage: (page: number) => void
  page: number
  pages: number
  pagination: GameSearchResult['pagination']
  sectionClassName: string
  showHeader?: boolean
  t: HomeCopy
}

export type HomeTemplateProps =
  Omit<GamesSectionProps, 'gridClassName' | 'sectionClassName'> &
    Omit<SearchFormProps, 'mode'> & {
      featureSections?: Array<FeatureSection>
      layoutSeed: number
      latestBlogPosts: Array<BlogPost>
    }
