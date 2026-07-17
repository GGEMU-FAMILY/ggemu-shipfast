import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/share-image')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const imageUrl = getImageUrl(url)

        if (!imageUrl) {
          return new Response('Invalid image request', { status: 400 })
        }

        const response = await fetch(imageUrl)
        const contentType = response.headers.get('content-type') || ''

        if (!response.ok || !contentType.startsWith('image/')) {
          return new Response('Image not found', { status: 404 })
        }

        return new Response(await response.arrayBuffer(), {
          headers: {
            'cache-control': 'public, max-age=86400',
            'content-type': contentType,
          },
        })
      },
    },
  },
})

function getImageUrl(url: URL) {
  const source = url.searchParams.get('url')

  if (!source) {
    return ''
  }

  try {
    const imageUrl = new URL(source)

    if (imageUrl.protocol !== 'https:' && imageUrl.protocol !== 'http:') {
      return ''
    }

    return imageUrl.toString()
  } catch {
    return ''
  }
}
