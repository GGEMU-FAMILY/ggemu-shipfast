import {
  GamesSection,
  HomeFaqSection,
  HomeLatestBlogPostsSection,
  SearchForm,
} from './shared'
import { RecentPlayedGamesSection } from './recent-played-games'
import type { HomeTemplateProps } from './types'

export function TwoColumnHomeTemplate(props: HomeTemplateProps) {
  const { lang, latestBlogPosts, t } = props

  return (
    <>
      <RecentPlayedGamesSection lang={lang} />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-8">
        <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-box border border-base-300 bg-base-100 p-4">
            <h1 className="text-2xl font-semibold leading-tight text-base-content">
              {t.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-base-content/70">
              {t.subtitle}
            </p>
          </section>

          <section className="rounded-box border border-base-300 bg-base-100 p-4">
            <SearchForm {...props} mode="sidebar" />
          </section>
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <GamesSection
            {...props}
            gridClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            sectionClassName="flex min-w-0 flex-col gap-4"
            showHeader={false}
          />
        </div>
      </section>

      <HomeLatestBlogPostsSection blogPosts={latestBlogPosts} lang={lang} />
      <HomeFaqSection lang={lang} />
    </>
  )
}
