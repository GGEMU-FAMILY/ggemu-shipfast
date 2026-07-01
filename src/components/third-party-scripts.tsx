import { siteConfig } from '#/lib/site-config'

export function ThirdPartyScripts() {
  return (
    <>
      <GoogleAnalytics />
      <GoogleAdsense />
    </>
  )
}

function GoogleAnalytics() {
  const analyticsId = siteConfig.GOOGLE_ANALYTICS_ID.trim()

  if (!analyticsId) {
    return null
  }

  const setupScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', ${JSON.stringify(analyticsId)});
  `

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
          analyticsId,
        )}`}
      />
      <script dangerouslySetInnerHTML={{ __html: setupScript }} />
    </>
  )
}

function GoogleAdsense() {
  const client = siteConfig.GOOGLE_ADSENSE_CLIENT.trim()

  if (!client) {
    return null
  }

  return (
    <script
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        client,
      )}`}
    />
  )
}
