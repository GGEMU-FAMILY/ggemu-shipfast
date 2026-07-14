import rawSiteConfig from '../../siteconfig.js'
import { env as cloudflareEnv } from 'cloudflare:workers'

export type SiteTemplate =
  | 'default'
  | 'two-column'
  | 'poki-like'
  | 'features'
  | 'sidenav'

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

export const siteTemplates = [
  'default',
  'two-column',
  'poki-like',
  'features',
  'sidenav',
] as const satisfies ReadonlyArray<SiteTemplate>

const siteTemplateSet = new Set<SiteTemplate>(siteTemplates)

declare global {
  interface Window {
    __SITE_CONFIG__?: Partial<Record<SiteConfigKey, string | null>>
  }
}

function getProcessEnv() {
  return (
    globalThis as {
      process?: { env?: Partial<Record<SiteConfigKey, string | undefined>> }
    }
  ).process?.env
}

function getCloudflareEnv() {
  return cloudflareEnv as Partial<Record<SiteConfigKey, string | undefined>>
}

function getWindowSiteConfig() {
  return typeof window === 'undefined' ? undefined : window.__SITE_CONFIG__
}

function normalizeConfigValue(
  key: SiteConfigKey,
  value: string | null | undefined,
) {
  if (key === 'SITE_THEMES') {
    return value
  }

  if (!value) {
    return undefined
  }

  if (key === 'SITE_TEMPLATE' && !normalizeSiteTemplate(value)) {
    return undefined
  }

  return value
}

function resolveConfigValue(key: SiteConfigKey) {
  const envValue = normalizeConfigValue(
    key,
    getCloudflareEnv()?.[key] ?? getProcessEnv()?.[key],
  )
  const windowValue = normalizeConfigValue(key, getWindowSiteConfig()?.[key])

  if (envValue !== undefined) {
    return envValue
  }

  if (windowValue !== undefined) {
    return windowValue
  }

  return rawSiteConfig[key]
}

export function resolveSiteConfig(): SiteConfig {
  return Object.fromEntries(
    siteConfigKeys.map((key) => [key, resolveConfigValue(key)]),
  ) as SiteConfig
}

export function serializeSiteConfig() {
  return JSON.stringify(resolveSiteConfig()).replaceAll('<', '\\u003c')
}

export function normalizeSiteTemplate(value: unknown) {
  return typeof value === 'string' && siteTemplateSet.has(value as SiteTemplate)
    ? (value as SiteTemplate)
    : undefined
}

export function getSiteTemplate(template?: SiteTemplate) {
  return template ?? siteConfig.SITE_TEMPLATE
}

export const siteConfig = new Proxy(rawSiteConfig, {
  get(target, property: SiteConfigKey) {
    if (!siteConfigKeys.includes(property)) {
      return target[property]
    }

    return resolveConfigValue(property)
  },
})
