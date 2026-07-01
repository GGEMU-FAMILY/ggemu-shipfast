import type { Locale, PublicGame } from '#/lib/ggemu'
import { siteConfig } from '#/lib/site-config'

const copyrightText = `Copyright © 2025 ${siteConfig.SITE_NAME}`
const copyrightDisclaimer = `All the games ROM / programs are submitted by users or collected from the internet, and the copyrights belong to their respective owners. If you have any issues, please email ${siteConfig.SITE_EMAIL}, and we will remove the corresponding content.`

export function normalizeLocale(value: unknown): Locale {
  return value === 'en' || value === 'ja' ? value : 'zh-CN'
}

export function formatCopy(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? ''),
  )
}

export const i18n = {
  'zh-CN': {
    layout: {
      games: '游戏库',
      about: '关于',
      theme: '主题',
      language: '语言',
      copyright: copyrightText,
      disclaimer: copyrightDisclaimer,
      footer:
        '直接在浏览器里游玩经典复古游戏，无需下载。覆盖掌机、主机、街机与更多平台。',
    },
    home: {
      title: '在线游玩经典复古游戏',
      subtitle:
        '在浏览器里直接游玩 GBA、NES、SNES、PS1、N64、Sega Genesis、街机等经典游戏，无需下载。',
      searchPlaceholder: '搜索游戏名、平台或系列...',
      search: '搜索',
      reset: '重置',
      allPlatforms: '全部平台',
      allCategories: '全部分类',
      newest: '最新游戏',
      popular: '热门游戏',
      oldest: '最早发布',
      nameAsc: '名称 A-Z',
      empty: '没有找到游戏',
      previous: '上一页',
      next: '下一页',
      page: '第 {page} / {pages} 页',
      views: '浏览',
      plays: '游玩',
      details: '查看详情',
      featured: '可在线游玩的复古游戏',
    },
    homeSeo: {
      title: '在线玩经典复古游戏 | GBA、NES、SNES、PS1、N64 免下载',
      description:
        '在浏览器里直接游玩 GBA、NES、SNES、PS1、N64、Sega Genesis、街机等经典复古游戏，无需下载。',
      keywords:
        '在线复古游戏, GBA 在线游戏, NES 在线游戏, SNES 在线游戏, PS1 在线游戏, N64 在线游戏, 街机游戏, 浏览器游戏, 免下载游戏',
    },
    detail: {
      home: '游戏库',
      play: '开始游戏',
      overview: '游戏简介',
      howToPlay: '玩法指南',
      details: '游戏信息',
      platform: '平台',
      developer: '开发商',
      released: '发行年份',
      players: '玩家',
      views: '浏览',
      plays: '游玩',
      categories: '类型',
      languages: '语言',
      noData: '暂无',
      browserReady: '浏览器直接游玩',
      noDownload: '无需下载',
    },
    about: {
      title: '关于',
      description: `关于 ${siteConfig.SITE_NAME} 在线复古游戏网站。`,
    },
  },
  en: {
    layout: {
      games: 'Games',
      about: 'About',
      theme: 'Theme',
      language: 'Language',
      copyright: copyrightText,
      disclaimer: copyrightDisclaimer,
      footer:
        'Play classic retro games directly in your browser. No downloads required.',
    },
    home: {
      title: siteConfig.SITE_SLOGAN,
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
      views: 'Views',
      plays: 'Plays',
      details: 'Details',
      featured: 'Playable retro games',
    },
    homeSeo: {
      title: `${siteConfig.SITE_SLOGAN} | No Downloads Required`,
      description:
        'Play classic retro games from GBA, NES, SNES, PS1, N64, Sega Genesis, Arcade and more directly in your browser. No downloads required.',
      keywords:
        'retro games online, play GBA games online, NES games online, SNES games online, PS1 games online, N64 games online, Sega Genesis games, arcade games online, browser emulator games, no download games',
    },
    detail: {
      home: 'Games',
      play: 'Play Now',
      overview: 'Overview',
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
    },
    about: {
      title: 'About',
      description: `About ${siteConfig.SITE_NAME}, a browser-based classic retro games website.`,
    },
  },
  ja: {
    layout: {
      games: 'ゲーム',
      about: '概要',
      theme: 'テーマ',
      language: '言語',
      copyright: copyrightText,
      disclaimer: copyrightDisclaimer,
      footer:
        'クラシックなレトロゲームをブラウザーでそのままプレイ。ダウンロードは不要です。',
    },
    home: {
      title: 'レトロゲームをオンラインでプレイ',
      subtitle:
        'GBA、NES、SNES、PS1、N64、Sega Genesis、アーケードなどの名作をブラウザーでそのまま遊べます。ダウンロード不要。',
      searchPlaceholder: 'ゲーム名、機種、シリーズを検索...',
      search: '検索',
      reset: 'リセット',
      allPlatforms: 'すべての機種',
      allCategories: 'すべてのカテゴリ',
      newest: '新着順',
      popular: '人気順',
      oldest: '古い順',
      nameAsc: '名前 A-Z',
      empty: 'ゲームが見つかりません',
      previous: '前へ',
      next: '次へ',
      page: '{page} / {pages} ページ',
      views: '閲覧',
      plays: 'プレイ',
      details: '詳細',
      featured: 'オンライン対応レトロゲーム',
    },
    homeSeo: {
      title: 'レトロゲームをオンラインでプレイ | ダウンロード不要',
      description:
        'GBA、NES、SNES、PS1、N64、Sega Genesis、アーケードなどの名作レトロゲームをブラウザーでそのまま遊べます。',
      keywords:
        'レトロゲーム オンライン, GBA ゲーム, NES ゲーム, SNES ゲーム, PS1 ゲーム, N64 ゲーム, アーケードゲーム, ブラウザーゲーム',
    },
    detail: {
      home: 'ゲーム',
      play: '今すぐプレイ',
      overview: '概要',
      howToPlay: '遊び方',
      details: 'ゲーム情報',
      platform: '機種',
      developer: '開発',
      released: '発売年',
      players: 'プレイヤー',
      views: '閲覧',
      plays: 'プレイ',
      categories: 'ジャンル',
      languages: '言語',
      noData: 'なし',
      browserReady: 'ブラウザーでプレイ',
      noDownload: 'ダウンロード不要',
    },
    about: {
      title: '概要',
      description: `ブラウザーで遊べるレトロゲームサイト ${siteConfig.SITE_NAME} について。`,
    },
  },
} satisfies Record<Locale, Record<string, Record<string, string>>>

