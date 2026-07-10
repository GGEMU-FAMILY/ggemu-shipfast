import { Link } from '@tanstack/react-router'

import type { BlogPost, GameSearchSort, Locale, PublicGame } from '#/lib/ggemu'
import { formatCopy, getHomeFaqs, getI18n } from '#/lib/i18n'

import type { GamesSectionProps, HomeCopy, SearchFormProps } from './types'

export const HOME_BLOG_POST_LIMIT = 4

const platformBadges: Record<string, string> = {
  'ARCADE': 'ARCADE',
  'Atari': 'ATARI',
  'Famicom': 'NES',
  'FLASH': 'FLASH',
  'HTML5': 'HTML5',
  'DOS': 'DOS',
  'Genesis': 'GENESIS',
  'Java': 'JAVA',
  'Game Boy': 'GB',
  'Game Boy Advance': 'GBA',
  'Game Boy Color': 'GBC',
  'Master System': 'SMS',
  'MS-DOS': 'DOS',
  'N64': 'N64',
  'Neo Geo': 'NEO',
  'NES': 'NES',
  'Nintendo 64': 'N64',
  'Nintendo DS': 'NDS',
  'PlayStation 1': 'PS1',
  'PlayStation Portable': 'PSP',
  'PS1': 'PS1',
  'PSP': 'PSP',
  'Sega CD': 'SCD',
  'Sega Genesis': 'GEN',
  'Super Famicom': 'SNES',
}

