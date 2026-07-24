import {
  Await,
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'

import {
  GameCardPreviewVideo,
  gameCardPreviewHandlers,
} from '#/components/game-card-preview'
import { SiteLayout } from '#/components/site-layout'
import { saveRecentPlayedGame } from '#/components/home/recent-played-games'
import {
  getGameDetailPageData,
  getRelatedGamePageData,
  type Locale,
  type PublicGame,
} from '#/lib/ggemu'
import {
  buildGameDetailSeo,
  getGameDetailFaqs,
  getI18n,
  normalizeLocale,
} from '#/lib/i18n'
import { getAlternateLinksFromCanonical } from '#/lib/seo'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallPromptWindow = Window & {
  __GGEMU_INSTALL_PROMPT__?: BeforeInstallPromptEvent | null
}

const defaultManifestHref = '/manifest.webmanifest'

export const Route = createFileRoute('/$locale/games/$gameId')({
  beforeLoad: ({ location, params }) => {
    if (location.pathname.endsWith('/play') || !location.searchStr) {
      return
    }

    throw redirect({
      params,
      replace: true,
      to: '/$locale/games/$gameId',
    })
  },
  loader: async ({ params }) => {
    const detail = await getGameDetailPageData({
      data: { id: params.gameId, locale: normalizeLocale(params.locale) },
    })
    const currentId = getGameRouteId(detail.game) || params.gameId

    return {
      ...detail,
      relatedGamesPromise: getRelatedGamePageData({
        data: {
          category: detail.game.categories?.[0],
          currentId,
          developer: detail.game.developer,
        },
      }),
    }
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {}
    }

    const { canonicalUrl, game } = loaderData
    const locale = normalizeLocale(params.locale)
    const seo = buildGameDetailSeo(game, locale)
    const image = game.game_cover
    const faqItems = getGameDetailFaqs(game, locale)
    const playPath = buildGamePlayPath(locale, params.gameId)
    const structuredData = buildGameStructuredData({
      canonicalUrl,
      faqItems,
      game,
      locale,
      seo,
    })

    return {
      links: [
        { rel: 'canonical', href: canonicalUrl },
        {
          rel: 'manifest',
          href: buildGameManifestHref({
            description: seo.description,
            name: game.name,
            startUrl: playPath,
          }),
        },
        ...getAlternateLinksFromCanonical(canonicalUrl),
      ],
      meta: [
        { title: seo.title },
        { name: 'description', content: seo.description },
        { name: 'keywords', content: seo.keywords },
        { property: 'og:title', content: seo.title },
        { property: 'og:description', content: seo.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:locale', content: toOpenGraphLocale(locale) },
        ...(image ? [{ property: 'og:image', content: image }] : []),
        { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: seo.title },
        { name: 'twitter:description', content: seo.description },
        ...(image ? [{ name: 'twitter:image', content: image }] : []),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: serializeJsonLd(structuredData),
        },
      ],
    }
  },
  component: LocalizedGameDetailPage,
})

function getRelatedGames(
  relatedByCategory: Array<PublicGame>,
  relatedByDeveloper: Array<PublicGame>,
) {
  const seen = new Set<string>()

  return [...relatedByCategory, ...relatedByDeveloper]
    .filter((game) => {
      const id = getGameRouteId(game)

      if (!id || seen.has(id)) {
        return false
      }

      seen.add(id)
      return true
    })
    .slice(0, 6)
}

function getGameRouteId(game: PublicGame) {
  return game.url_slug?.trim() || game._id?.trim() || ''
}

function buildGamePlayPath(locale: Locale, gameId: string) {
  return `/${locale}/games/${encodeURIComponent(gameId)}/play`
}

function buildGameManifestHref({
  description,
  name,
  startUrl,
}: {
  description: string
  name?: string
  startUrl: string
}) {
  const params = new URLSearchParams({
    description,
    name: name?.trim() || 'GGEMU',
    start_url: startUrl,
  })

  return `/manifest.webmanifest?${params.toString()}`
}

function toOpenGraphLocale(locale: Locale) {
  if (locale === 'zh-CN') {
    return 'zh_CN'
  }

  return locale
}

