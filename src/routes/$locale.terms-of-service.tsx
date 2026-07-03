import { createFileRoute } from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { normalizeLocale } from '#/lib/i18n'
import { getLocalizedSeoLinks, getSeoOrigin } from '#/lib/seo'

const termsSections = [
  {
    title: 'Use of the website',
    body:
      'Users may access the website for personal, lawful, and non-commercial browsing and gameplay. Users must not misuse the website, interfere with its operation, attempt unauthorized access, or use automated systems in a way that harms availability or performance.',
  },
  {
    title: 'Game content',
    body:
      'Game information, media, and playable content may be provided by users, third parties, or publicly available sources. Availability may change without notice, and not every game may work on every browser, device, or region.',
  },
  {
    title: 'User responsibility',
    body:
      'Users are responsible for complying with applicable laws and for ensuring that their use of the website is appropriate in their location. Users should stop using any content that they are not permitted to access.',
  },
  {
    title: 'Intellectual property',
    body:
      'All trademarks, game titles, images, media, and related materials belong to their respective owners. Nothing on the website transfers ownership or grants rights beyond ordinary website access.',
  },
  {
    title: 'No warranties',
    body:
      'The website is provided on an as-is and as-available basis. No guarantee is made that the website will be uninterrupted, error-free, secure, or compatible with every device or browser.',
  },
  {
    title: 'Changes to these terms',
    body:
      'These terms may be updated from time to time. Continued use of the website after changes are posted means that the updated terms apply to future use.',
  },
]

export const Route = createFileRoute('/$locale/terms-of-service')({
  loader: () => getSeoOrigin(),
  head: ({ loaderData, params }) => ({
    links: loaderData
      ? getLocalizedSeoLinks({
          locale: normalizeLocale(params.locale),
          origin: loaderData,
          path: '/terms-of-service',
        })
      : undefined,
    meta: [
      { title: 'Terms of Service' },
      {
        name: 'description',
        content:
          'Terms of Service describing the basic rules and conditions for using this website.',
      },
    ],
  }),
  component: TermsOfServicePage,
})

function TermsOfServicePage() {
  const { locale } = Route.useParams()
  const lang = normalizeLocale(locale)

  return (
    <SiteLayout locale={lang}>
      <LegalPage
        intro="These Terms of Service describe the basic rules for accessing and using this website. By using the website, users agree to follow these terms and any applicable laws."
        sections={termsSections}
        title="Terms of Service"
      />
    </SiteLayout>
  )
}

function LegalPage({
  intro,
  sections,
  title,
}: {
  intro: string
  sections: Array<{ title: string; body: string }>
  title: string
}) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        Legal
      </p>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{title}</h1>
      <p className="mt-5 text-base leading-7 text-base-content/70">{intro}</p>

      <div className="mt-10 space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 leading-7 text-base-content/70">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  )
}
