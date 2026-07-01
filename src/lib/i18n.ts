import type { Locale, PublicGame } from '#/lib/ggemu'
import { siteConfig } from '#/lib/site-config'

function getCopyrightText() {
  return `Copyright © 2025 ${siteConfig.SITE_NAME}`
}

function getCopyrightDisclaimer() {
  return `All the games ROM / programs are submitted by users or collected from the internet, and the copyrights belong to their respective owners. If you have any issues, please email ${siteConfig.SITE_EMAIL}, and we will remove the corresponding content.`
}

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
      games: '首页',
      playMyRom: '玩本地游戏',
      about: '关于我们',
      legal: '法律',
      privacyPolicy: '隐私政策',
      termsOfService: '服务条款',
      theme: '主题',
      language: '语言',
      get copyright() {
        return getCopyrightText()
      },
      get disclaimer() {
        return getCopyrightDisclaimer()
      },
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
      faq: '常见问题',
      relatedGames: '相关游戏',
    },
    about: {
      title: '关于',
      get description() {
        return `关于 ${siteConfig.SITE_NAME} 在线复古游戏网站。`
      },
    },
  },
  en: {
    layout: {
      games: 'Home',
      playMyRom: 'Play My ROM',
      about: 'About Us',
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      theme: 'Theme',
      language: 'Language',
      get copyright() {
        return getCopyrightText()
      },
      get disclaimer() {
        return getCopyrightDisclaimer()
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
      views: 'Views',
      plays: 'Plays',
      details: 'Details',
      featured: 'Playable retro games',
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
      faq: 'FAQ',
      relatedGames: 'Related Games',
    },
    about: {
      title: 'About',
      get description() {
        return `About ${siteConfig.SITE_NAME}, a browser-based classic retro games website.`
      },
    },
  },
  ja: {
    layout: {
      games: 'Home',
      playMyRom: '自分の ROM をプレイ',
      about: 'About Us',
      legal: '法的情報',
      privacyPolicy: 'プライバシーポリシー',
      termsOfService: '利用規約',
      theme: 'テーマ',
      language: '言語',
      get copyright() {
        return getCopyrightText()
      },
      get disclaimer() {
        return getCopyrightDisclaimer()
      },
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
      faq: 'よくある質問',
      relatedGames: '関連ゲーム',
    },
    about: {
      title: '概要',
      get description() {
        return `ブラウザーで遊べるレトロゲームサイト ${siteConfig.SITE_NAME} について。`
      },
    },
  },
} satisfies Record<Locale, Record<string, Record<string, string>>>

export function getI18n(locale: Locale) {
  return i18n[locale]
}

