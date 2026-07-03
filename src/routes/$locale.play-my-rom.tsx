import { createFileRoute } from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { normalizeLocale } from '#/lib/i18n'
import { getLocalizedSeoLinks, getSeoOrigin } from '#/lib/seo'

export const Route = createFileRoute('/$locale/play-my-rom')({
  loader: () => getSeoOrigin(),
  head: ({ loaderData, params }) => ({
    links: loaderData
      ? getLocalizedSeoLinks({
          locale: normalizeLocale(params.locale),
          origin: loaderData,
          path: '/play-my-rom',
        })
      : undefined,
    meta: [
      { title: 'Play My ROM' },
      {
        name: 'description',
        content: 'Load and play your own ROM through the embedded GGEMU player.',
      },
    ],
  }),
  component: PlayMyRomPage,
})

function PlayMyRomPage() {
  const { locale } = Route.useParams()
  const lang = normalizeLocale(locale)
  const iframeSrc = `https://ggemu.com/${lang}/play-my-rom?isolated=1&embed=1`

  return (
    <SiteLayout locale={lang}>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <iframe
          allow="fullscreen; gamepad; autoplay"
          className="min-h-[720px] flex-1 rounded-lg border border-base-300 bg-base-100"
          src={iframeSrc}
          title="Play My ROM"
        />
      </section>
    </SiteLayout>
  )
}
