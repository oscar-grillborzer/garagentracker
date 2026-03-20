export type UserName = 'Leo' | 'Ben' | 'Oscar'

export type CityStatus =
  | 'offen'
  | 'kontaktiert'
  | 'interessant'
  | 'verhandlung'
  | 'gekauft'
  | 'abgesagt'

export type CityPriority = 'niedrig' | 'mittel' | 'hoch'

export interface Profile {
  id: string
  name: UserName
  color: string
  created_at: string
  accepted_terms: boolean
}

export interface City {
  id: string
  name: string
  status: CityStatus
  priority: CityPriority
  assigned_to: string | null
  note: string
  updated_by: string | null
  updated_at: string
  created_at: string
  tags: string[]
  reminder_date: string | null
  note_history: string[]
  listing_count?: number
  profiles?: Profile | null
  assigned_profile?: Profile | null
}

export interface Listing {
  id: string
  city_id: string
  url: string | null
  price: number | null
  size_sqm: number | null
  phone: string | null
  note: string | null
  source: string | null
  scraped: boolean
  added_by: string | null
  added_at: string
  profiles?: Profile | null
}

export interface ActivityLog {
  id: string
  city_id: string | null
  user_id: string
  action: string
  meta: Record<string, unknown>
  created_at: string
  profiles?: Profile | null
  cities?: Pick<City, 'id' | 'name'> | null
}

export interface ScraperResult {
  title: string | null
  price: number | null
  size: number | null
  phone: string | null
  source: string
  scrapedAt: string
}

export interface ScraperError {
  error: string
}

export type Tab = 'staedte' | 'uebersicht' | 'log'

export interface ToastItem {
  id: string
  message: string
  type: 'info' | 'success' | 'error'
}
