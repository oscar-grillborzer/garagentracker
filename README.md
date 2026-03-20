# Garagentracker

Ein produktionsreifes, kollaboratives Echtzeit-Tool zum Tracking von Garagendeal-Standorten für 3 Nutzer (Leo, Ben, Oscar) in Ostdeutschland.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/garagentracker)

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (vollständig custom, keine Komponentenbibliothek)
- **Animationen**: Framer Motion
- **State**: Zustand (UI) + TanStack Query (Server State)
- **Backend**: Supabase (Postgres + Realtime + Auth)
- **Auth**: Supabase Phone OTP (via Twilio)
- **Scraper**: Supabase Edge Function (Deno)
- **Deployment**: Vercel

---

## Lokale Entwicklung

### Voraussetzungen

- Node.js 18+
- npm oder pnpm
- Supabase CLI (optional, für lokale Entwicklung)

### 1. Repository klonen

```bash
git clone https://github.com/your-org/garagentracker.git
cd garagentracker
npm install
```

### 2. Umgebungsvariablen setzen

```bash
cp .env.example .env
```

Bearbeite `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Entwicklungsserver starten

```bash
npm run dev
```

---

## Supabase Setup

### Schritt 1: Neues Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. **Wichtig**: Wähle Region **EU Central (Frankfurt)** für DSGVO-Konformität
3. Notiere dir `Project URL` und `anon public key`

### Schritt 2: Datenbank-Migration ausführen

Im Supabase Dashboard → SQL Editor → Neue Abfrage:

```sql
-- Führe den Inhalt von supabase/migrations/001_init.sql aus
```

Oder via Supabase CLI:

```bash
supabase db push
```

### Schritt 3: Whitelist befüllen

Die Whitelist enthält die erlaubten Telefonnummern (gehasht). Da Supabase Phone Auth die Nummern intern verwaltet, werden Whitelist-Einträge manuell hinzugefügt:

```sql
-- Im SQL Editor:
INSERT INTO whitelist (phone_hash) VALUES
  (encode(digest('+491511234567', 'sha256'), 'hex')),
  (encode(digest('+491609876543', 'sha256'), 'hex')),
  (encode(digest('+491731234567', 'sha256'), 'hex'));
```

Ersetze die Nummern durch die tatsächlichen Nummern von Leo, Ben und Oscar.

### Schritt 4: Profile erstellen

Nach dem ersten Login der Nutzer müssen Profile erstellt werden. Das passiert automatisch über eine Supabase-Funktion oder manuell:

```sql
-- Im SQL Editor (nach dem ersten Login):
INSERT INTO profiles (id, name, color) VALUES
  ('user-uuid-leo', 'Leo', '#4ade80'),
  ('user-uuid-ben', 'Ben', '#22d3ee'),
  ('user-uuid-oscar', 'Oscar', '#a78bfa');
```

Ersetze `user-uuid-*` mit den echten UUIDs aus `auth.users`.

### Schritt 5: Realtime aktivieren

Im Supabase Dashboard → Database → Replication:
- `cities` ✓ aktivieren
- `listings` ✓ aktivieren
- `activity_log` ✓ aktivieren

---

## Twilio / Phone Auth Setup

### Schritt 1: Twilio Account

1. Erstelle einen Account bei [twilio.com](https://twilio.com)
2. Kaufe eine deutsche Telefonnummer oder nutze die Test-Credentials
3. Notiere: `Account SID`, `Auth Token`, `Phone Number`

### Schritt 2: Supabase Phone Auth konfigurieren

Im Supabase Dashboard → Authentication → Providers → Phone:

1. **Enable Phone provider** aktivieren
2. **SMS Provider**: Twilio
3. Felder ausfüllen:
   - `Twilio Account SID`
   - `Twilio Auth Token`
   - `Twilio Message Service SID` oder Telefonnummer
4. OTP-Nachricht anpassen: `Dein Garagentracker-Code: {{ .Code }}`
5. OTP-Länge: 6
6. OTP-Ablaufzeit: 600 Sekunden (10 Minuten)

---

## Edge Function (Scraper) deployen

```bash
# Supabase CLI installieren
npm install -g supabase

