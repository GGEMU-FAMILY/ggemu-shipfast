import { siteConfig } from '#/lib/site-config'
import type { HomeFaqs, I18nMessages } from './types'

export const jaMessages = {
  layout: {
    games: 'ホーム',
    deals: 'ゲームセール',
    live: 'ゲーム配信',
    explore: '探す',
    playMyRom: '自分の ROM をプレイ',
    blog: 'ブログ',
    about: '私たちについて',
    legal: '法的情報',
    privacyPolicy: 'プライバシーポリシー',
    termsOfService: '利用規約',
    theme: 'テーマ',
    language: '言語',
    get copyright() {
      return `Copyright © 2025 ${siteConfig.SITE_NAME}`
    },
    get disclaimer() {
      return `すべてのゲーム ROM / プログラムはユーザーから投稿されたもの、またはインターネット上で収集されたものです。著作権はそれぞれの権利所有者に帰属します。問題がある場合は ${siteConfig.SITE_EMAIL} までメールでご連絡ください。該当するコンテンツを削除します。`
    },
    footer:
      'クラシックなレトロゲームをブラウザーでそのままプレイ。ダウンロードは不要です。',
  },
  deals: {
    seoTitle: 'Steam ゲームセールと過去最安値 | GGEMU',
    title: '人気ゲームセール',
    description:
      'Steam の注目ゲームセール、現在価格、割引率、過去最安値を確認できます。',
    eyebrow: 'セール開催中',
    regionLabel: '地域と通貨',
    regionUs: '米国',
    regionJp: '日本',
    regionCn: '中国',
    regionGb: '英国',
    regionDe: 'ドイツ',
    regionTh: 'タイ',
    updated: '{time} 更新',
    steamReference: 'Steam の現在参考価格',
    historicalLowest: '過去最安値',
    historicalLowNow: '現在価格が過去最安値',
    viewDetails: 'ゲーム詳細を見る',
    backToDeals: 'ゲームセールに戻る',
    detailSeoTitle: '{name} の Steam セール・現在価格・過去最安値 | GGEMU',
    detailSeoDescription:
      '{name} の Steam 現在価格は {price}、割引率は {discount}%、過去最安値は {historicalLow}。スクリーンショット、販売元、対応環境も確認できます。',
    overview: 'ゲーム概要',
    gameInfo: 'ゲーム情報',
    developer: '開発元',
    publisher: '販売元',
    releaseDate: '発売日',
    genres: 'ジャンル',
    platforms: '対応環境',
    languages: '対応言語',
    screenshots: 'スクリーンショット',
    buyOnSteam: 'Steam で見る',
    priceSummary: '価格と購入',
    free: '無料',
    notFound: 'このセールゲームは見つかりませんでした。販売終了または一時的に利用できない可能性があります。',
    noData: 'データなし',
    empty: '現在表示できるゲームセールはありません。しばらくしてからお試しください。',
    attribution: 'セール・価格データ提供：',
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
    totalGames: '全 {total} 件のゲーム',
    views: '閲覧',
    plays: 'プレイ',
    details: '詳細',
    featured: 'オンライン対応レトロゲーム',
    recentlyPlayed: '最近プレイしたゲーム',
    latestBlogPosts: '最新ブログ記事',
    latestBlogSubtitle:
      '最新のゲームガイド、ブラウザーでの遊び方、レトロゲーム記事を読めます。',
    viewAllBlog: 'すべての記事を見る',
    blogPostFallback: 'ブログ記事',
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
    install: 'ダウンロード',
    installUnavailable:
      'インストールを準備中です。ブラウザーに表示されない場合は、このページを再読み込みしてもう一度お試しください。',
    installDismissed: 'インストールをキャンセルしました。',
    installGuideTitle: 'このゲームをホーム画面に追加',
    installGuideIntro:
      'ブラウザーのインストール画面が表示されませんでした。手動で追加できます。',
    installGuideIos:
      'iPhone または iPad: Safari でこのページを開き、共有ボタンをタップして「ホーム画面に追加」を選びます。',
    installGuideAndroid:
      'Android: Chrome でこのページを開き、メニューまたは共有ボタンをタップして「アプリをインストール」または「ホーム画面に追加」を選びます。',
    installGuideDesktop:
      'デスクトップ版 Chrome または Edge: アドレスバーのインストールアイコン、またはブラウザーメニューから「アプリをインストール」を選びます。',
    installGuideClose: '閉じる',
    share: '共有',
    generatePoster: 'ポスターを生成',
    systemShare: 'システム共有',
    posterTitle: '共有ポスター',
    downloadPoster: 'ポスターをダウンロード',
    posterScanCta: 'スキャンしてすぐプレイ。ダウンロード不要。',
    shareUnavailableCopied: 'システム共有を利用できないため、リンクをコピーしました。',
    overview: '概要',
    keywords: 'キーワード',
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
  blog: {
    title: 'ブログ',
    description:
      'ゲームガイド、ブラウザーでの遊び方、レトロゲーム記事を読めます。',
    subtitle:
      'ゲームガイド、ブラウザーでの遊び方、レトロゲーム記事を読めます。',
    eyebrow: 'ブログ',
    empty: '記事はまだありません',
    total: '全 {total} 件の記事',
  },
  live: {
    title: 'ゲーム配信',
    description: '現在配信中のクラシックゲームとライブ配信ルームを探せます。',
    subtitle: '今みんなが配信しているクラシックゲームをチェックして、次に遊ぶ作品を見つけましょう。',
    eyebrow: '配信中',
    empty: '現在配信中のゲームはありません',
    total: '全 {total} 件のライブ配信',
    watchLive: '配信を見る',
    closePlayer: '配信を閉じる',
    previous: '前へ',
    next: '次へ',
    page: '{page} / {pages} ページ',
    error: 'ライブ配信を読み込めませんでした。しばらくしてからもう一度お試しください。',
    retry: '再読み込み',
  },
} satisfies I18nMessages

export const jaHomeFaqs = {
  title: 'よくある質問',
  subtitle:
    'オンラインプレイ、ゲーム検索、機種別フィルター、コンテンツに関する連絡方法を確認できます。',
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
} satisfies HomeFaqs
