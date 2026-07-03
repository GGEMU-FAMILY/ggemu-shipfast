import { createFileRoute } from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { normalizeLocale } from '#/lib/i18n'
import { getLocalizedSeoLinks, getSeoOrigin } from '#/lib/seo'
import { siteConfig } from '#/lib/site-config'

const supportedPlatforms = [
  'Game Boy Advance (GBA)',
  'Nintendo Entertainment System (NES)',
  'Super Nintendo (SNES)',
  'PlayStation 1 (PS1)',
  'Nintendo 64 (N64)',
  'Sega Genesis / Mega Drive',
  'Arcade',
  'Game Boy Color (GBC)',
  'Neo Geo',
  'MAME',
]

const aboutSections = [
  {
    title: 'What this site offers',
    body:
      'This website provides a browser-based way to discover and play classic games online. Visitors can browse a game library, search by title, platform, genre, or series, open game detail pages, and start playable games directly from the browser.',
  },
  {
    title: 'Game search and discovery',
    body:
      'The catalog is organized for common search intent such as play GBA games online, NES games in browser, SNES classics, PS1 games online, N64 games, Sega Genesis titles, arcade games, and no-download retro games.',
  },
  {
    title: 'Browser play',
    body:
      'Supported games are designed to launch from the game page without requiring a separate desktop application. Availability, performance, and controls may vary by game, browser, device, and network conditions.',
  },
  {
    title: 'Content and availability',
    body:
      'Game information, media, and playable availability may change over time. If content is unavailable, inaccurate, or should be reviewed, users can contact the site operator through the published contact channel.',
  },
]

const platformSearchTerms = supportedPlatforms.join(', ')

export const Route = createFileRoute('/$locale/about')({
  loader: () => getSeoOrigin(),
  head: ({ loaderData, params }) => ({
    links: loaderData
      ? getLocalizedSeoLinks({
          locale: normalizeLocale(params.locale),
          origin: loaderData,
          path: '/about',
        })
      : undefined,
    meta: [
      { title: `About ${siteConfig.SITE_NAME} | Classic Games Online` },
      {
        name: 'description',
        content: `Learn about ${siteConfig.SITE_NAME}, a browser-based classic games website for GBA, NES, SNES, PS1, N64, Sega Genesis, Arcade and other retro games online.`,
      },
      {
        name: 'keywords',
        content:
          'classic games online, retro games online, GBA games online, NES games online, SNES games online, PS1 games online, N64 games online, Sega Genesis games, arcade games online, browser games, no download games',
      },
    ],
  }),
  component: AboutPage,
})

function AboutPage() {
  const { locale } = Route.useParams()
  const lang = normalizeLocale(locale)
  const siteName = siteConfig.SITE_NAME

  return (
    <SiteLayout locale={lang}>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          About
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">
          About {siteName}
        </h1>
        <p className="mt-5 text-base leading-7 text-base-content/70">
          {siteName} is built for visitors who want a simple way to browse,
          search, and play classic games in the browser. The focus is fast
          discovery across supported platforms, clear game information, and
          direct access to playable titles when available.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Supported game platforms</h2>
          <p className="mt-3 leading-7 text-base-content/70">
            The catalog is designed for players searching for classic and retro
            games from platforms such as {platformSearchTerms}. Platform
            coverage depends on available game data and browser compatibility.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {supportedPlatforms.map((platform) => (
              <li
                className="rounded-full border border-base-300 bg-base-100 px-3 py-1 text-sm text-base-content/80"
                key={platform}
              >
                {platform}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 grid gap-5">
          {aboutSections.map((section) => (
            <article
              className="rounded-lg border border-base-300 bg-base-100 p-5"
              key={section.title}
            >
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-3 leading-7 text-base-content/70">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  )
}