# Login
supabase login

# Edge Function deployen
supabase functions deploy scrape-listing --project-ref your-project-ref

# Secrets setzen (werden automatisch aus Supabase-Umgebung geerbt)
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

---

## Vercel Deployment

### Option 1: Vercel Button (oben)

Klicke den "Deploy with Vercel"-Button und folge den Anweisungen.

### Option 2: Manuell

1. **Vercel CLI installieren**: `npm install -g vercel`
2. **Login**: `vercel login`
3. **Deployen**: `vercel --prod`

### Umgebungsvariablen in Vercel

Im Vercel Dashboard → Project → Settings → Environment Variables:

```
VITE_SUPABASE_URL        = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY   = your-anon-key
```

---

## Features

### Kern-Features
- **Städteliste** (280px Sidebar): Virtualisierte Liste mit 47+ Städten, Suche, Filter, Sortierung
- **Stadtdetail**: Inline-Bearbeitung aller Eigenschaften ohne Modals
- **Inserate**: Manuelle Eingabe + automatischer Scraper für Kleinanzeigen/ImmobilienScout24/Immowelt
- **Übersicht**: KPI-Karten, Status-Verteilung, Top-Städte nach Inseraten
- **Log**: Reverse-chronologischer Aktivitätsfeed
- **Echtzeit**: Supabase Realtime + optimistic updates (kein Lag)
- **Toast-Benachrichtigungen**: Bei Änderungen anderer Nutzer

### Erweiterte Features (via "Mehr anzeigen")
- **Tags**: Freitext-Tags pro Stadt
- **Wiedervorlage**: Datum-Erinnerungen mit "Fällig heute"-Anzeige
- **Notizverlauf**: Letzte 5 Versionen
- **Export**: Excel-Download aller Städte + Daten (SheetJS)
- **Bulk-Update**: Mehrere Städte auswählen, Status auf einmal setzen

### Auth
- Supabase Phone OTP (SMS via Twilio)
- Whitelist: Nur erlaubte Nummern
- DSGVO-Hinweis beim ersten Login
- Session: 30 Tage (localStorage)
- Telefonnummer wird nach Login nicht angezeigt

---

## Projektstruktur

```
src/
  components/
    auth/          LoginScreen.tsx, OtpScreen.tsx, TermsScreen.tsx
    layout/        Topbar.tsx
    cities/        CityList.tsx, CityRow.tsx, CityDetail.tsx, BulkStatusUpdate.tsx
    listings/      ListingCard.tsx, AddListingForm.tsx (inkl. Scraper)
    panels/        StatsPanel.tsx, LogPanel.tsx
    ui/            Button.tsx, Input.tsx, PropertyRow.tsx, StatusChip.tsx, Toast.tsx, Skeleton.tsx
  hooks/
    useAuth.ts, useCities.ts, useListings.ts, useRealtime.ts, useScraper.ts, useActivityLog.ts
  lib/
    supabase.ts, queryClient.ts, constants.ts, utils.ts
  store/
    ui.store.ts    (Zustand: activeCity, tab, toasts, filter/sort)
  types/
    index.ts
supabase/
  functions/scrape-listing/index.ts
  migrations/001_init.sql
```

---

## Datenschutz (DSGVO)

- Telefonnummer wird nur zur Authentifizierung in Supabase `auth.users` gespeichert (gehasht)
- Kein Display der Telefonnummer nach dem Login
- Alle Daten in EU-Region (Frankfurt, Supabase)
- Session-Token im localStorage (mit Hinweis in der UI)
- Automatisches Logout nach 30 Tagen
- Einmalige Einwilligungsseite beim ersten Login

---

## Entwicklung

```bash
npm run dev      # Entwicklungsserver (http://localhost:5173)
npm run build    # Produktions-Build
npm run preview  # Build-Vorschau
npm run lint     # ESLint
```

---

## Lizenz

Privat — nur für den internen Gebrauch von Leo, Ben und Oscar.