export function getI18n(locale: Locale) {
  return i18n[locale]
}

function compactText(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trim()}...`
}

export function buildGameDetailSeo(game: PublicGame, locale: Locale) {
  const name = game.name?.trim() || 'Retro Game'
  const platform = game.platform?.trim()
  const year = game.released_year?.trim()
  const categoryText = (game.categories ?? []).slice(0, 3).join(', ')
  const baseDescription = game.description ? compactText(game.description) : ''

  if (locale === 'zh-CN') {
    return {
      title: [`${name} 在线玩`, platform, year, '浏览器免下载']
        .filter(Boolean)
        .join(' | '),
      description: truncateText(
        baseDescription ||
          `在线游玩 ${name}${platform ? ` ${platform}` : ''} 复古游戏，浏览器直接启动，无需下载。`,
        155,
      ),
      keywords: [
        `${name} 在线玩`,
        `${name} online`,
        platform ? `${platform} 游戏在线玩` : '',
        categoryText,
        '复古游戏',
        '浏览器游戏',
        '免下载游戏',
      ]
        .filter(Boolean)
        .join(', '),
    }
  }

  if (locale === 'ja') {
    return {
      title: [`${name} をオンラインでプレイ`, platform, year, 'ダウンロード不要']
        .filter(Boolean)
        .join(' | '),
      description: truncateText(
        baseDescription ||
          `${name}${platform ? ` for ${platform}` : ''} をブラウザーでそのままプレイ。ダウンロード不要です。`,
        155,
      ),
      keywords: [
        `${name} オンライン`,
        `${name} play online`,
        platform ? `${platform} ゲーム` : '',
        categoryText,
        'レトロゲーム',
        'ブラウザーゲーム',
        'ダウンロード不要',
      ]
        .filter(Boolean)
        .join(', '),
    }
  }

  return {
    title: [`Play ${name} Online`, platform, year, 'No Download']
      .filter(Boolean)
      .join(' | '),
    description: truncateText(
      baseDescription ||
        `Play ${name}${platform ? ` for ${platform}` : ''} online in your browser. No download required.`,
      155,
    ),
    keywords: [
      `play ${name} online`,
      `${name} browser game`,
      platform ? `${platform} games online` : '',
      categoryText,
      'retro games online',
      'no download games',
      'browser emulator games',
    ]
      .filter(Boolean)
      .join(', '),
  }
}
