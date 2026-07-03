import { createFileRoute } from '@tanstack/react-router'

import { SiteLayout } from '#/components/site-layout'
import { normalizeLocale } from '#/lib/i18n'
import { getLocalizedSeoLinks, getSeoOrigin } from '#/lib/seo'

const privacySections = [
  {
    title: 'Information collected',
    body:
      'The website may collect basic technical information such as browser type, device information, pages visited, referring pages, and approximate usage activity. If users contact the site operator, the information provided in that message may also be processed for support and response purposes.',
  },
  {
    title: 'How information is used',
    body:
      'Information may be used to operate the website, improve performance, understand general usage trends, prevent abuse, respond to requests, and maintain the safety and reliability of the service.',
  },
  {
    title: 'Cookies and similar technologies',
    body:
      'Cookies, local storage, or similar technologies may be used to remember preferences, support analytics, and improve the browsing experience. Users can control cookies through browser settings, although some features may not work as expected if storage is disabled.',
  },
  {
    title: 'Third-party services',
    body:
      'The website may use third-party services for hosting, analytics, advertising, embedded content, or game delivery. These providers may process information according to their own privacy policies and terms.',
  },
  {
    title: 'Data retention',
    body:
      'Information is retained only as long as reasonably necessary for operational, legal, security, or support purposes. Retention periods may vary depending on the type of information and the reason it is processed.',
  },
  {
    title: 'Contact',
    body:
      'Users may contact the site operator with privacy questions, correction requests, or removal requests using the contact details provided on the website.',
  },
]

export const Route = createFileRoute('/$locale/privacy-policy')({
  loader: () => getSeoOrigin(),
  head: ({ loaderData, params }) => ({
    links: loaderData
      ? getLocalizedSeoLinks({
          locale: normalizeLocale(params.locale),
          origin: loaderData,
          path: '/privacy-policy',
        })
      : undefined,
    meta: [
      { title: 'Privacy Policy' },
      {
        name: 'description',
        content:
          'Privacy Policy explaining how information may be collected, used, and handled on this website.',
      },
    ],
  }),
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  const { locale } = Route.useParams()
  const lang = normalizeLocale(locale)

  return (
    <SiteLayout locale={lang}>
      <LegalPage
        intro="This Privacy Policy explains how information may be collected, used, and handled when visitors use this website. It is intended as general information and may be updated from time to time."
        sections={privacySections}
        title="Privacy Policy"
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
