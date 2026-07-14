import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { SiteFooter } from '#/components/site-layout'
import type { Locale } from '#/lib/ggemu'
import { getI18n } from '#/lib/i18n'
import { siteConfig } from '#/lib/site-config'
import { getSiteThemes, normalizeSiteTheme } from '#/lib/site-themes'

import {
  GamesSection,
  HomeFaqSection,
  HomeLatestBlogPostsSection,
} from './shared'
import { HomeSearchOverlay } from './search-overlay'
import type { HomeTemplateProps } from './types'

const localeOptions: Array<{ label: string; value: Locale }> = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
]

export function SidenavHomeTemplate(props: HomeTemplateProps) {
  const { lang, latestBlogPosts, t } = props
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <main className="relative isolate min-h-screen bg-base-200 text-base-content lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <HomeSidenav locale={lang} onOpenSearch={() => setIsSearchOpen(true)} />

      <div className="relative z-0 min-w-0 bg-base-100">
        <GamesSection
          {...props}
          gridClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          sectionClassName="mx-auto flex min-w-0 max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8"
        />
        <HomeLatestBlogPostsSection blogPosts={latestBlogPosts} lang={lang} />
        <HomeFaqSection lang={lang} />
        <SiteFooter locale={lang} />
      </div>
      <HomeSearchOverlay
        filterOptions={props.filterOptions}
        gameTotal={props.pagination.total}
        isOpen={isSearchOpen}
        lang={lang}
        onClose={() => setIsSearchOpen(false)}
        t={t}
      />
    </main>
  )
}