function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function buildGameStructuredData({
  canonicalUrl,
  faqItems,
  game,
  locale,
  seo,
}: {
  canonicalUrl: string
  faqItems: ReturnType<typeof getGameDetailFaqs>
  game: PublicGame
  locale: Locale
  seo: ReturnType<typeof buildGameDetailSeo>
}) {
  const homeUrl = new URL(`/${locale}`, canonicalUrl).toString()
  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    '@id': `${canonicalUrl}#game`,
    name: game.name,
    description: seo.description,
    url: canonicalUrl,
    image: game.game_cover,
    gamePlatform: game.platform,
    applicationCategory: 'Game',
    genre: game.categories,
    inLanguage: game.languages,
    numberOfPlayers: game.players,
    publisher: game.developer
      ? {
          '@type': 'Organization',
          name: game.developer,
        }
      : undefined,
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: getI18n(locale).detail.home,
        item: homeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: game.name,
        item: canonicalUrl,
      },
    ],
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return [removeEmptySchemaValues(gameSchema), breadcrumbSchema, faqSchema]
}

function removeEmptySchemaValues<T extends Record<string, unknown>>(schema: T) {
  return Object.fromEntries(
    Object.entries(schema).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }

      return value !== undefined && value !== ''
    }),
  )
}

function LocalizedGameDetailPage() {
  const { canonicalUrl, game, relatedGamesPromise } = Route.useLoaderData()
  const { gameId, locale } = Route.useParams()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const lang = normalizeLocale(locale)
  const t = getI18n(lang).detail
  const categories = game.categories ?? []
  const languages = game.languages ?? []
  const faqItems = getGameDetailFaqs(game, lang)
  const playPath = buildGamePlayPath(lang, gameId)
  const manifestHref = buildGameManifestHref({
    description: buildGameDetailSeo(game, lang).description,
    name: game.name,
    startUrl: playPath,
  })

  if (pathname.endsWith('/play')) {
    return <Outlet />
  }

  return (
    <SiteLayout locale={lang}>
      <div className="bg-base-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
          <section>
            <div className="breadcrumbs text-sm">
              <ul className="min-w-0">
                <li>
                  <Link params={{ locale: lang }} search={{}} to="/$locale">
                    {t.home}
                  </Link>
                </li>
                <li className="min-w-0">
                  <span className="block max-w-[min(70vw,32rem)] truncate">{game.name}</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(320px,440px)_1fr] lg:gap-8">
            <div className="aspect-[4/3] w-full self-start overflow-hidden rounded-box border border-base-300 bg-base-200 shadow-sm">
              {game.game_cover ? (
                <img
                  alt={game.name ?? 'Game cover'}
                  className="h-full w-full object-cover"
                  src={game.game_cover}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-base-300 text-base-content/40">
                  Retro
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col justify-center gap-3 sm:gap-6 lg:self-center">
              <div>
                <div className="mb-2 flex flex-wrap gap-2 sm:mb-3">
                  <span className="badge badge-sm badge-success badge-outline gap-1 sm:badge-md">
                    <i className="ri-global-line" />
                    {t.browserReady}
                  </span>
                  <span className="badge badge-sm badge-primary badge-outline gap-1 sm:badge-md">
                    <i className="ri-download-cloud-2-line" />
                    {t.noDownload}
                  </span>
                  {game.platform ? (
                    <span className="badge badge-sm badge-primary max-w-full gap-1 sm:badge-md">
                      <i className="ri-gamepad-line" />
                      <span className="truncate">{game.platform}</span>
                    </span>
                  ) : null}
                </div>
                <h1 className="max-w-4xl truncate text-2xl font-semibold leading-tight sm:text-4xl">
                  {game.name}
                </h1>
                {game.description ? (
                  <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-base-content/70 sm:mt-4 sm:line-clamp-none sm:text-lg sm:leading-7">
                    {game.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:flex sm:flex-row">
                <a
                  className="btn btn-primary btn-lg px-8 text-primary-content hover:text-primary-content sm:w-auto"
                  href={playPath}
                  onClick={() => saveRecentPlayedGame(game, gameId)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <i className="ri-play-fill text-xl" />
                  {t.play}
                </a>
                <div className="grid grid-cols-2 gap-3 sm:contents">
                  <GameInstallButton labels={t} manifestHref={manifestHref} />
                  <GameShareActions
                    canonicalUrl={canonicalUrl}
                    game={game}
                    labels={t}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left sm:max-w-md sm:gap-6">
                <Stat label={t.plays} value={game.plays_count ?? 0} />
                <Stat label={t.views} value={game.views_count ?? 0} />
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="flex flex-col gap-6">
              <KeywordPanel title={t.keywords} value={game.keywords} />
              <ContentPanel title={t.howToPlay} value={game.how_to_play} />
              <FaqSection items={faqItems} title={t.faq} />
              <Await promise={relatedGamesPromise} fallback={<RelatedGamesFallback title={t.relatedGames} />}>
                {(related) => (
                  <RelatedGameSection
                    games={getRelatedGames(
                      related.relatedByCategory,
                      related.relatedByDeveloper,
                    )}
                    lang={lang}
                    title={t.relatedGames}
                  />
                )}
              </Await>
            </div>

            <aside className="flex flex-col gap-4">
              <section className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
                <h2 className="text-lg font-semibold">{t.details}</h2>
                <dl className="mt-4 grid gap-3 text-sm">
                  <Fact icon="ri-gamepad-line" label={t.platform} value={game.platform} />
                  <Fact icon="ri-building-2-line" label={t.developer} value={game.developer} />
                  <Fact icon="ri-calendar-line" label={t.released} value={game.released_year} />
                  <Fact icon="ri-user-line" label={t.players} value={String(game.players ?? 1)} />
                </dl>
              </section>

              <TagSection emptyText={t.noData} items={categories} title={t.categories} />
              <TagSection emptyText={t.noData} items={languages} title={t.languages} />
            </aside>
          </section>
        </div>
      </div>
    </SiteLayout>
  )
}

function GameInstallButton({
  labels,
  manifestHref,
}: {
  labels: ReturnType<typeof getI18n>['detail']
  manifestHref: string
}) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    syncManifestLink(manifestHref)
    setStoredInstallPrompt(setInstallPrompt)

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      const prompt = event as BeforeInstallPromptEvent

      ;(window as InstallPromptWindow).__GGEMU_INSTALL_PROMPT__ = prompt
      setInstallPrompt(prompt)
      setIsGuideOpen(false)
      setMessage('')
    }

    function handleStoredInstallPrompt() {
      setStoredInstallPrompt(setInstallPrompt)
      setIsGuideOpen(false)
      setMessage('')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('ggemu:installprompt', handleStoredInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('ggemu:installprompt', handleStoredInstallPrompt)
      syncManifestLink(defaultManifestHref)
    }
  }, [manifestHref])

  async function handleInstall() {
    setMessage('')

    if (!installPrompt) {
      setIsGuideOpen(true)
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice

    ;(window as InstallPromptWindow).__GGEMU_INSTALL_PROMPT__ = null
    setInstallPrompt(null)

    if (choice.outcome === 'dismissed') {
      setMessage(labels.installDismissed)
    }
  }

  return (
    <>
      <button
        className="btn btn-outline btn-lg w-full px-5 sm:w-auto"
        onClick={() => void handleInstall()}
        type="button"
      >
        <i className="ri-download-cloud-2-line text-xl" />
        {labels.install}
      </button>

      {message ? (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-info py-2 text-sm">{message}</div>
        </div>
      ) : null}

      {isGuideOpen ? (
        <InstallGuideModal labels={labels} onClose={() => setIsGuideOpen(false)} />
      ) : null}
    </>
  )
}

function setStoredInstallPrompt(
  setInstallPrompt: (prompt: BeforeInstallPromptEvent | null) => void,
) {
  setInstallPrompt((window as InstallPromptWindow).__GGEMU_INSTALL_PROMPT__ ?? null)
}

function InstallGuideModal({
  labels,
  onClose,
}: {
  labels: ReturnType<typeof getI18n>['detail']
  onClose: () => void
}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{labels.installGuideTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-base-content/70">
              {labels.installGuideIntro}
            </p>
          </div>
          <button
            aria-label="Close"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
            type="button"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 text-sm">
          <InstallGuideStep icon="ri-share-forward-line" text={labels.installGuideIos} />
          <InstallGuideStep icon="ri-more-2-fill" text={labels.installGuideAndroid} />
          <InstallGuideStep icon="ri-computer-line" text={labels.installGuideDesktop} />
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose} type="button">
            {labels.installGuideClose}
          </button>
        </div>
      </div>
      <button
        aria-label="Close"
        className="modal-backdrop"
        onClick={onClose}
        type="button"
      />
    </div>
  )
}

function InstallGuideStep({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-box border border-base-300 bg-base-200/60 p-3">
      <i className={`${icon} mt-0.5 text-lg text-primary`} />
      <p className="leading-6 text-base-content/80">{text}</p>
    </div>
  )
}

function syncManifestLink(href: string) {
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]'),
  )

  if (links.length === 0) {
    const link = document.createElement('link')

    link.rel = 'manifest'
    link.href = href
    document.head.append(link)
    return
  }

  links.forEach((link) => {
    link.href = href
  })
}

