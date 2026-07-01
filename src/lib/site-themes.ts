import { siteConfig } from './site-config'

const defaultThemes = ['light', 'dark']

const daisyThemes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
  'silk',
]

function parseSiteThemes(value: string) {
  return value
    .split(',')
    .map((theme) => theme.trim())
    .filter((theme) => daisyThemes.includes(theme))
}

export function getSiteThemes() {
  return Array.from(
    new Set([...defaultThemes, ...parseSiteThemes(siteConfig.SITE_THEMES)]),
  )
}

export function normalizeSiteTheme(value: string | null) {
  return value && getSiteThemes().includes(value) ? value : 'light'
}
