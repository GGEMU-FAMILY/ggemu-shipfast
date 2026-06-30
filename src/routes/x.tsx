import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/x')({
  validateSearch: (search) => ({
    url: typeof search.url === 'string' ? search.url : '',
  }),
  component: XPage,
})

function XPage() {
  const { url } = Route.useSearch()

  return (
    <main>
      <h1>X URL</h1>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      ) : (
        <p>No URL provided.</p>
      )}
    </main>
  )
}
