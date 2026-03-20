import type { CityStatus, CityPriority, UserName } from '../types'

export const STATUS_LABELS: Record<CityStatus, string> = {
  offen: 'Offen',
  kontaktiert: 'Kontaktiert',
  interessant: 'Interessant',
  verhandlung: 'Verhandlung',
  gekauft: 'Gekauft',
  abgesagt: 'Abgesagt',
}

export const STATUS_COLORS: Record<CityStatus, string> = {
  offen: '#52525b',
  kontaktiert: '#22d3ee',
  interessant: '#a78bfa',
  verhandlung: '#f59e0b',
  gekauft: '#4ade80',
  abgesagt: '#f87171',
}

export const PRIORITY_LABELS: Record<CityPriority, string> = {
  niedrig: 'Niedrig',
  mittel: 'Mittel',
  hoch: 'Hoch',
}

export const PRIORITY_COLORS: Record<CityPriority, string> = {
  niedrig: '#52525b',
  mittel: '#f59e0b',
  hoch: '#f87171',
}

export const USER_COLORS: Record<UserName, string> = {
  Leo: '#4ade80',
  Ben: '#22d3ee',
  Oscar: '#a78bfa',
}

export const ALLOWED_SCRAPER_DOMAINS = [
  'kleinanzeigen.de',
  'ebay-kleinanzeigen.de',
  'immobilienscout24.de',
  'immowelt.de',
  'immonet.de',
]

export const CITY_STATUSES: CityStatus[] = [
  'offen',
  'kontaktiert',
  'interessant',
  'verhandlung',
  'gekauft',
  'abgesagt',
]

export const CITY_PRIORITIES: CityPriority[] = ['niedrig', 'mittel', 'hoch']

export const EASTERN_GERMANY_CITIES = [
  'Berlin',
  'Leipzig',
  'Dresden',
  'Halle (Saale)',
  'Erfurt',
  'Rostock',
  'Potsdam',
  'Chemnitz',
  'Magdeburg',
  'Jena',
  'Cottbus',
  'Gera',
  'Dessau-Roßlau',
  'Schwerin',
  'Zwickau',
  'Görlitz',
  'Weimar',
  'Merseburg',
  'Bautzen',
  'Stralsund',
  'Greifswald',
  'Neubrandenburg',
  'Nordhausen',
  'Eisenach',
  'Plauen',
  'Suhl',
  'Wismar',
  'Neustrelitz',
  'Halberstadt',
  'Stendal',
  'Brandenburg an der Havel',
  'Frankfurt (Oder)',
  'Eberswalde',
  'Neuruppin',
  'Prenzlau',
  'Senftenberg',
  'Riesa',
  'Freiberg',
  'Döbeln',
  'Pirna',
  'Meißen',
  'Annaberg-Buchholz',
  'Altenburg',
  'Rudolstadt',
  'Saalfeld',
  'Mühlhausen',
  'Bad Langensalza',
]
