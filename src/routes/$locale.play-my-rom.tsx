import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { SiteLayout } from '#/components/site-layout'
import { normalizeLocale } from '#/lib/i18n'
import { getLocalizedSeoLinks, getSeoOrigin } from '#/lib/seo'

const GGEMU_ORIGIN = 'https://ggemu.com'

const crossOriginIsolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Permissions-Policy': 'cross-origin-isolated=(self "https://ggemu.com")',
} as const

type PlayMyRomSearch = {
  isolated?: 1
}

function validatePlayMyRomSearch(search: Record<string, unknown>): PlayMyRomSearch {
  return {
    isolated: isIsolatedSearchValue(search.isolated) ? 1 : undefined,
  }
}

function isIsolatedSearch(search: unknown) {
  return (
    Boolean(search) &&
    typeof search === 'object' &&
    isIsolatedSearchValue((search as Record<string, unknown>).isolated)
  )
}

export const Route = createFileRoute('/$locale/play-my-rom')({
  validateSearch: validatePlayMyRomSearch,
  loader: () => getSeoOrigin(),
  headers: ({ match }) =>
    isIsolatedSearch(match.search) ? crossOriginIsolationHeaders : undefined,
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
  const { isolated } = Route.useSearch()
  const lang = normalizeLocale(locale)
  const iframeSrc = `${GGEMU_ORIGIN}/${lang}/play-my-rom?${buildIframeSearch(isolated === 1)}`

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== GGEMU_ORIGIN || !isIsolatedMessage(event.data)) {
        return
      }

      const url = new URL(window.location.href)

      if (url.searchParams.get('isolated') === '1') {
        return
      }

      url.searchParams.set('isolated', '1')
      const nextUrl = url.toString()

      window.location.href = nextUrl
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (!window.crossOriginIsolated) {
        return
      }

      window.setTimeout(() => {
        const url = new URL(window.location.href)

        url.searchParams.delete('isolated')
        window.location.href = url.toString()
      }, 0)
    }
  }, [])

  return (
    <SiteLayout locale={lang}>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <iframe
          allow={
            isolated === 1
              ? 'fullscreen; gamepad; autoplay; cross-origin-isolated'
              : 'fullscreen; gamepad; autoplay'
          }
          allowFullScreen
          className="min-h-[720px] flex-1 rounded-lg border border-base-300 bg-base-100"
          src={iframeSrc}
          title="Play My ROM"
        />
      </section>
    </SiteLayout>
  )
}

function buildIframeSearch(isIsolated: boolean) {
  const params = new URLSearchParams({
    embed: '1',
  })

  if (isIsolated) {
    params.set('isolated', '1')
  }

  return params.toString()
}

function isIsolatedSearchValue(value: unknown) {
  return value === 1 || value === '1'
}

function isIsolatedMessage(data: unknown) {
  return (
    Boolean(data) &&
    typeof data === 'object' &&
    (data as Record<string, unknown>).type === 'isolated'
  )
}