function GameShareActions({
  canonicalUrl,
  game,
  labels,
}: {
  canonicalUrl: string
  game: PublicGame
  labels: ReturnType<typeof getI18n>['detail']
}) {
  const dropdownRef = useRef<HTMLDetailsElement>(null)
  const [posterUrl, setPosterUrl] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false)
  const title = game.name || 'GGEMU'

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.open) {
        return
      }

      if (dropdownRef.current.contains(event.target as Node)) {
        return
      }

      closeDropdown()
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function closeDropdown() {
    if (dropdownRef.current) {
      dropdownRef.current.open = false
    }
  }

  async function handleGeneratePoster() {
    closeDropdown()
    setIsGeneratingPoster(true)

    try {
      setPosterUrl(await createPosterDataUrl({ cta: labels.posterScanCta, game, url: canonicalUrl }))
    } finally {
      setIsGeneratingPoster(false)
    }
  }

  async function handleSystemShare() {
    closeDropdown()
    setShareMessage('')

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url: canonicalUrl,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        await copyShareLink(canonicalUrl)
      }
      return
    }

    await copyShareLink(canonicalUrl)
  }

  async function copyShareLink(url: string) {
    await navigator.clipboard?.writeText(url).catch(() => undefined)
    setShareMessage(labels.shareUnavailableCopied)
  }

  return (
    <>
      <details className="dropdown" ref={dropdownRef}>
        <summary className="btn btn-outline btn-lg w-full px-5 sm:w-auto">
          <i className="ri-share-line text-xl" />
          {labels.share}
        </summary>
        <ul className="menu dropdown-content z-50 mt-2 w-44 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl">
          <li>
            <button
              disabled={isGeneratingPoster}
              onClick={() => void handleGeneratePoster()}
              type="button"
            >
              <i className={isGeneratingPoster ? 'loading loading-spinner loading-xs' : 'ri-image-line'} />
              {labels.generatePoster}
            </button>
          </li>
          <li>
            <button onClick={() => void handleSystemShare()} type="button">
              <i className="ri-share-forward-line" />
              {labels.systemShare}
            </button>
          </li>
        </ul>
      </details>

      {shareMessage ? (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-info py-2 text-sm">{shareMessage}</div>
        </div>
      ) : null}

      {posterUrl ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{labels.posterTitle}</h2>
              <button
                aria-label="Close"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setPosterUrl('')}
                type="button"
              >
                <i className="ri-close-line text-xl" />
              </button>
            </div>
            <img
              alt={labels.posterTitle}
              className="mt-4 w-full rounded-box border border-base-300 bg-base-200"
              src={posterUrl}
            />
            <div className="modal-action">
              <a
                className="btn btn-primary"
                download={`${getPosterFileName(title)}.png`}
                href={posterUrl}
              >
                <i className="ri-download-line" />
                {labels.downloadPoster}
              </a>
            </div>
          </div>
          <button
            aria-label="Close"
            className="modal-backdrop"
            onClick={() => setPosterUrl('')}
            type="button"
          />
        </div>
      ) : null}
    </>
  )
}

