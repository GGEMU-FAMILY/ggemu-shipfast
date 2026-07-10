import { createFileRoute, redirect } from '@tanstack/react-router'

import { getGameDetail } from '#/lib/ggemu'
import { normalizeLocale } from '#/lib/i18n'
import { siteConfig } from '#/lib/site-config'

const pspCrossOriginIsolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Permissions-Policy': 'cross-origin-isolated=(self "https://ggemu.com")',
} as const

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
  headers: ({ loaderData }) =>
    loaderData && isPspGame(loaderData) ? pspCrossOriginIsolationHeaders : undefined,
  component: LocalizedPlayGamePage,
})

function LocalizedPlayGamePage() {
  const game = Route.useLoaderData()
  const { gameId, locale } = Route.useParams()
  const lang = normalizeLocale(locale)
  const embedId = encodeURIComponent(game._id || game.url_slug || gameId)
  const refcode = encodeURIComponent(siteConfig.GGEMU_REFCODE)
  const isPsp = isPspGame(game)
  const embedSrc = `https://ggemu.com/${lang}/game/${embedId}?${buildEmbedSearch(refcode, isPsp)}`

  return (
    <main className="min-h-screen bg-black">
      <iframe
        allow={
          isPsp
            ? 'autoplay; gamepad; fullscreen; cross-origin-isolated'
            : 'autoplay; gamepad'
        }
        allowFullScreen
        className="h-screen w-full border-0 bg-black"
        src={embedSrc}
        title={game.name ?? 'Retro game'}
      />
    </main>
  )
}

function buildEmbedSearch(refcode: string, isPsp: boolean) {
  const params = new URLSearchParams({
    r: refcode,
    embed: '1',
  })

  if (isPsp) {
    params.set('isolated', '1')
    params.set('autoplay', '1')
  }

  return params.toString()
}

function isPspGame(game: {
  platform?: string
  platform_slug?: string
  platformSlug?: string
  url_slug?: string
}) {
  return [game.platform, game.platform_slug, game.platformSlug, game.url_slug].some((value) =>
    isPspPlatform(value),
  )
}

function isPspPlatform(value: string | undefined) {
  const platform = value?.trim().toLowerCase()

  return (
    platform === 'psp' ||
    platform === 'playstation portable' ||
    platform?.includes('-psp-') ||
    platform?.endsWith('-psp')
  )
}
