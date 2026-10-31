import { createFileRoute, redirect } from '@tanstack/react-router'

import { getGameDetail } from '#/lib/ggemu'
import { normalizeLocale } from '#/lib/i18n'
import { siteConfig } from '#/lib/site-config'
import { useCurrentSiteTheme } from '#/lib/use-site-theme'

const noindexHeaders = {
  'X-Robots-Tag': 'noindex, nofollow',
} as const

export const Route = createFileRoute('/$locale/games/$gameId/download')({
  beforeLoad: ({ location, params }) => {
    if (!location.searchStr) {
      return
    }

    throw redirect({
      params,
      replace: true,
      to: '/$locale/games/$gameId/download',
    })
  },
  loader: ({ params }) => getGameDetail({ data: { id: params.gameId } }),
  headers: () => noindexHeaders,
  component: LocalizedDownloadGamePage,
})

function LocalizedDownloadGamePage() {
  const game = Route.useLoaderData()
  const { gameId, locale } = Route.useParams()
  const lang = normalizeLocale(locale)
  const embedId = encodeURIComponent(game.url_slug || game._id || gameId)
  const theme = useCurrentSiteTheme()
  const params = new URLSearchParams({
    r: siteConfig.GGEMU_REFCODE,
    embed: '1',
    theme,
  })
  const embedSrc = `https://ggemu.com/${lang}/download/${embedId}?${params.toString()}`

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
