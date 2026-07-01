import { createFileRoute } from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { getI18n, normalizeLocale } from '#/lib/i18n'
import { siteConfig } from '#/lib/site-config'

export const Route = createFileRoute('/$locale/about')({
  head: ({ params }) => {
    const locale = normalizeLocale(params.locale)
    const t = getI18n(locale).about

    return {
      meta: [
        { title: `${t.title} | ${siteConfig.SITE_NAME}` },
        { name: 'description', content: t.description },
      ],
    }
  },
  component: AboutPage,
})

function AboutPage() {
  const { locale } = Route.useParams()
  const lang = normalizeLocale(locale)
  const t = getI18n(lang).about

  return (
    <SiteLayout locale={lang}>
      <section className="mx-auto min-h-[50vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold">{t.title}</h1>
      </section>
    </SiteLayout>
  )
}