async function createPosterDataUrl({
  cta,
  game,
  url,
}: {
  cta: string
  game: PublicGame
  url: string
}) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return ''
  }

  canvas.width = 720
  canvas.height = 1080
  drawPosterBackground(context)
  await drawPosterCover(context, game)
  const titleBottom = drawPosterTitle(context, game.name || 'GGEMU')
  drawPosterKeywords(context, game.keywords, titleBottom + 14)
  drawPosterQrCard(context)
  await drawPosterQr(context, url)
  drawPosterCta(context, cta)

  return canvas.toDataURL('image/png')
}

function drawPosterBackground(context: CanvasRenderingContext2D) {
  const gradient = context.createLinearGradient(0, 0, 720, 1080)

  gradient.addColorStop(0, '#0b1020')
  gradient.addColorStop(0.42, '#172554')
  gradient.addColorStop(0.7, '#0f766e')
  gradient.addColorStop(1, '#101827')
  context.fillStyle = gradient
  context.fillRect(0, 0, 720, 1080)

  const glow = context.createRadialGradient(590, 760, 20, 590, 760, 420)

  glow.addColorStop(0, 'rgba(45, 212, 191, 0.38)')
  glow.addColorStop(0.48, 'rgba(45, 212, 191, 0.12)')
  glow.addColorStop(1, 'rgba(45, 212, 191, 0)')
  context.fillStyle = glow
  context.fillRect(0, 0, 720, 1080)

  context.fillStyle = 'rgba(255, 255, 255, 0.08)'
  context.beginPath()
  context.moveTo(0, 650)
  context.lineTo(170, 590)
  context.lineTo(0, 930)
  context.closePath()
  context.fill()
}

