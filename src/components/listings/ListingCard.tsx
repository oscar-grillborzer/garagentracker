import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDeleteListing } from '../../hooks/useListings'
import { useProfile } from '../../hooks/useAuth'
import { formatPrice, formatDate } from '../../lib/utils'
import { USER_COLORS } from '../../lib/constants'
import type { Listing, UserName } from '../../types'

interface ListingCardProps {
  listing: Listing
  cityId: string
}

export function ListingCard({ listing, cityId }: ListingCardProps) {
  const deleteListing = useDeleteListing()
  const { data: profile } = useProfile()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const userColor = listing.profiles
    ? USER_COLORS[listing.profiles.name as UserName] ?? '#52525b'
    : '#52525b'

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    await deleteListing.mutateAsync({ id: listing.id, cityId })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="bg-surface border border-border rounded-md p-3 space-y-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {listing.price && (
              <span className="text-[14px] font-bold text-text font-mono">
                {formatPrice(listing.price)}
              </span>
            )}
            {listing.size_sqm && (
              <span className="text-[12px] text-text-2">
                {listing.size_sqm} m²
              </span>
            )}
            {listing.scraped && (
              <span className="text-[11px] text-cyan border border-cyan/20 bg-cyan/10 rounded-sm px-1.5 py-0.5">
                ⚡ Gescrapt
              </span>
            )}
          </div>

          {listing.phone && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a
                href={`tel:${listing.phone}`}
                className="text-[12px] font-mono text-cyan hover:underline"
              >
                {listing.phone}
              </a>
            </div>
          )}

          {listing.url && (
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-text-2 hover:text-text transition-colors truncate"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="truncate">{listing.source ?? listing.url}</span>
            </a>
          )}

          {listing.note && (
            <p className="text-[12px] text-text-2">{listing.note}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {listing.profiles && (
            <span
              className="text-[11px] font-medium px-1.5 h-5 rounded-sm border flex items-center"
              style={{
                color: userColor,
                borderColor: `${userColor}30`,
                backgroundColor: `${userColor}12`,
              }}
            >
              {listing.profiles.name[0]}
            </span>
          )}
          {profile && (
            <button
              onClick={handleDelete}
              disabled={deleteListing.isPending}
              className="text-muted hover:text-red transition-colors disabled:opacity-40"
            >
              {confirmDelete ? (
                <span className="text-[11px] text-red border border-red/30 rounded-sm px-1.5 py-0.5">
                  Sicher?
                </span>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-[11px] text-muted">
          {formatDate(listing.added_at)}
        </span>
      </div>
    </motion.div>
  )
}
