import { siteConfig } from './site-config'

const defaultTheme = 'default'

const daisyThemes = [
  'default',
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

function parseSiteThemes(value: string | null | undefined) {
  return (value ?? '')
    .split(',')
    .map((theme) => theme.trim())
    .filter((theme) => daisyThemes.includes(theme))
}

export function getSiteThemes() {
  const themes = Array.from(new Set(parseSiteThemes(siteConfig.SITE_THEMES)))

  return themes.length > 0 ? themes : [defaultTheme]
}

export function normalizeSiteTheme(value: string | null) {
  const siteThemes = getSiteThemes()

  return value && siteThemes.includes(value) ? value : siteThemes[0]
}

export function getSiteThemeInitScript() {
  const siteThemes = getSiteThemes()
  const fallbackTheme = siteThemes[0] ?? defaultTheme

  return `
(() => {
  try {
    const themes = ${JSON.stringify(siteThemes)}
    const storedTheme = window.localStorage.getItem('retro-games-theme')
    document.documentElement.dataset.theme = themes.includes(storedTheme)
      ? storedTheme
      : ${JSON.stringify(fallbackTheme)}
  } catch {
    document.documentElement.dataset.theme = ${JSON.stringify(fallbackTheme)}
  }
})()
`
}
