import { createFileRoute } from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { normalizeLocale } from '#/lib/i18n'

const aboutSections = [
  {
    title: 'What this site offers',
    body:
      'This website provides a browser-based way to discover and play classic games online. Visitors can browse a game library, search by title or platform, open game detail pages, and start playable games directly from the browser.',
  },
  {
    title: 'Game discovery',
    body:
      'The catalog is organized to help users find games by name, platform, category, and popularity. Search and filtering tools are intended to make it easier to locate a specific title or explore games from a preferred system.',
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

export const Route = createFileRoute('/$locale/about')({
  head: () => ({
    meta: [
      { title: 'About' },
      {
        name: 'description',
        content:
          'Learn about this browser-based classic games website and how visitors can discover and play games online.',
      },
    ],
  }),
  component: AboutPage,
})

function AboutPage() {
  const { locale } = Route.useParams()
  const lang = normalizeLocale(locale)

  return (
    <SiteLayout locale={lang}>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          About
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">
          About this website
        </h1>
        <p className="mt-5 text-base leading-7 text-base-content/70">
          This website is built for visitors who want a simple way to browse,
          search, and play classic games in the browser. The focus is fast
          discovery, clear game information, and direct access to playable
          titles when available.
        </p>

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
