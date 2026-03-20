import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_DOMAINS = [
  'kleinanzeigen.de',
  'ebay-kleinanzeigen.de',
  'immobilienscout24.de',
  'immowelt.de',
  'immonet.de',
]

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ScrapeResult {
  title: string | null
  price: number | null
  size: number | null
  phone: string | null
  source: string
  scrapedAt: string
}

function isAllowedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return ALLOWED_DOMAINS.some((d) => hostname.includes(d))
  } catch {
    return false
  }
}

function extractPrice(html: string): number | null {
  const patterns = [
    /(\d{1,3}(?:[.,]\d{3})*)\s*€/g,
    /€\s*(\d{1,3}(?:[.,]\d{3})*)/g,
    /"price"[:\s]+"?(\d+)"?/g,
    /preis[:\s]+(\d{1,3}(?:[.,]\d{3})*)/gi,
    /kaufpreis[:\s]+(\d{1,3}(?:[.,]\d{3})*)/gi,
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const raw = match[1].replace(/\./g, '').replace(',', '.')
      const val = parseFloat(raw)
      if (val > 500 && val < 10_000_000) {
        return Math.round(val)
      }
    }
  }
  return null
}

function extractSize(html: string): number | null {
  const patterns = [
    /(\d{1,4}(?:[.,]\d+)?)\s*m[²2]/gi,
    /wohnfl[äa]che[:\s]+(\d{1,4}(?:[.,]\d+)?)/gi,
    /nutzfl[äa]che[:\s]+(\d{1,4}(?:[.,]\d+)?)/gi,
    /"livingSpace"[:\s]+(\d{1,4}(?:[.,]\d+)?)/g,
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const raw = match[1].replace(',', '.')
      const val = parseFloat(raw)
      if (val > 10 && val < 10_000) {
        return Math.round(val * 10) / 10
      }
    }
  }
  return null
}

function extractPhone(html: string): string | null {
  const patterns = [
    /(?:tel|telefon|phone|mobil)[:\s"]*(\+?49[\s\-\/]?[\d\s\-\/]{8,})/gi,
    /(\+49[\s\-]?\(?\d+\)?[\s\-]?\d{4,}[\s\-]?\d{0,})/g,
    /(?<!\d)(0\d{2,4}[\s\/\-]?\d{4,}[\s\/\-]?\d{0,})/g,
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const phone = match[1].replace(/\s+/g, ' ').trim()
      const digits = phone.replace(/\D/g, '')
      if (digits.length >= 10 && digits.length <= 15) {
        return phone
      }
    }
  }
  return null
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    return titleMatch[1]
      .replace(/\s*[-|]\s*.+$/, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .trim()
      .slice(0, 120)
  }

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match) {
    return h1Match[1].replace(/&amp;/g, '&').trim().slice(0, 120)
  }

  return null
}

function getSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    for (const domain of ALLOWED_DOMAINS) {
      if (hostname.includes(domain)) return domain
    }
    return hostname
  } catch {
    return 'unknown'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Rate limiting via Supabase auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Rate limit: max 10 requests per minute
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
    const { count } = await supabase
      .from('activity_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action', 'scrape')
      .gte('created_at', oneMinuteAgo)

    if ((count ?? 0) >= 10) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 10 requests per minute.' }), {
        status: 429,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json() as { url?: string }
    const { url } = body

    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    if (!isAllowedDomain(url)) {
      return new Response(
        JSON.stringify({ error: `Domain not allowed. Supported: ${ALLOWED_DOMAINS.join(', ')}` }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      )
    }

    // Fetch the URL server-side
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8_000)

    let html: string
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'de-DE,de;q=0.9',
        },
      })
      clearTimeout(timeout)

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          return new Response(JSON.stringify({ error: 'blocked' }), {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          })
        }
        throw new Error(`HTTP ${response.status}`)
      }

      html = await response.text()
    } catch (err) {
      clearTimeout(timeout)
      if (err instanceof Error && err.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'timeout' }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        })
      }
      throw err
    }

    // Check for bot detection
    if (
      html.includes('captcha') ||
      html.includes('bot-check') ||
      html.includes('Zugriff verweigert') ||
      html.length < 500
    ) {
      return new Response(JSON.stringify({ error: 'blocked' }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const result: ScrapeResult = {
      title: extractTitle(html),
      price: extractPrice(html),
      size: extractSize(html),
      phone: extractPhone(html),
      source: getSource(url),
      scrapedAt: new Date().toISOString(),
    }

    // Log the scrape action
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'scrape',
      meta: { url, success: true },
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Scraper error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    )
  }
})
