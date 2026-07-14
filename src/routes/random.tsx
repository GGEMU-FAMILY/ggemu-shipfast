import { createFileRoute, redirect } from '@tanstack/react-router'

type RandomSearch = {
  p?: string
}

function validateRandomSearch(search: Record<string, unknown>): RandomSearch {
  return {
    p: typeof search.p === 'string' ? search.p.trim() : undefined,
  }
}

export const Route = createFileRoute('/random')({
  validateSearch: validateRandomSearch,
  beforeLoad: ({ search }) => {
    throw redirect({
      params: { locale: 'zh-CN' },
      replace: true,
      search,
      to: '/$locale/random',
    })
  },
})
