export type I18nMessages = {
  layout: {
    games: string
    explore: string
    playMyRom: string
    blog: string
    about: string
    legal: string
    privacyPolicy: string
    termsOfService: string
    theme: string
    language: string
    copyright: string
    disclaimer: string
    footer: string
  }
  home: {
    title: string
    subtitle: string
    searchPlaceholder: string
    search: string
    reset: string
    allPlatforms: string
    allCategories: string
    newest: string
    popular: string
    oldest: string
    nameAsc: string
    empty: string
    previous: string
    next: string
    page: string
    totalGames: string
    views: string
    plays: string
    details: string
    featured: string
    recentlyPlayed: string
    latestBlogPosts: string
    latestBlogSubtitle: string
    viewAllBlog: string
    blogPostFallback: string
  }
  homeSeo: {
    title: string
    description: string
    keywords: string
  }
  detail: {
    home: string
    play: string
    overview: string
    howToPlay: string
    details: string
    platform: string
    developer: string
    released: string
    players: string
    views: string
    plays: string
    categories: string
    languages: string
    noData: string
    browserReady: string
    noDownload: string
    faq: string
    relatedGames: string
  }
  about: {
    title: string
    description: string
  }
  blog: {
    title: string
    description: string
    subtitle: string
    eyebrow: string
    empty: string
    total: string
  }
}

export type HomeFaqs = {
  title: string
  subtitle: string
  items: Array<{ question: string; answer: string }>
}
