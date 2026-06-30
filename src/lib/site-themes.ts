declare const __SITE_THEMES__: string

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

export const siteThemes = Array.from(
  new Set([...defaultThemes, ...parseSiteThemes(__SITE_THEMES__)]),
)

export function normalizeSiteTheme(value: string | null) {
  return value && siteThemes.includes(value) ? value : 'light'
}
