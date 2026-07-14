import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { SiteLayout } from '#/components/site-layout'
import type { Locale, PublicGame } from '#/lib/ggemu'

import { HomeFaqSection, HomeLatestBlogPostsSection } from './shared'
import { RecentPlayedGamesSection } from './recent-played-games'
import { HomeSearchOverlay } from './search-overlay'
import type { FeaturePlatformGames, FeatureSection, HomeTemplateProps } from './types'

export const FEATURE_NEW_ARRIVAL_LIMIT = 7
export const FEATURE_PLATFORM_LIMIT = 8
export const FEATURE_PLATFORMS = [
  'Arcade',
  'FLASH',
  'HTML5',
  'Famicom',
  'Game Boy Advance',
] as const
export const FEATURE_SECTION_LIMIT = 10

export function FeaturesHomeTemplate({
  featureSections,
  filterOptions,
  games,
  isLoading,
  lang,
  latestBlogPosts,
  pagination,
  t,
}: HomeTemplateProps) {
  const sections = featureSections ?? getFeatureSections({ newArrival: games })
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <SiteLayout
      headerActions={
        <button
          aria-label={t.search}
          className="btn btn-sm btn-ghost border border-base-300 px-3"
          onClick={() => setIsSearchOpen(true)}
          type="button"
        >
          <i className="ri-search-line text-lg" />
          <span className="hidden sm:inline">{t.search}</span>
        </button>
      }
      locale={lang}
    >
      <RecentPlayedGamesSection lang={lang} />

      <section className="overflow-hidden bg-base-100 text-base-content">
        <div
          className={`mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 ${isLoading ? 'opacity-60' : ''}`}
        >
          {sections.map((section) => (
            <FeatureGamesSection
              games={section.games}
              hasHeroCard={section.hasHeroCard}
              isSingleRow={section.isSingleRow}
              key={section.title}
              lang={lang}
              title={section.title}
            />
          ))}
        </div>
      </section>
      <HomeLatestBlogPostsSection blogPosts={latestBlogPosts} lang={lang} />
      <HomeFaqSection lang={lang} />
      <HomeSearchOverlay
        filterOptions={filterOptions}
        gameTotal={pagination.total}
        isOpen={isSearchOpen}
        lang={lang}
        onClose={() => setIsSearchOpen(false)}
        t={t}
      />
    </SiteLayout>
  )
}

export function getFeatureSections({
  newArrival,
  platformGames = [],
}: {
  newArrival: Array<PublicGame>
  platformGames?: Array<FeaturePlatformGames>
}): Array<FeatureSection> {
  return [
    {
      title: 'New Arrival',
      games: newArrival.slice(0, FEATURE_NEW_ARRIVAL_LIMIT),
      hasHeroCard: true,
    },
    ...platformGames.map((platform) => ({
      title: platform.title,
      games: platform.games.slice(0, FEATURE_PLATFORM_LIMIT),
      hasHeroCard: false,
      isSingleRow: true,
    })),
  ]
}

function FeatureGamesSection({
  games,
  hasHeroCard,
  isSingleRow = false,
  lang,
  title,
}: {
  games: Array<PublicGame>
  hasHeroCard: boolean
  isSingleRow?: boolean
  lang: Locale
  title: string
}) {
  if (games.length === 0) {
    return null
  }

  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-3">
        <h2 className="text-xl font-semibold leading-none text-base-content">
          {title}
        </h2>
      </div>

      {hasHeroCard ? (
        <FeatureHeroGamesRow games={games} lang={lang} title={title} />
      ) : (
        <FeatureSmallGamesRow
          games={games}
          isSingleRow={isSingleRow}
          lang={lang}
          title={title}
        />
      )}
    </section>
  )
}

function FeatureHeroGamesRow({
  games,
  lang,
  title,
}: {
  games: Array<PublicGame>
  lang: Locale
  title: string
}) {
  const [heroGame, ...smallGames] = games
  const leadGames = smallGames.slice(0, 4)
  const remainingGames = smallGames.slice(4)

  if (!heroGame) {
    return null
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <FeatureGameCard game={heroGame} isHeroCard={true} lang={lang} />
      <div className="grid shrink-0 grid-cols-2 grid-rows-2 gap-3">
        {leadGames.map((game, index) => (
          <FeatureGameCard
            game={game}
            isHeroCard={false}
            key={`${title}-lead-${game._id ?? game.url_slug ?? game.name ?? index}`}
            lang={lang}
          />
        ))}
      </div>
      {remainingGames.length > 0 ? (
        <div className="grid shrink-0 grid-flow-col grid-rows-2 gap-3">
          {remainingGames.map((game, index) => (
            <FeatureGameCard
              game={game}
              isHeroCard={false}
              key={`${title}-rest-${game._id ?? game.url_slug ?? game.name ?? index}`}
              lang={lang}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function FeatureSmallGamesRow({
  games,
  isSingleRow,
  lang,
  title,
}: {
  games: Array<PublicGame>
  isSingleRow: boolean
  lang: Locale
  title: string
}) {
  if (isSingleRow) {
    return (
      <div className="flex flex-nowrap gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((game, index) => (
          <FeatureGameCard
            game={game}
            isHeroCard={false}
            key={`${title}-${game._id ?? game.url_slug ?? game.name ?? index}`}
            lang={lang}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-flow-col grid-rows-2 gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {games.map((game, index) => (
        <FeatureGameCard
          game={game}
          isHeroCard={false}
          key={`${title}-${game._id ?? game.url_slug ?? game.name ?? index}`}
          lang={lang}
        />
      ))}
    </div>
  )
}

function FeatureGameCard({
  game,
  isHeroCard,
  lang,
}: {
  game: PublicGame
  isHeroCard: boolean
  lang: Locale
}) {
  const gameId = game.url_slug || game._id || ''
  const gameName = game.name?.trim() || 'Game'
  const keywords = game.keywords?.trim()

  return (
    <Link
      className={`group relative aspect-[4/3] shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:z-10 hover:border-primary/40 hover:shadow-lg ${isHeroCard ? 'w-[320px] sm:w-[520px]' : 'w-[154px] sm:w-[248px]'}`}
      params={{ gameId, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      {game.game_cover ? (
        <img
          alt={gameName}
          className="h-full w-full object-cover"
          loading="lazy"
          src={game.game_cover}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-base-300 text-sm font-semibold text-base-content/50">
          Retro
        </div>
      )}

      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10 text-sm font-black leading-tight text-white">
        <span className="line-clamp-2">{gameName}</span>
        {keywords ? (
          <span className="mt-1 line-clamp-2 max-h-0 text-xs font-medium leading-snug text-white/80 opacity-0 transition-all duration-200 group-hover:max-h-[2.75em] group-hover:opacity-100">
            {keywords}
          </span>
        ) : null}
      </span>
    </Link>
  )
}

function sortFeatureGames(games: Array<PublicGame>, key: keyof PublicGame) {
  return [...games]
    .sort((left, right) => getFeatureScore(right, key) - getFeatureScore(left, key))
    .slice(0, FEATURE_SECTION_LIMIT)
}

function getFeatureScore(game: PublicGame, key: keyof PublicGame) {
  const value = game[key]

  return typeof value === 'number' ? value : 0
}
