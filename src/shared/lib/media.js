import { env } from '@/shared/config/env'

export function mediaUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  const url = value.trim()
  if (url.startsWith('/media/') && !url.includes('\\') && !url.split('/').includes('..')) {
    return env.mediaBaseUrl + url
  }
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? url : null
  } catch {
    return null
  }
}

export const careMedia = {
  hero: '/media/demo/v1/home/care-hero.png',
}
