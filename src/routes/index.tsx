import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      params: { locale: 'zh-CN' },
      to: '/$locale',
    })
  },
})