const homeFaqs = {
  'zh-CN': {
    title: '常见问题',
    subtitle: '了解如何在线游玩、查找游戏、按平台筛选，以及联系我们处理内容问题。',
    items: [
      {
        question: '这些复古游戏可以直接在线玩吗？',
        answer:
          '可以。打开游戏详情页后点击开始游戏，就能在浏览器中直接游玩，不需要先安装模拟器。',
      },
      {
        question: '需要下载模拟器或 ROM 文件吗？',
        answer:
          '不需要。你可以直接打开游戏详情页并开始游玩，无需额外安装模拟器或下载文件。',
      },
      {
        question: '支持哪些游戏平台？',
        answer:
          '游戏库支持 Game Boy Advance（GBA）、Game Boy、Game Boy Color（GBC）、Nintendo DS（NDS）、NES / Famicom、SNES / Super Famicom、Nintendo 64（N64）、PlayStation / PS1、Sega Genesis / Genesis、Master System、Sega CD、Neo Geo、Atari、Arcade、MS-DOS / DOS、HTML5、Flash、Java 等平台，也可以用平台筛选查找。',
      },
      {
        question: '支持哪些设备游玩？',
        answer:
          '我们提供全面完善的机型支持，绝大部分主流智能设备，例如 iOS、Android、iPad、Mac、Windows 都有很好的支持。虽然我们支持大部分现代浏览器，但仍然建议使用 Chrome 浏览器来获得最稳定的游戏体验。',
      },
      {
        question: '搜索不到想玩的游戏怎么办？',
        answer:
          '可以尝试使用英文名、系列名、平台名或更短的关键词搜索；部分游戏可能使用不同地区名称。',
      },
      {
        question: '游戏内容的版权如何处理？',
        get answer() {
          return `游戏内容由用户提交或来自互联网收集，版权归原权利人所有。如需下架，请通过 ${siteConfig.SITE_EMAIL} 联系我们。`
        },
      },
    ],
  },
  en: {
    title: 'FAQ',
    subtitle: 'Learn how to play online, find games, filter by platform, and contact us about content issues.',
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
  },
  ja: {
    title: 'よくある質問',
    subtitle: 'オンラインプレイ、ゲーム検索、機種別フィルター、コンテンツに関する連絡方法を確認できます。',
    items: [
      {
        question: 'レトロゲームをオンラインで遊べますか？',
        answer:
          'はい。ゲーム詳細ページを開いて開始すると、エミュレーターをインストールせずにブラウザーで直接プレイできます。',
      },
      {
        question: 'エミュレーターや ROM のダウンロードは必要ですか？',
        answer:
          '必要ありません。ゲーム詳細ページを開くだけで、ブラウザーから直接プレイできます。',
      },
      {
        question: 'どの機種に対応していますか？',
        answer:
          'Game Boy Advance（GBA）、Game Boy、Game Boy Color（GBC）、Nintendo DS（NDS）、NES / Famicom、SNES / Super Famicom、Nintendo 64（N64）、PlayStation / PS1、Sega Genesis / Genesis、Master System、Sega CD、Neo Geo、Atari、Arcade、MS-DOS / DOS、HTML5、Flash、Java などに対応しています。',
      },
      {
        question: 'どのデバイスで遊べますか？',
        answer:
          'iOS、Android、iPad、Mac、Windows など、主要なスマートデバイスを幅広くサポートしています。多くのモダンブラウザーで動作しますが、より安定したゲーム体験には Chrome の利用をおすすめします。',
      },
      {
        question: '探しているゲームが見つからない場合は？',
        answer:
          '英語タイトル、シリーズ名、機種名、短いキーワードで検索してください。地域によって名前が異なる場合があります。',
      },
      {
        question: '著作権や削除依頼はどう扱われますか？',
        get answer() {
          return `ゲーム ROM / プログラムはユーザー投稿またはインターネット上から収集されたもので、著作権は各権利者に帰属します。削除依頼は ${siteConfig.SITE_EMAIL} までご連絡ください。`
        },
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    title: string
    subtitle: string
    items: Array<{ question: string; answer: string }>
  }
>

export function getHomeFaqs(locale: Locale) {
  return homeFaqs[locale]
}

export function getGameDetailFaqs(game: PublicGame, locale: Locale) {
  const name = game.name?.trim() || 'this game'
  const platform = game.platform?.trim()
  const developer = game.developer?.trim()
  const category = game.categories?.find((item) => item.trim())?.trim()

  if (locale === 'zh-CN') {
    return [
      {
        question: `${name} 可以在线玩吗？`,
        answer: `可以。${name} 可以直接在浏览器中在线游玩，打开页面后点击开始游戏即可，不需要先安装模拟器。`,
      },
      {
        question: `玩 ${name} 需要下载文件吗？`,
        answer: `不需要。${name} 支持免下载游玩，游戏会在浏览器中启动，适合快速体验经典复古游戏。`,
      },
      {
        question: `${name} 属于什么平台或类型？`,
        answer: `${name}${platform ? ` 是 ${platform} 平台游戏` : ' 是一款复古游戏'}${category ? `，类型包含 ${category}` : ''}。你也可以通过平台、类型和相关游戏继续查找类似作品。`,
      },
      {
        question: `${name} 适合在哪些设备上游玩？`,
        answer: `${name} 通常可以在现代浏览器中运行，包括桌面电脑、平板和手机。为了获得更稳定的体验，建议使用 Chrome 或其他主流浏览器。`,
      },
      ...(developer
        ? [
            {
              question: `${name} 的开发商是谁？`,
              answer: `${name} 的开发商信息为 ${developer}。如果你喜欢这款游戏，可以继续浏览同开发商或同类型的相关游戏。`,
            },
          ]
        : []),
    ]
  }

  if (locale === 'ja') {
    return [
      {
        question: `${name} はオンラインでプレイできますか？`,
        answer: `はい。${name} はブラウザーで直接プレイできます。ゲームページを開き、開始ボタンを押すだけで遊べます。`,
      },
      {
        question: `${name} を遊ぶためにダウンロードは必要ですか？`,
        answer: `必要ありません。${name} はダウンロード不要で、ブラウザー上で起動できます。`,
      },
      {
        question: `${name} はどの機種やジャンルのゲームですか？`,
        answer: `${name}${platform ? ` は ${platform} のゲームです` : ' はレトロゲームです'}${category ? `。ジャンルには ${category} が含まれます` : ''}。関連ゲームから似た作品も探せます。`,
      },
      {
        question: `${name} はどのデバイスで遊べますか？`,
        answer: `${name} は多くのモダンブラウザーで動作します。PC、タブレット、スマートフォンでプレイできますが、安定した体験には Chrome などの主要ブラウザーがおすすめです。`,
      },
      ...(developer
        ? [
            {
              question: `${name} の開発元はどこですか？`,
              answer: `${name} の開発元情報は ${developer} です。同じ開発元や同じジャンルの関連ゲームも確認できます。`,
            },
          ]
        : []),
    ]
  }

  return [
    {
      question: `Can I play ${name} online?`,
      answer: `Yes. You can play ${name} directly in your browser. Open the game page and click play to start without setting up an emulator first.`,
    },
    {
      question: `Do I need to download anything to play ${name}?`,
      answer: `No. ${name} is available as a no-download browser game, so you can start playing without installing extra software or downloading files.`,
    },
    {
      question: `What platform or genre is ${name}?`,
      answer: `${name}${platform ? ` is a ${platform} game` : ' is a retro game'}${category ? ` in the ${category} category` : ''}. You can use the platform, genre, and related games sections to find similar titles.`,
    },
    {
      question: `What devices can run ${name}?`,
      answer: `${name} usually works in modern browsers on desktop, tablet, and mobile devices. For the most stable gameplay experience, use Chrome or another mainstream browser.`,
    },
    ...(developer
      ? [
          {
            question: `Who developed ${name}?`,
            answer: `${name} is listed with developer information for ${developer}. You can also browse related games from the same developer or genre.`,
          },
        ]
      : []),
  ]
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
