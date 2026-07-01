import rawSiteConfig from '../../siteconfig.js'

export type SiteTemplate = 'default' | 'two-column' | 'poki-like' | 'features'

type SiteConfig = typeof rawSiteConfig
type SiteConfigKey = keyof SiteConfig

const siteConfigKeys = [
  'SITE_THEMES',
  'SITE_EMAIL',
  'SITE_NAME',
  'SITE_SLOGAN',
  'SITE_TEMPLATE',
  'GGEMU_REFCODE',
  'GOOGLE_ADSENSE_CLIENT',
  'GOOGLE_ANALYTICS_ID',
] as const satisfies readonly SiteConfigKey[]

const siteTemplates = new Set<SiteTemplate>([
  'default',
  'two-column',
  'poki-like',
  'features',
])

declare global {
  interface Window {
    __SITE_CONFIG__?: Partial<Record<SiteConfigKey, string>>
  }
}

function getProcessEnv() {
  return (
    globalThis as {
      process?: { env?: Partial<Record<SiteConfigKey, string | undefined>> }
    }
  ).process?.env
}

function getWindowSiteConfig() {
  return typeof window === 'undefined' ? undefined : window.__SITE_CONFIG__
}

function normalizeConfigValue(key: SiteConfigKey, value: string | undefined) {
  if (!value) {
    return undefined
  }

  if (key === 'SITE_TEMPLATE' && !siteTemplates.has(value as SiteTemplate)) {
    return undefined
  }

  return value
}

function resolveConfigValue(key: SiteConfigKey) {
  const envValue = normalizeConfigValue(key, getProcessEnv()?.[key])
  const windowValue = normalizeConfigValue(key, getWindowSiteConfig()?.[key])

  return envValue ?? windowValue ?? rawSiteConfig[key]
}

export function resolveSiteConfig(): SiteConfig {
  return Object.fromEntries(
    siteConfigKeys.map((key) => [key, resolveConfigValue(key)]),
  ) as SiteConfig
}

export function serializeSiteConfig() {
  return JSON.stringify(resolveSiteConfig()).replaceAll('<', '\\u003c')
}

export const siteConfig = new Proxy(rawSiteConfig, {
  get(target, property: SiteConfigKey) {
    if (!siteConfigKeys.includes(property)) {
      return target[property]
    }

    return resolveConfigValue(property)
  },
})
