import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/games/$gameId')({
  beforeLoad: ({ params }) => {
    throw redirect({
      params: { gameId: params.gameId, locale: 'zh-CN' },
      to: '/$locale/games/$gameId',
    })
  },
})
