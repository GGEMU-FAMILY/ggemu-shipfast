import type { ReactNode } from 'react'
import { useState } from 'react'
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
const secretGameUrl = 'https://clever-spider-5915.puter.site/'

function getDefaultSocialImage(origin?: string) {
  return origin ? `${origin}${defaultSocialImagePath}` : defaultSocialImagePath
}

function getPwaInstallInitScript() {
  return `
    window.__GGEMU_INSTALL_PROMPT__=null;
    window.addEventListener('beforeinstallprompt',function(event){
      event.preventDefault();
      window.__GGEMU_INSTALL_PROMPT__=event;
      window.dispatchEvent(new Event('ggemu:installprompt'));
    });
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js').catch(function(){});
    }
  `
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
  errorComponent: MaintenanceErrorComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return <Outlet />
}

function MaintenanceErrorComponent() {
  const [isSecretGameVisible, setIsSecretGameVisible] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const locale = getDocumentLang(pathname)
  const messages = getMaintenanceMessages(locale)

  if (isSecretGameVisible) {
    return (
      <main className="min-h-screen bg-base-100 px-4 py-6 text-base-content sm:px-6 lg:px-8">
        <section className="mx-auto flex max-w-7xl flex-col gap-5">
          <div className="flex items-center gap-3">
            <img
              alt={siteConfig.SITE_NAME}
              className="h-12 w-12 rounded-xl object-contain"
              src="/logo.png"
            />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold leading-tight">
                {siteConfig.SITE_NAME}
              </h1>
              <p className="truncate text-sm font-medium text-primary">
                {siteConfig.SITE_SLOGAN}
              </p>
            </div>
          </div>
          <iframe
            allow="fullscreen"
            className="h-[calc(100vh-7.5rem)] min-h-[30rem] w-full rounded-box border border-base-300 bg-base-200"
            src={secretGameUrl}
            title="Secret Game"
          />
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-base-100 px-4 py-16 text-base-content sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <img
          alt={siteConfig.SITE_NAME}
          className="h-20 w-20 rounded-2xl object-contain"
          src="/logo.png"
        />
        <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
          {siteConfig.SITE_NAME}
        </h1>
        <p className="mt-2 max-w-full truncate text-base font-medium text-primary">
          {siteConfig.SITE_SLOGAN}
        </p>
        <h2 className="mt-8 text-2xl font-semibold leading-tight sm:text-3xl">
          {messages.title}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-base-content/70">
          {messages.description}
        </p>
        <button
          className="btn btn-primary mt-8"
          onClick={() => {
            setIsSecretGameVisible(true)
          }}
          type="button"
        >
          Play A Secret Game
        </button>
      </section>
    </main>
  )
}

function getMaintenanceMessages(locale: string) {
  if (locale === 'en') {
    return {
      title: 'The server is under maintenance',
      description: 'Scheduled maintenance is in progress. We will be back online shortly.',
    }
  }

  if (locale === 'ja') {
    return {
      title: 'サーバーは現在メンテナンス中です',
      description: '予定されたメンテナンスを実施しています。まもなく再開します。',
    }
  }

  return {
    title: '当前服务器正在维护',
    description: '我们正在进行计划维护，很快就会恢复访问。',
  }
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
        <script
          dangerouslySetInnerHTML={{
            __html: getPwaInstallInitScript(),
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