function HomeSidenav({
  locale,
  onOpenSearch,
}: {
  locale: Locale
  onOpenSearch: () => void
}) {
  const { home, layout: layoutCopy } = getI18n(locale)
  const location = useRouterState({ select: (state) => state.location })
  const siteThemes = getSiteThemes()
  const [theme, setTheme] = useState(() => normalizeSiteTheme(null))
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDetailsElement>(null)
  const localeMenuRef = useRef<HTMLDetailsElement>(null)
  const canSwitchTheme = siteThemes.length > 1
  const controlsGridClassName = canSwitchTheme ? 'grid-cols-2' : 'grid-cols-1'
  const controlsMenuWidthClassName = canSwitchTheme
    ? 'w-[calc(200%+0.5rem)]'
    : 'w-full'

  useEffect(() => {
    const storedTheme = normalizeSiteTheme(
      window.localStorage.getItem('retro-games-theme'),
    )
    setTheme(storedTheme)
    document.documentElement.dataset.theme = storedTheme
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        !themeMenuRef.current?.contains(target) &&
        !localeMenuRef.current?.contains(target)
      ) {
        setIsThemeMenuOpen(false)
        setIsLocaleMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  function handleThemeChange(nextTheme: string) {
    setTheme(nextTheme)
    setIsThemeMenuOpen(false)
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem('retro-games-theme', nextTheme)
  }

  function handleLocaleChange(nextLocale: Locale) {
    setIsLocaleMenuOpen(false)

    const nextPath = location.pathname.replace(
      /^\/(zh-CN|en|ja)(?=\/|$)/,
      `/${nextLocale}`,
    )

    window.location.assign(nextPath)
  }

  return (
    <aside className="relative z-[90] border-b border-base-300 bg-base-200 lg:sticky lg:top-0 lg:h-screen lg:overflow-visible lg:border-b-0 lg:border-r">
      <div className="flex min-h-full flex-col gap-4 p-3">
        <Link
          className="flex items-center gap-2 rounded-lg p-2 transition hover:bg-base-300/70"
          params={{ locale }}
          search={{}}
          to="/$locale"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-base-100">
            <img
              alt={siteConfig.SITE_NAME}
              className="h-full w-full object-contain"
              src="/logo.png"
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">
              {siteConfig.SITE_NAME}
            </span>
            <span className="block truncate text-xs text-base-content/55">
              {siteConfig.SITE_SLOGAN}
            </span>
          </span>
        </Link>

        <nav className="grid gap-1">
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium transition hover:bg-base-300/70"
            onClick={() => {
              onOpenSearch()
              setIsThemeMenuOpen(false)
              setIsLocaleMenuOpen(false)
            }}
            type="button"
          >
            <i className="ri-search-line text-lg" />
            <span>{home.search}</span>
          </button>

          <SidenavLink
            icon="ri-home-5-line"
            label={layoutCopy.games}
            locale={locale}
            to="/$locale"
          />
          <SidenavLink
            icon="ri-gamepad-line"
            label={layoutCopy.playMyRom}
            locale={locale}
            to="/$locale/play-my-rom"
          />
          <SidenavLink
            icon="ri-article-line"
            label={layoutCopy.blog}
            locale={locale}
            to="/$locale/blog"
          />
          <SidenavLink
            icon="ri-information-line"
            label={layoutCopy.about}
            locale={locale}
            to="/$locale/about"
          />
        </nav>

        <div className={`mt-auto grid gap-2 ${controlsGridClassName}`}>
          {canSwitchTheme ? (
            <details
              className="relative z-[70]"
              onToggle={(event) => setIsThemeMenuOpen(event.currentTarget.open)}
              open={isThemeMenuOpen}
              ref={themeMenuRef}
            >
              <summary
                className="btn btn-ghost btn-sm w-full list-none justify-center border border-base-300 bg-base-100 px-2"
                onClick={(event) => {
                  event.preventDefault()
                  setIsThemeMenuOpen((isOpen) => !isOpen)
                  setIsLocaleMenuOpen(false)
                }}
              >
                <i className="ri-palette-line" />
                <span className="truncate">{layoutCopy.theme}</span>
              </summary>
              <ul
                className={`menu absolute bottom-full left-0 z-[80] mb-2 max-h-[min(24rem,calc(100vh-8rem))] ${controlsMenuWidthClassName} overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2 shadow-xl`}
              >
                {siteThemes.map((nextTheme) => (
                  <li key={nextTheme}>
                    <button
                      className={theme === nextTheme ? 'active' : ''}
                      onClick={() => handleThemeChange(nextTheme)}
                      type="button"
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full bg-primary"
                        data-theme={nextTheme}
                      />
                      <span className="capitalize">{nextTheme}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <details
            className="relative z-[70]"
            onToggle={(event) => setIsLocaleMenuOpen(event.currentTarget.open)}
            open={isLocaleMenuOpen}
            ref={localeMenuRef}
          >
            <summary
              className="btn btn-ghost btn-sm w-full list-none justify-center border border-base-300 bg-base-100 px-2"
              onClick={(event) => {
                event.preventDefault()
                setIsLocaleMenuOpen((isOpen) => !isOpen)
                setIsThemeMenuOpen(false)
              }}
            >
              <i className="ri-global-line" />
              <span className="truncate">
                {locale === 'zh-CN' ? '中文' : locale === 'en' ? 'EN' : '日本語'}
              </span>
            </summary>
            <ul
              className={`menu absolute bottom-full right-0 z-[80] mb-2 ${controlsMenuWidthClassName} rounded-box border border-base-300 bg-base-100 p-2 shadow-xl`}
            >
              {localeOptions.map((option) => (
                <li key={option.value}>
                  <button
                    className={option.value === locale ? 'active' : ''}
                    onClick={() => handleLocaleChange(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </aside>
  )
}

function SidenavLink({
  icon,
  label,
  locale,
  to,
}: {
  icon: string
  label: string
  locale: Locale
  to: '/$locale' | '/$locale/about' | '/$locale/blog' | '/$locale/play-my-rom'
}) {
  return (
    <Link
      activeProps={{
        className: 'bg-primary text-primary-content hover:bg-primary',
      }}
      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition hover:bg-base-300/70"
      params={{ locale }}
      search={{}}
      to={to}
    >
      <i className={`${icon} text-lg`} />
      <span>{label}</span>
    </Link>
  )
}
