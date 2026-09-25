'use client'

import React, { useEffect, useState } from 'react'
import { ImageIcon, AlertCircle } from 'lucide-react'

interface StockPhotoProps {
  imageQuery: string
  className?: string
}

interface UnsplashPhoto {
  urls: { regular: string; small: string }
  alt_description: string | null
  user: { name: string; links: { html: string } }
  links: { html: string }
}

export function StockPhoto({ imageQuery, className = '' }: StockPhotoProps) {
  const [photo, setPhoto] = useState<UnsplashPhoto | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'no-key'>('loading')

  useEffect(() => {
    if (!imageQuery) {
      setStatus('error')
      return
    }

    const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      setStatus('no-key')
      return
    }

    let cancelled = false
    setStatus('loading')

    fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(imageQuery)}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    )
      .then(res => {
        if (!res.ok) throw new Error(`Unsplash ${res.status}`)
        return res.json() as Promise<UnsplashPhoto>
      })
      .then(data => {
        if (!cancelled) {
          setPhoto(data)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => { cancelled = true }
  }, [imageQuery])

  if (status === 'no-key') {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-lg bg-zinc-100 p-4 text-zinc-400 dark:bg-zinc-800 ${className}`}>
        <ImageIcon className="h-8 w-8" />
        <p className="text-center text-xs leading-snug">
          Add <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">NEXT_PUBLIC_UNSPLASH_ACCESS_KEY</code> to enable photos
        </p>
        <p className="text-xs italic opacity-70">Query: {imageQuery}</p>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 ${className}`} style={{ minHeight: 140 }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
      </div>
    )
  }

  if (status === 'error' || !photo) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 rounded-lg bg-zinc-100 p-4 text-zinc-400 dark:bg-zinc-800 ${className}`}>
        <AlertCircle className="h-6 w-6" />
        <p className="text-xs">Could not load photo for: {imageQuery}</p>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <img
        src={photo.urls.regular}
        alt={photo.alt_description ?? imageQuery}
        className="h-full w-full object-cover"
        style={{ minHeight: 140 }}
      />
      <a
        href={`${photo.links.html}?utm_source=chalkie&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80 hover:text-white"
      >
        {photo.user.name} / Unsplash
      </a>
    </div>
  )
}
