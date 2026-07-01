import type { ReactNode } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import { ThirdPartyScripts } from '#/components/third-party-scripts'
import { serializeSiteConfig, siteConfig } from '#/lib/site-config'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
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
        property: 'og:description',
        content:
          'Play GBA, NES, SNES, PS1, N64, Sega Genesis, Arcade and more directly in your browser. No downloads required.',
      },
      {
        property: 'og:type',
        content: 'website',
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
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return <Outlet />
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
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
