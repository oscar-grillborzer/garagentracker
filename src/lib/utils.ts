import type { CityStatus } from '../types'

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date)
}

export function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'gerade eben'
  if (minutes < 60) return `vor ${minutes} Min`
  if (hours < 24) return `vor ${hours} Std`
  if (days < 7) return `vor ${days} Tagen`
  return formatDateShort(dateStr)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function isProcessed(status: CityStatus): boolean {
  return status !== 'offen'
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function isValidGermanPhone(phone: string): boolean {
  return /^(\+49|0)[1-9]\d{6,14}$/.test(phone.replace(/\s/g, ''))
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function isPastOrToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  return date <= now
}
