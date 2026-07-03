import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import type { Locale, PublicGame } from '#/lib/ggemu'
import { getI18n } from '#/lib/i18n'

const RECENT_PLAYED_GAMES_KEY = 'ggemu-recent-played-games'
const RECENT_PLAYED_GAMES_LIMIT = 4

export type RecentPlayedGame = {
  cover?: string
  id: string
  name: string
}

export function saveRecentPlayedGame(game: PublicGame, fallbackId: string) {
  const nextGame = getRecentPlayedGame(game, fallbackId)

  if (!nextGame) {
    return
  }

  const currentGames = readRecentPlayedGames()
  const nextGames = [
    nextGame,
    ...currentGames.filter((currentGame) => currentGame.id !== nextGame.id),
  ].slice(0, RECENT_PLAYED_GAMES_LIMIT)

  writeRecentPlayedGames(nextGames)
}

export function RecentPlayedGamesSection({
  lang,
}: {
  lang: Locale
}) {
  const games = useRecentPlayedGames()

  if (games.length === 0) {
    return null
  }

  return (
    <section className="bg-base-100">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-base-content">
          {getI18n(lang).home.recentlyPlayed}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {games.map((game) => (
            <RecentPlayedGameCard game={game} key={game.id} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function useRecentPlayedGames() {
  const [games, setGames] = useState<Array<RecentPlayedGame>>([])

  useEffect(() => {
    setGames(readRecentPlayedGames())
  }, [])

  return games
}

function RecentPlayedGameCard({
  game,
  lang,
}: {
  game: RecentPlayedGame
  lang: Locale
}) {
  return (
    <Link
      className="group flex items-center gap-3 overflow-hidden rounded-lg border border-base-300 bg-base-100 p-2 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      params={{ gameId: game.id, locale: lang }}
      search={{}}
      to="/$locale/games/$gameId"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-base-300">
        {game.cover ? (
          <img
            alt={game.name}
            className="h-full w-full object-cover"
            loading="lazy"
            src={game.cover}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[11px] font-semibold text-base-content/40">
            Retro
          </div>
        )}
      </div>
      <span className="line-clamp-2 min-w-0 text-sm font-semibold leading-snug text-base-content">
        {game.name}
      </span>
    </Link>
  )
}

function getRecentPlayedGame(game: PublicGame, fallbackId: string) {
  const id = game.url_slug?.trim() || game._id?.trim() || fallbackId.trim()
  const name = game.name?.trim()

  if (!id || !name) {
    return null
  }

  return {
    cover: game.game_cover?.trim() || undefined,
    id,
    name,
  } satisfies RecentPlayedGame
}

function readRecentPlayedGames() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const value = window.localStorage.getItem(RECENT_PLAYED_GAMES_KEY)
    const parsed = value ? JSON.parse(value) : []

    return Array.isArray(parsed)
      ? parsed.filter(isRecentPlayedGame).slice(0, RECENT_PLAYED_GAMES_LIMIT)
      : []
  } catch {
    return []
  }
}

function writeRecentPlayedGames(games: Array<RecentPlayedGame>) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(RECENT_PLAYED_GAMES_KEY, JSON.stringify(games))
}

function isRecentPlayedGame(value: unknown): value is RecentPlayedGame {
  if (!value || typeof value !== 'object') {
    return false
  }

  const game = value as Partial<RecentPlayedGame>

  return typeof game.id === 'string' && typeof game.name === 'string'
}
