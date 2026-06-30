import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$username/status/$statusid')({
  beforeLoad: ({ params }) => {
    const xUrl = `https://x.com/${params.username}/status/${params.statusid}`

    throw redirect({
      to: '/x',
      search: {
        url: xUrl,
      },
    })
  },
})