async function drawPosterCover(context: CanvasRenderingContext2D, game: PublicGame) {
  const coverUrl = game.game_cover ? getImageProxyUrl(game.game_cover) : ''

  context.save()
  roundedRect(context, 32, 32, 656, 492, 24)
  context.clip()

  if (coverUrl) {
    const cover = await loadImage(coverUrl).catch(() => null)

    if (cover) {
      drawCoverImage(context, cover, 32, 32, 656, 492)
    } else {
      drawPosterCoverFallback(context)
    }
  } else {
    drawPosterCoverFallback(context)
  }

  context.restore()
}

function drawPosterCoverFallback(context: CanvasRenderingContext2D) {
  const fallback = context.createLinearGradient(32, 32, 688, 524)

  fallback.addColorStop(0, '#334155')
  fallback.addColorStop(1, '#0f766e')
  context.fillStyle = fallback
  context.fillRect(32, 32, 656, 492)
}

function drawPosterTitle(context: CanvasRenderingContext2D, title: string) {
  context.font = '800 44px Arial, sans-serif'
  const titleLines = getPosterTitleLines(context, title, 600, 2)

  context.fillStyle = '#ffffff'
  context.textBaseline = 'top'

  titleLines.forEach((line, index) => {
    context.fillText(line, 48, 552 + index * 56, 624)
  })

  return 552 + titleLines.length * 56
}

function drawPosterKeywords(
  context: CanvasRenderingContext2D,
  keywords: string | undefined,
  y: number,
) {
  context.font = '600 22px Arial, sans-serif'
  const lines = getPosterKeywordLines(context, keywords, 640, 2)

  if (lines.length === 0) {
    return
  }

  context.fillStyle = 'rgba(255, 255, 255, 0.72)'
  context.textBaseline = 'top'

  lines.forEach((line, index) => {
    context.fillText(line, 48, y + index * 30, 640)
  })
}

function drawPosterQrCard(context: CanvasRenderingContext2D) {
}

async function drawPosterQr(context: CanvasRenderingContext2D, url: string) {
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 10,
    type: 'image/png',
    width: 260,
  })
  const qr = await loadImage(qrDataUrl)

  context.drawImage(qr, 246, 742, 228, 228)
}

function drawPosterCta(context: CanvasRenderingContext2D, cta: string) {
  context.fillStyle = '#ffffff'
  context.font = '800 24px Arial, sans-serif'
  const lines = getCenteredTextLines(context, cta, 390)

  context.textAlign = 'center'
  context.textBaseline = 'middle'

  lines.forEach((line, index) => {
    context.fillText(line, 360, 1014 + index * 30, 520)
  })

  context.textAlign = 'start'
}

function getCenteredTextLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.includes(' ') ? text.split(' ') : Array.from(text)
  const lines: Array<string> = []
  let line = ''

  for (const word of words) {
    const separator = text.includes(' ') && line ? ' ' : ''
    const nextLine = `${line}${separator}${word}`

    if (context.measureText(nextLine).width <= maxWidth) {
      line = nextLine
      continue
    }

    if (line) {
      lines.push(line)
    }

    line = word
  }

  if (line) {
    lines.push(line)
  }

  return lines.slice(0, 2)
}

function getPosterKeywordLines(
  context: CanvasRenderingContext2D,
  keywords: string | undefined,
  maxWidth: number,
  maxLines: number,
) {
  const text = getKeywordItems(keywords).join(' · ')
  const lines: Array<string> = []
  let line = ''

  if (!text) {
    return lines
  }

  let hasMore = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    const nextLine = `${line}${char}`

    if (context.measureText(nextLine).width <= maxWidth) {
      line = nextLine
      continue
    }

    if (line) {
      lines.push(line)
    }

    if (lines.length === maxLines) {
      hasMore = true
      break
    }

    line = char
  }

  if (line && lines.length < maxLines) {
    lines.push(line)
  }

  if (hasMore && lines.length > 0) {
    lines[lines.length - 1] = truncateTextLine(context, lines[lines.length - 1], maxWidth)
  }

  return lines
}

