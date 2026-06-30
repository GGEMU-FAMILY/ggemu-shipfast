import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$username/article/$statusid')({
  beforeLoad: ({ params }) => {
    const xUrl = `https://x.com/${params.username}/article/${params.statusid}`

    throw redirect({
      to: '/x',
      search: {
        url: xUrl,
      },
    })
  },
})
