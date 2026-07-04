import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'

import { ThirdPartyScripts } from '#/components/third-party-scripts'
import { getDocumentLang, getSeoOrigin } from '#/lib/seo'
import { serializeSiteConfig, siteConfig } from '#/lib/site-config'
import { getSiteThemeInitScript } from '#/lib/site-themes'
import appCss from '../styles.css?url'

const defaultSocialImagePath = '/og.png'

function getDefaultSocialImage(origin?: string) {
  return origin ? `${origin}${defaultSocialImagePath}` : defaultSocialImagePath
}

export const Route = createRootRoute({
  loader: () => getSeoOrigin(),
  head: ({ loaderData }) => {
    const defaultSocialImage = getDefaultSocialImage(loaderData)

    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: `${siteConfig.SITE_SLOGAN} | No Downloads Required`,
        },
        {
          name: 'description',
          content:
            'Play classic retro games from GBA, NES, SNES, PS1, N64, Sega Genesis, Arcade and more directly in your browser. No downloads required.',
        },
        {
          name: 'keywords',
          content:
            'retro games online, play GBA games online, NES games online, SNES games online, PS1 games online, N64 games online, Sega Genesis games, arcade games online, browser emulator games, no download games',
        },
        {
          property: 'og:title',
          content: siteConfig.SITE_SLOGAN,
        },
        {
          property: 'og:site_name',
          content: siteConfig.SITE_NAME,
        },
        {
          property: 'og:description',
          content:
            'Play GBA, NES, SNES, PS1, N64, Sega Genesis, Arcade and more directly in your browser. No downloads required.',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:image',
          content: defaultSocialImage,
        },
        {
          property: 'og:image:type',
          content: 'image/png',
        },
        {
          property: 'og:image:width',
          content: '1731',
        },
        {
          property: 'og:image:height',
          content: '909',
        },
        {
          property: 'og:image:alt',
          content: siteConfig.SITE_SLOGAN,
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:title',
          content: siteConfig.SITE_SLOGAN,
        },
        {
          name: 'twitter:description',
          content:
            'Classic retro games playable in your browser across GBA, NES, SNES, PS1, N64, Sega Genesis, Arcade and more.',
        },
        {
          name: 'twitter:image',
          content: defaultSocialImage,
        },
        {
          name: 'twitter:image:alt',
          content: siteConfig.SITE_SLOGAN,
        },
      ],
      links: [
        {
          rel: 'stylesheet',
          href: appCss,
        },
        {
          rel: 'icon',
          href: '/logo.png',
          type: 'image/png',
        },
        {
          rel: 'apple-touch-icon',
          href: '/logo.png',
        },
        {
          rel: 'manifest',
          href: '/manifest.webmanifest',
        },
      ],
    }
  },
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return <Outlet />
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <html lang={getDocumentLang(pathname)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: getSiteThemeInitScript(),
          }}
        />
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SITE_CONFIG__=${serializeSiteConfig()}`,
          }}
        />
        <ThirdPartyScripts />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