export function HomeLatestBlogPostsSection({
  blogPosts,
  lang,
}: {
  blogPosts: Array<BlogPost>
  lang: Locale
}) {
  const posts = blogPosts.filter((post) => getBlogPostRouteId(post)).slice(0, HOME_BLOG_POST_LIMIT)
  const t = getI18n(lang).home

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="bg-base-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-base-content">
              {t.latestBlogPosts}
            </h2>
            <p className="mt-2 text-sm leading-6 text-base-content/65">
              {t.latestBlogSubtitle}
            </p>
          </div>
          <Link
            className="btn btn-outline btn-sm w-fit"
            params={{ locale: lang }}
            to="/$locale/blog"
          >
            {t.viewAllBlog}
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <HomeBlogPostCard
              blogPost={post}
              key={getBlogPostRouteId(post)}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeFaqSection({ lang }: { lang: Locale }) {
  const faq = getHomeFaqs(lang)

  return (
    <section className="bg-base-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-base-content">{faq.title}</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/65">
            {faq.subtitle}
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          {faq.items.map((item) => (
            <article
              className="rounded-lg border border-base-300 bg-base-100 p-4"
              key={item.question}
            >
              <h3 className="text-sm font-semibold text-base-content">
                {item.question}
              </h3>
              <p className="mt-3 text-sm leading-6 text-base-content/65">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SearchForm({
  filterOptions,
  filters,
  isLoading,
  mode,
  onFilterChange,
  onQueryChange,
  onReset,
  onSearch,
  pagination,
  t,
}: SearchFormProps) {
  const searchPlaceholder = getSearchPlaceholder(t, pagination.total)

  if (mode === 'sidebar') {
    return (
      <form className="flex flex-col gap-3" onSubmit={onSearch}>
        <input
          className="input input-bordered w-full"
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={filters.query}
        />
        <button className="btn btn-primary w-full" disabled={isLoading} type="submit">
          <i className="ri-search-line" />
          {t.search}
        </button>
        <FilterSelects
          filterOptions={filterOptions}
          filters={filters}
          isLoading={isLoading}
          onFilterChange={onFilterChange}
          onReset={onReset}
          t={t}
        />
      </form>
    )
  }

  return (
    <form className="flex max-w-5xl flex-col gap-3" onSubmit={onSearch}>
      <div className="join w-full">
        <input
          className="input input-bordered join-item min-w-0 flex-1"
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={filters.query}
        />
        <button className="btn btn-primary join-item" disabled={isLoading} type="submit">
          <i className="ri-search-line" />
          {t.search}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <FilterSelects
          filterOptions={filterOptions}
          filters={filters}
          isLoading={isLoading}
          onFilterChange={onFilterChange}
          onReset={onReset}
          t={t}
        />
      </div>
    </form>
  )
}

export function FilterSelects({
  filterOptions,
  filters,
  isLoading,
  onFilterChange,
  onReset,
  t,
}: Omit<SearchFormProps, 'mode' | 'onQueryChange' | 'onSearch' | 'pagination'>) {
  return (
    <>
      <select
        className="select select-bordered w-full"
        onChange={(event) => onFilterChange('platform', event.currentTarget.value)}
        value={filters.platform}
      >
        <option value="">{t.allPlatforms}</option>
        {filterOptions.platforms.map((platform) => (
          <option key={platform.name} value={platform.name}>
            {platform.name}
          </option>
        ))}
      </select>

      <select
        className="select select-bordered w-full"
        onChange={(event) => onFilterChange('category', event.currentTarget.value)}
        value={filters.category}
      >
        <option value="">{t.allCategories}</option>
        {filterOptions.categories.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        className="select select-bordered w-full"
        onChange={(event) =>
          onFilterChange('sort', event.currentTarget.value as GameSearchSort)
        }
        value={filters.sort}
      >
        <option value="newest">{t.newest}</option>
        <option value="popular">{t.popular}</option>
        <option value="oldest">{t.oldest}</option>
        <option value="name_asc">{t.nameAsc}</option>
      </select>

      <button
        className="btn btn-ghost"
        disabled={isLoading}
        onClick={onReset}
        type="button"
      >
        <i className="ri-refresh-line" />
        {t.reset}
      </button>
    </>
  )
}

export function getSearchPlaceholder(t: HomeCopy, total: number) {
  return `${t.searchPlaceholder} ${formatCopy(t.totalGames, { total })}`
}

export function GamesSection({
  games,
  gridClassName,
  isLoading,
  lang,
  onLoadPage,
  page,
  pages,
  pagination,
  sectionClassName,
  showHeader = true,
  t,
}: GamesSectionProps) {
  return (
    <section className={sectionClassName}>
      {showHeader ? (
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-semibold">{t.featured}</h2>
            <p className="text-sm text-base-content/60">
              {formatCopy(t.page, { page, pages })}
            </p>
          </div>
          <span className="text-sm text-base-content/60">
            {pagination.total} / {pagination.limit}
          </span>
        </div>
      ) : null}

      {games.length > 0 ? (
        <div className={`${gridClassName} ${isLoading ? 'opacity-60' : ''}`}>
          {games.map((game) => (
            <GameCard game={game} key={game._id ?? game.url_slug} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="rounded-box border border-base-300 bg-base-100 p-12 text-center text-base-content/60">
          {t.empty}
        </div>
      )}

      <div className="join mx-auto pt-1">
        <button
          className={`btn join-item ${page <= 1 ? 'btn-disabled' : ''}`}
          disabled={isLoading || page <= 1}
          onClick={() => onLoadPage(Math.max(1, page - 1))}
          type="button"
        >
          <i className="ri-arrow-left-s-line" />
          {t.previous}
        </button>
        <button className="btn join-item btn-disabled">
          {formatCopy(t.page, { page, pages })}
        </button>
        <button
          className={`btn join-item ${page >= pages ? 'btn-disabled' : ''}`}
          disabled={isLoading || page >= pages}
          onClick={() => onLoadPage(Math.min(pages, page + 1))}
          type="button"
        >
          {t.next}
          <i className="ri-arrow-right-s-line" />
        </button>
      </div>
    </section>
  )
}

function HomeBlogPostCard({
  blogPost,
  lang,
}: {
  blogPost: BlogPost
  lang: Locale
}) {
  const id = getBlogPostRouteId(blogPost)
  const title = blogPost.title?.trim() || getI18n(lang).home.blogPostFallback

  return (
    <Link
      className="group overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      params={{ blogId: id, locale: lang }}
      to="/$locale/blog/$blogId"
    >
      <div className="aspect-[16/9] bg-base-300">
        {blogPost.cover_image_url ? (
          <img
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            src={blogPost.cover_image_url}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-base-content/40">
            Blog
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-base-content/50">
          {formatBlogDate(blogPost.created_at, lang)}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-10 text-base font-semibold leading-snug text-base-content">
          {title}
        </h3>
        {blogPost.excerpt ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-base-content/65">
            {blogPost.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

function GameCard({ game, lang }: { game: PublicGame; lang: Locale }) {
  const gameId = game.url_slug || game._id || ''
  const platformBadge = getPlatformBadge(game)

  return (
    <Link
      className="card card-compact group h-full overflow-hidden border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      params={{ gameId, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      <figure className="relative aspect-[4/3] bg-base-300">
        {game.game_cover ? (
          <img
            alt={game.name ?? 'Game cover'}
            className="h-full w-full object-cover"
            loading="lazy"
            src={game.game_cover}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base-content/40">
            Retro
          </div>
        )}
        {platformBadge ? (
          <span className="badge badge-primary badge-sm absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate border-0 shadow">
            {platformBadge}
          </span>
        ) : null}
        <span className="absolute inset-0 grid place-items-center bg-base-300/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-2xl text-primary-content shadow-lg">
            <i className="ri-play-fill text-primary-content" />
          </span>
        </span>
      </figure>
      <div className="card-body gap-2 p-3">
        <h3 className="line-clamp-2 min-h-11 text-sm font-semibold leading-snug">
          {game.name}
        </h3>
      </div>
    </Link>
  )
}

function getBlogPostRouteId(blogPost: BlogPost) {
  return blogPost.slug?.trim() || blogPost._id?.trim() || ''
}

function formatBlogDate(value: string | undefined, locale: Locale) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getPlatformBadge(game: PublicGame) {
  const slug = game.platform_slug ?? game.platformSlug

  if (slug?.trim()) {
    return slug.trim().toUpperCase()
  }

  const platform = game.platform?.trim()

  if (!platform) {
    return ''
  }

  return platformBadges[platform] ?? platformBadges[platform.toUpperCase()] ?? platform
    .split(/[\s-]+/)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}
