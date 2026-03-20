import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ScraperResult } from '../types'
import { ALLOWED_SCRAPER_DOMAINS } from '../lib/constants'

function detectSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    for (const domain of ALLOWED_SCRAPER_DOMAINS) {
      if (hostname.includes(domain)) return domain
    }
    return hostname
  } catch {
    return 'unbekannt'
  }
}

export function isAllowedUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return ALLOWED_SCRAPER_DOMAINS.some((d) => hostname.includes(d))
  } catch {
    return false
  }
}

export function useScraper() {
  return useMutation({
    mutationFn: async (url: string): Promise<ScraperResult> => {
      const minDelay = new Promise((r) => setTimeout(r, 300))

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      const fetchPromise = fetch(
        `${supabaseUrl}/functions/v1/scrape-listing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? ''}`,
          },
          body: JSON.stringify({ url }),
          signal: AbortSignal.timeout(15_000),
        }
      )

      const [response] = await Promise.all([fetchPromise, minDelay])

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }

      const json = await response.json() as ScraperResult | { error: string }

      if ('error' in json) {
        throw new Error(json.error)
      }

      return { ...json, source: detectSource(url) }
    },
  })
}
