import { siteConfig } from '#/lib/site-config'
import type { HomeFaqs, I18nMessages } from './types'

export const zhCnMessages = {
  layout: {
    games: '首页',
    explore: '探索',
    playMyRom: '玩本地游戏',
    blog: '博客',
    about: '关于我们',
    legal: '法律',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    theme: '主题',
    language: '语言',
    get copyright() {
      return `版权所有 © 2025 ${siteConfig.SITE_NAME}`
    },
    get disclaimer() {
      return `所有游戏 ROM / 程序均由用户提交或收集自互联网，版权归其各自所有者所有。如有任何问题，请发送邮件至 ${siteConfig.SITE_EMAIL}，我们会移除对应内容。`
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
    totalGames: '共 {total} 款游戏',
    views: '浏览',
    plays: '游玩',
    details: '查看详情',
    featured: '可在线游玩的复古游戏',
    recentlyPlayed: '最近玩过',
    latestBlogPosts: '最新博客文章',
    latestBlogSubtitle: '阅读最新游戏指南、浏览器游玩技巧和复古游戏相关文章。',
    viewAllBlog: '查看全部文章',
    blogPostFallback: '博客文章',
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
  blog: {
    title: '博客',
    description: '阅读游戏指南、浏览器游玩技巧和复古游戏相关文章。',
    subtitle: '阅读游戏指南、浏览器游玩技巧和复古游戏相关文章。',
    eyebrow: 'Blog',
    empty: '暂无文章',
    total: '共 {total} 篇文章',
  },
} satisfies I18nMessages

export const zhCnHomeFaqs = {
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
} satisfies HomeFaqs
