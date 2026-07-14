import { createFileRoute, redirect } from '@tanstack/react-router'

import { getRandomPlayableGame } from '#/lib/ggemu'

type RandomSearch = {
  p?: string
}

function validateRandomSearch(search: Record<string, unknown>): RandomSearch {
  return {
    p: typeof search.p === 'string' ? search.p.trim() : undefined,
  }
}

function getRandomGameRouteId(game: Awaited<ReturnType<typeof getRandomPlayableGame>>) {
  return game?.url_slug?.trim() || game?._id?.trim() || ''
}

export const Route = createFileRoute('/$locale/random')({
  validateSearch: validateRandomSearch,
  loaderDeps: ({ search }) => ({
    p: search.p,
  }),
  loader: async ({ deps, params }) => {
    const game = await getRandomPlayableGame({
      data: {
        platform: deps.p,
      },
    })
    const gameId = getRandomGameRouteId(game)

    if (!gameId) {
      throw redirect({
        params: { locale: params.locale },
        replace: true,
        to: '/$locale',
      })
    }

    throw redirect({
      params: {
        gameId: encodeURIComponent(gameId),
        locale: params.locale,
      },
      replace: true,
      to: '/$locale/games/$gameId',
    })
  },
  component: () => null,
})
