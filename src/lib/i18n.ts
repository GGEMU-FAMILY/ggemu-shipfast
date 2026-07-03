import type { Locale, PublicGame } from '#/lib/ggemu'
import { enHomeFaqs, enMessages } from '#/lib/i18n/en'
import { jaHomeFaqs, jaMessages } from '#/lib/i18n/ja'
import { zhCnHomeFaqs, zhCnMessages } from '#/lib/i18n/zh-CN'

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
  'zh-CN': zhCnMessages,
  en: enMessages,
  ja: jaMessages,
} satisfies Record<Locale, typeof zhCnMessages>

export function getI18n(locale: Locale) {
  return i18n[locale]
}

const homeFaqs = {
  'zh-CN': zhCnHomeFaqs,
  en: enHomeFaqs,
  ja: jaHomeFaqs,
} satisfies Record<Locale, typeof zhCnHomeFaqs>

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
