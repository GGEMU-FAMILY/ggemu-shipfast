import { createFileRoute, redirect } from '@tanstack/react-router'

import { getGameDetail } from '#/lib/ggemu'
import { normalizeLocale } from '#/lib/i18n'
import { siteConfig } from '#/lib/site-config'

export const Route = createFileRoute('/$locale/games/$gameId/play')({
  beforeLoad: ({ location, params }) => {
    if (!location.searchStr) {
      return
    }

    throw redirect({
      params,
      replace: true,
      to: '/$locale/games/$gameId/play',
    })
  },
  loader: ({ params }) => getGameDetail({ data: { id: params.gameId } }),
  component: LocalizedPlayGamePage,
})

function LocalizedPlayGamePage() {
  const game = Route.useLoaderData()
  const { gameId, locale } = Route.useParams()
  const lang = normalizeLocale(locale)
  const embedId = encodeURIComponent(game._id || game.url_slug || gameId)
  const refcode = encodeURIComponent(siteConfig.GGEMU_REFCODE)
  const embedSrc = `https://ggemu.com/${lang}/game/${embedId}?r=${refcode}&embed=1`

  return (
    <main className="min-h-screen bg-black">
      <iframe
        allow="autoplay; gamepad"
        allowFullScreen
        className="h-screen w-full border-0 bg-black"
        src={embedSrc}
        title={game.name ?? 'Retro game'}
      />
    </main>
  )
}
