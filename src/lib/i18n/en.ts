import { siteConfig } from '#/lib/site-config'
import type { HomeFaqs, I18nMessages } from './types'

export const enMessages = {
  layout: {
    games: 'Home',
    explore: 'Explore',
    playMyRom: 'Play My ROM',
    blog: 'Blog',
    about: 'About Us',
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    theme: 'Theme',
    language: 'Language',
    get copyright() {
      return `Copyright © 2025 ${siteConfig.SITE_NAME}`
    },
    get disclaimer() {
      return `All the games ROM / programs are submitted by users or collected from the internet, and the copyrights belong to their respective owners. If you have any issues, please email ${siteConfig.SITE_EMAIL}, and we will remove the corresponding content.`
    },
    footer:
      'Play classic retro games directly in your browser. No downloads required.',
  },
  home: {
    get title() {
      return siteConfig.SITE_SLOGAN
    },
    subtitle:
      'Play classic retro games from GBA, NES, SNES, PS1, N64, Sega Genesis, Arcade and more directly in your browser. No downloads required.',
    searchPlaceholder: 'Search by game title, platform, or series...',
    search: 'Search',
    reset: 'Reset',
    allPlatforms: 'All platforms',
    allCategories: 'All categories',
    newest: 'Newest',
    popular: 'Popular',
    oldest: 'Oldest',
    nameAsc: 'Name A-Z',
    empty: 'No games found',
    previous: 'Previous',
    next: 'Next',
    page: 'Page {page} / {pages}',
    totalGames: '{total} games',
    views: 'Views',
    plays: 'Plays',
    details: 'Details',
    featured: 'Playable retro games',
    recentlyPlayed: 'Recently played',
    latestBlogPosts: 'Latest Blog Posts',
    latestBlogSubtitle:
      'Read the latest game guides, browser play tips, and retro gaming articles.',
    viewAllBlog: 'View all posts',
    blogPostFallback: 'Blog post',
  },
  homeSeo: {
    get title() {
      return `${siteConfig.SITE_SLOGAN} | No Downloads Required`
    },
    description:
      'Play classic retro games from GBA, NES, SNES, PS1, N64, Sega Genesis, Arcade and more directly in your browser. No downloads required.',
    keywords:
      'retro games online, play GBA games online, NES games online, SNES games online, PS1 games online, N64 games online, Sega Genesis games, arcade games online, browser emulator games, no download games',
  },
  detail: {
    home: 'Games',
    play: 'Play Now',
    share: 'Share',
    generatePoster: 'Generate Poster',
    systemShare: 'System Share',
    posterTitle: 'Share Poster',
    downloadPoster: 'Download Poster',
    posterScanCta: 'Scan to play instantly. No download needed.',
    shareUnavailableCopied: 'System share is unavailable, so the link was copied.',
    overview: 'Overview',
    keywords: 'Keywords',
    howToPlay: 'How to Play',
    details: 'Game Details',
    platform: 'Platform',
    developer: 'Developer',
    released: 'Released',
    players: 'Players',
    views: 'Views',
    plays: 'Plays',
    categories: 'Genres',
    languages: 'Languages',
    noData: 'Not available',
    browserReady: 'Playable in browser',
    noDownload: 'No download required',
    faq: 'FAQ',
    relatedGames: 'Related Games',
  },
  about: {
    title: 'About',
    get description() {
      return `About ${siteConfig.SITE_NAME}, a browser-based classic retro games website.`
    },
  },
  blog: {
    title: 'Blog',
    description:
      'Read game guides, browser play tips, and retro gaming articles.',
    subtitle:
      'Read game guides, browser play tips, and retro gaming articles.',
    eyebrow: 'Blog',
    empty: 'No posts yet',
    total: '{total} posts',
  },
} satisfies I18nMessages

export const enHomeFaqs = {
  title: 'FAQ',
  subtitle:
    'Learn how to play online, find games, filter by platform, and contact us about content issues.',
  items: [
    {
      question: 'Can I play these retro games online?',
      answer:
        'Yes. Open a game detail page and click play to start the game directly in your browser, with no emulator setup required.',
    },
    {
      question: 'Do I need to download an emulator or ROM files?',
      answer:
        'No. Open a game detail page and start playing directly in the browser without installing extra software.',
    },
    {
      question: 'Which platforms are supported?',
      answer:
        'The library supports Game Boy Advance (GBA), Game Boy, Game Boy Color (GBC), Nintendo DS (NDS), NES / Famicom, SNES / Super Famicom, Nintendo 64 (N64), PlayStation / PS1, Sega Genesis / Genesis, Master System, Sega CD, Neo Geo, Atari, Arcade, MS-DOS / DOS, HTML5, Flash, Java, and more. You can also filter by platform.',
    },
    {
      question: 'Which devices can I play on?',
      answer:
        'We provide broad device support for most mainstream smart devices, including iOS, Android, iPad, Mac, and Windows. Most modern browsers are supported, but we recommend Chrome for the most stable gameplay experience.',
    },
    {
      question: 'What if I cannot find a game?',
      answer:
        'Try searching with the English title, series name, platform name, or shorter keywords. Some games may use regional names.',
    },
    {
      question: 'How do copyright or removal requests work?',
      get answer() {
        return `Game ROMs and programs are submitted by users or collected from the internet, and copyrights belong to their owners. Contact ${siteConfig.SITE_EMAIL} for removal requests.`
      },
    },
  ],
} satisfies HomeFaqs
