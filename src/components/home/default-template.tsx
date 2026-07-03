import {
  GamesSection,
  HomeFaqSection,
  HomeLatestBlogPostsSection,
  SearchForm,
} from './shared'
import type { HomeTemplateProps } from './types'

export function DefaultHomeTemplate(props: HomeTemplateProps) {
  const { lang, latestBlogPosts, t } = props

  return (
    <>
      <section className="bg-base-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-tight text-base-content sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-base-content/70 sm:text-lg">
              {t.subtitle}
            </p>
          </div>

          <SearchForm {...props} mode="default" />
        </div>
      </section>

      <GamesSection
        {...props}
        gridClassName="grid gap-4 sm:grid-cols-3 lg:grid-cols-5"
        sectionClassName="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8"
      />

      <HomeLatestBlogPostsSection blogPosts={latestBlogPosts} lang={lang} />
      <HomeFaqSection lang={lang} />
    </>
  )
}
