import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      __SITE_EMAIL__: JSON.stringify(env.SITE_EMAIL ?? 'your-email@example.com'),
      __SITE_NAME__: JSON.stringify(env.SITE_NAME ?? 'Retro Games'),
      __SITE_SLOGAN__: JSON.stringify(
        env.SITE_SLOGAN ?? 'Play Retro Games Online',
      ),
      __SITE_TEMPLATE__: JSON.stringify(env.SITE_TEMPLATE ?? 'default'),
      __SITE_THEMES__: JSON.stringify(env.SITE_THEMES ?? ''),
      __GGEMU_REFCODE__: JSON.stringify(env.GGEMU_REFCODE ?? 'rnMWBw'),
      __GOOGLE_ADSENSE_CLIENT__: JSON.stringify(
        env.GOOGLE_ADSENSE_CLIENT ?? '',
      ),
      __GOOGLE_ANALYTICS_ID__: JSON.stringify(env.GOOGLE_ANALYTICS_ID ?? ''),
    },
    resolve: { tsconfigPaths: true },
    plugins: [tanstackStart(), tailwindcss(), viteReact()],
  }
})

export default config
