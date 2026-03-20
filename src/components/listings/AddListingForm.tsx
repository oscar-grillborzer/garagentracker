import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAddListing } from '../../hooks/useListings'
import { useLogAction } from '../../hooks/useActivityLog'
import { useProfile } from '../../hooks/useAuth'
import { useScraper, isAllowedUrl } from '../../hooks/useScraper'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ScraperSkeleton } from '../ui/Skeleton'
import { ALLOWED_SCRAPER_DOMAINS } from '../../lib/constants'

interface AddListingFormProps {
  cityId: string
  onClose: () => void
}

function detectPlatform(url: string): string {
  for (const domain of ALLOWED_SCRAPER_DOMAINS) {
    if (url.includes(domain)) {
      if (domain.includes('kleinanzeigen')) return 'Kleinanzeigen'
      if (domain.includes('scout24')) return 'ImmobilienScout24'
      if (domain.includes('immowelt')) return 'Immowelt'
      if (domain.includes('immonet')) return 'Immonet'
      return domain
    }
  }
  return ''
}

export function AddListingForm({ cityId, onClose }: AddListingFormProps) {
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [sizeSqm, setSizeSqm] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [source, setSource] = useState('')
  const [scraperError, setScraperError] = useState<string | null>(null)
  const [scraped, setScraped] = useState(false)

  const addListing = useAddListing()
  const logAction = useLogAction()
  const { data: profile } = useProfile()
  const scraper = useScraper()

  const platform = detectPlatform(url)
  const canScrape = isAllowedUrl(url)

  async function handleScan() {
    if (!canScrape) return
    setScraperError(null)
    setScraped(false)
    try {
      const result = await scraper.mutateAsync(url)
      if (result.price != null) setPrice(String(result.price))
      if (result.size != null) setSizeSqm(String(result.size))
      if (result.phone) setPhone(result.phone)
      if (result.source) setSource(result.source)
      setScraped(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Scraping fehlgeschlagen'
      setScraperError(
        msg.includes('blocked')
          ? 'Bot-Erkennung aktiv. Daten bitte manuell eingeben.'
          : msg.includes('timeout')
          ? 'Timeout. Seite nicht erreichbar.'
          : `Fehler: ${msg}`
      )
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    await addListing.mutateAsync({
      city_id: cityId,
      url: url || null,
      price: price ? parseInt(price, 10) : null,
      size_sqm: sizeSqm ? parseFloat(sizeSqm) : null,
      phone: phone || null,
      note: note || null,
      source: source || platform || undefined,
      scraped,
      added_by: profile.id,
    })

    await logAction.mutateAsync({
      city_id: cityId,
      user_id: profile.id,
      action: `Inserat hinzugefügt${price ? ` (${price} €)` : ''}`,
      meta: { url, scraped },
    })

    onClose()
  }

  return (
    <div className="bg-surface border border-border-2 rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-text">Inserat hinzufügen</span>
          {platform && (
            <span className="text-[11px] text-cyan border border-cyan/20 bg-cyan/10 rounded-sm px-1.5 py-0.5">
              {platform}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-muted hover:text-text-2 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="URL (kleinanzeigen.de, scout24, immowelt…)"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setScraperError(null)
                setScraped(false)
              }}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleScan}
            disabled={!canScrape || scraper.isPending}
            loading={scraper.isPending}
          >
            Scannen
          </Button>
        </div>

        {scraper.isPending && <ScraperSkeleton />}

        {scraperError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12px] text-red bg-red/5 border border-red/20 rounded-sm px-3 py-2"
          >
            {scraperError}
          </motion.div>
        )}

        {scraped && !scraper.isPending && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-[12px] text-cyan"
          >
            <span>⚡</span>
            <span>Erfolgreich gescrapt — Felder wurden vorausgefüllt</span>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Preis (€)"
            type="number"
            placeholder="45000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label="Größe (m²)"
            type="number"
            step="0.1"
            placeholder="120"
            value={sizeSqm}
            onChange={(e) => setSizeSqm(e.target.value)}
          />
        </div>

        <Input
          label="Telefon"
          type="tel"
          placeholder="+49 151 12345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          label="Quelle"
          placeholder="kleinanzeigen.de"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />

        <Input
          label="Notiz"
          placeholder="Optionale Bemerkungen…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={addListing.isPending}
            disabled={addListing.isPending}
          >
            Speichern
          </Button>
        </div>
      </form>
    </div>
  )
}
