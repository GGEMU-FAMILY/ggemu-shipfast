import {
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

import { DefaultHomeTemplate } from '#/components/home/default-template'
import {
  FEATURE_NEW_ARRIVAL_LIMIT,
  FEATURE_SECTION_LIMIT,
  FeaturesHomeTemplate,
  getFeatureSections,
} from '#/components/home/features-template'
import {
  POKI_REQUEST_SIZE,
  PokiLikeHomeTemplate,
  getPokiDailyLayoutSeed,
} from '#/components/home/poki-like-template'
import { HOME_BLOG_POST_LIMIT } from '#/components/home/shared'
import type { Filters, HomeLoaderData } from '#/components/home/types'
import { TwoColumnHomeTemplate } from '#/components/home/two-column-template'
import { SiteLayout } from '#/components/site-layout'
import {
  type GameSearchSort,
  type GameSearchResult,
  type Locale,
  searchBlogPosts,
  searchGames,
} from '#/lib/ggemu'
import { getI18n, normalizeLocale } from '#/lib/i18n'
import {
  type SiteTemplate,
  getSiteTemplate,
  normalizeSiteTemplate,
  siteConfig,
} from '#/lib/site-config'

const DEFAULT_HOME_REQUEST_SIZE = 20

type HomeSearch = {
  template?: SiteTemplate
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
      const [newArrival, topPlays, topLikes, topViews, latestBlogPosts] = await Promise.all([
        loadFeatureGames(locale, 'newest', FEATURE_NEW_ARRIVAL_LIMIT),
        loadFeatureGames(locale, 'popular'),
        loadFeatureGames(locale, 'likes'),
        loadFeatureGames(locale, 'views'),
        loadLatestBlogPosts(),
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
        latestBlogPosts,
      }
    }

    const [result, latestBlogPosts] = await Promise.all([
      searchGames({
        data: {
          query: '',
          limit: getHomeRequestLimit(template),
          locale,
          page: 1,
          sort: getHomeSort(template),
        },
      }),
      loadLatestBlogPosts(),
    ])

    return {
      ...result,
      layoutSeed: getPokiDailyLayoutSeed(),
      latestBlogPosts,
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
    latestBlogPosts: initialResult.latestBlogPosts,
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

async function loadLatestBlogPosts() {
  const result = await searchBlogPosts({
    data: {
      limit: HOME_BLOG_POST_LIMIT,
      page: 1,
    },
  }).catch(() => null)

  return result?.blogPosts ?? []
}

function getHomeRequestLimit(template = siteConfig.SITE_TEMPLATE) {
  if (template === 'poki-like') {
    return POKI_REQUEST_SIZE
  }

  if (template === 'features') {
    return FEATURE_SECTION_LIMIT
  }

  return DEFAULT_HOME_REQUEST_SIZE
}

function getHomeSort(template: SiteTemplate): GameSearchSort {
  return template === 'poki-like' ? 'popular' : 'newest'
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
