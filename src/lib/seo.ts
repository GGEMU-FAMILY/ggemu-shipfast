import { createServerFn } from '@tanstack/react-start'
import { getRequestUrl } from '@tanstack/react-start/server'

import type { Locale } from '#/lib/ggemu'
import { normalizeLocale } from '#/lib/i18n'

export const seoLocales = ['zh-CN', 'en', 'ja'] as const satisfies ReadonlyArray<Locale>

export const getSeoOrigin = createServerFn({ method: 'GET' }).handler(() => {
  return getRequestUrl({ xForwardedHost: true }).origin
})

export function getDocumentLang(pathname: string) {
  const [, locale] = pathname.split('/')

  return normalizeLocale(locale)
}

export function getLocalizedSeoLinks({
  locale,
  origin,
  path,
}: {
  locale: Locale
  origin: string
  path: string
}) {
  const canonicalUrl = toAbsoluteLocalizedUrl(origin, locale, path)

  return [
    { rel: 'canonical', href: canonicalUrl },
    ...getLocalizedAlternateLinks(origin, path),
  ]
}

export function getAlternateLinksFromCanonical(canonicalUrl: string) {
  const url = new URL(canonicalUrl)
  const [, , ...pathParts] = url.pathname.split('/')

  return getLocalizedAlternateLinks(url.origin, `/${pathParts.join('/')}`)
}

function getLocalizedAlternateLinks(origin: string, path: string) {
  return [
    ...seoLocales.map((locale) => ({
      rel: 'alternate',
      hrefLang: locale,
      href: toAbsoluteLocalizedUrl(origin, locale, path),
    })),
    {
      rel: 'alternate',
      hrefLang: 'x-default',
      href: toAbsoluteLocalizedUrl(origin, 'en', path),
    },
  ]
}

function toAbsoluteLocalizedUrl(origin: string, locale: Locale, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const localizedPath = normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`

  return `${origin}${localizedPath}`
}
