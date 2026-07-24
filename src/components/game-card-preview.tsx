import type { FocusEvent, MouseEvent } from 'react'

const previewVideoSelector = '[data-game-card-preview-video]'

function getPreviewVideo(element: HTMLElement) {
  return element.querySelector<HTMLVideoElement>(previewVideoSelector)
}

function playPreviewVideo(event: FocusEvent<HTMLElement> | MouseEvent<HTMLElement>) {
  getPreviewVideo(event.currentTarget)?.play().catch(() => {})
}

function stopPreviewVideo(event: FocusEvent<HTMLElement> | MouseEvent<HTMLElement>) {
  const video = getPreviewVideo(event.currentTarget)

  if (!video) {
    return
  }

  video.pause()
  video.currentTime = 0
}

export const gameCardPreviewHandlers = {
  onBlur: stopPreviewVideo,
  onFocus: playPreviewVideo,
  onMouseEnter: playPreviewVideo,
  onMouseLeave: stopPreviewVideo,
}

export function GameCardPreviewVideo({
  className = '',
  src,
}: {
  className?: string
  src?: string
}) {
  if (!src?.trim()) {
    return null
  }

  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${className}`}
      data-game-card-preview-video
      loop
      muted
      playsInline
      preload="none"
      src={src}
    />
  )
}
