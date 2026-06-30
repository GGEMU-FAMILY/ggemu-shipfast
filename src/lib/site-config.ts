declare const __SITE_EMAIL__: string
declare const __SITE_NAME__: string
declare const __SITE_SLOGAN__: string
declare const __SITE_TEMPLATE__: string
declare const __GGEMU_REFCODE__: string
declare const __GOOGLE_ADSENSE_CLIENT__: string
declare const __GOOGLE_ANALYTICS_ID__: string

export type SiteTemplate = 'default' | 'two-column'

function withDefault(value: string, fallback: string) {
  const nextValue = value.trim()

  return nextValue || fallback
}

function normalizeSiteTemplate(value: string): SiteTemplate {
  const nextValue = value.trim()

  return nextValue === 'two-column' ? 'two-column' : 'default'
}

export const siteConfig = {
  email: withDefault(__SITE_EMAIL__, 'your-email@example.com'),
  ggEmuRefcode: withDefault(__GGEMU_REFCODE__, 'rnMWBw'),
  googleAdsenseClient: __GOOGLE_ADSENSE_CLIENT__.trim(),
  googleAnalyticsId: __GOOGLE_ANALYTICS_ID__.trim(),
  name: withDefault(__SITE_NAME__, 'Retro Games'),
  slogan: withDefault(__SITE_SLOGAN__, 'Play Retro Games Online'),
  template: normalizeSiteTemplate(__SITE_TEMPLATE__),
}