function truncateTextLine(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  let truncated = text

  while (truncated && context.measureText(`${truncated}...`).width > maxWidth) {
    truncated = truncated.slice(0, -1)
  }

  return truncated ? `${truncated}...` : ''
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (image.naturalWidth - sourceWidth) / 2
  const sourceY = (image.naturalHeight - sourceHeight) / 2

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function getImageProxyUrl(url: string) {
  return `/api/share-image?url=${encodeURIComponent(url)}`
}

function getPosterTitleLines(
  context: CanvasRenderingContext2D,
  title: string,
  maxWidth: number,
  maxLines: number,
) {
  const normalized = title.trim()
  const lines: Array<string> = []
  let line = ''

  for (const char of normalized) {
    const nextLine = `${line}${char}`

    if (context.measureText(nextLine).width <= maxWidth) {
      line = nextLine
      continue
    }

    if (line) {
      lines.push(line)
    }

    line = char

    if (lines.length === maxLines) {
      break
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line)
  }

  if (lines.length === maxLines && lines.join('').length < normalized.length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, -1)}...`
  }

  return lines
}

function getPosterFileName(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'game-poster'
}

function Stat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <div className="text-sm text-base-content/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}

function ContentPanel({ title, value }: { title: string; value?: string }) {
  if (!value) {
    return null
  }

  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <i className="ri-file-text-line text-primary" />
        {title}
      </h2>
      <p className="mt-4 whitespace-pre-line leading-7 text-base-content/75">{value}</p>
    </section>
  )
}

function KeywordPanel({ title, value }: { title: string; value?: string }) {
  const keywords = getKeywordItems(value)

  if (keywords.length === 0) {
    return null
  }

  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <i className="ri-price-tag-3-line text-primary" />
        {title}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span className="badge badge-outline" key={keyword}>
            {keyword}
          </span>
        ))}
      </div>
    </section>
  )
}

function getKeywordItems(value?: string) {
  return (
    value
      ?.split(/[,，;；]/)
      .map((keyword) => keyword.trim())
      .filter(Boolean) ?? []
  )
}

function FaqSection({
  items,
  title,
}: {
  items: ReturnType<typeof getGameDetailFaqs>
  title: string
}) {
  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4">
        {items.map((item) => (
          <article key={item.question}>
            <h3 className="text-base font-semibold">{item.question}</h3>
            <p className="mt-2 leading-7 text-base-content/75">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function RelatedGameSection({
  games,
  lang,
  title,
}: {
  games: Array<PublicGame>
  lang: Locale
  title: string
}) {
  if (games.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <RelatedGameCard game={game} key={game.url_slug ?? game._id} lang={lang} />
        ))}
      </div>
    </section>
  )
}

function RelatedGamesFallback({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm"
            key={index}
          >
            <div className="aspect-[4/3] animate-pulse bg-base-300" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-4/5 animate-pulse rounded bg-base-300" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-base-300" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RelatedGameCard({ game, lang }: { game: PublicGame; lang: Locale }) {
  const gameId = game.url_slug || game._id || ''

  if (!gameId) {
    return null
  }

  return (
    <Link
      className="group overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      {...gameCardPreviewHandlers}
      params={{ gameId, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-base-300">
        {game.game_cover ? (
          <img
            alt={game.name ?? 'Game cover'}
            className="h-full w-full object-cover"
            loading="lazy"
            src={game.game_cover}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-base-content/40">
            Retro
          </div>
        )}
        <GameCardPreviewVideo src={game.game_video} />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">
          {game.name}
        </h3>
        {game.platform ? (
          <p className="mt-2 truncate text-xs text-base-content/60">{game.platform}</p>
        ) : null}
      </div>
    </Link>
  )
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-base-300 pb-3 last:border-0 last:pb-0">
      <dt className="flex items-center gap-2 text-base-content/55">
        <i className={icon} />
        {label}
      </dt>
      <dd className="text-right font-medium">{value || '-'}</dd>
    </div>
  )
}

function TagSection({
  emptyText,
  items,
  title,
}: {
  emptyText: string
  items: Array<string>
  title: string
}) {
  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <i className="ri-price-tag-3-line text-primary" />
        {title}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span className="badge badge-outline" key={item}>
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-base-content/50">{emptyText}</span>
        )}
      </div>
    </section>
  )
}
