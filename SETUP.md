# Garagentracker — Quick Setup

## Deine Supabase-Konfiguration

- **Project URL**: `https://ygkwwonhwtvrizvovjdx.supabase.co`
- **Anon Key**: bereits in `.env` eingetragen ✓

---

## Schritt 1: Datenbank-Migration ausführen

1. Öffne **[Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/sql)**
2. Klicke "New query"
3. Kopiere den gesamten Inhalt von `supabase/migrations/001_init.sql` und füge ihn ein
4. Klicke "Run"

✅ Das erstellt alle Tabellen, RLS-Policies und seedet die 47 Städte.

---

## Schritt 2: Phone Auth aktivieren

1. Öffne **[Authentication → Providers](https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/auth/providers)**
2. Scrolle zu **Phone**
3. Aktiviere "Enable Phone provider"
4. Wähle **Twilio** als SMS Provider
5. Trage ein:
   - Twilio Account SID
   - Twilio Auth Token  
   - Twilio Phone Number (deutsche Nummer, z.B. `+491234567890`)
6. OTP-Ablauf: `600` Sekunden
7. Speichern

---

## Schritt 3: Nutzer-Profile anlegen

**Nachdem** Leo, Ben und Oscar sich zum ersten Mal einloggen, erscheinen ihre UUIDs unter:

👉 **[Authentication → Users](https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/auth/users)**

Dann im SQL Editor ausführen (UUIDs ersetzen):

```sql
INSERT INTO profiles (id, name, color, accepted_terms) VALUES
  ('UUID-VON-LEO',   'Leo',   '#4ade80', false),
  ('UUID-VON-BEN',   'Ben',   '#22d3ee', false),
  ('UUID-VON-OSCAR', 'Oscar', '#a78bfa', false);
```

---

## Schritt 4: Whitelist befüllen

Im SQL Editor (Telefonnummern im Format `+491234567890`):

```sql
-- Ersetze die Nummern durch die echten Nummern von Leo, Ben, Oscar
INSERT INTO whitelist (phone_hash) VALUES
  (encode(digest('+491511234567', 'sha256'), 'hex')),
  (encode(digest('+491609876543', 'sha256'), 'hex')),
  (encode(digest('+491731234567', 'sha256'), 'hex'));
```

> **Hinweis**: Die Whitelist wird aktuell im Frontend nicht automatisch geprüft (Supabase Phone Auth erlaubt/verweigert Logins). Für eine strikte Whitelist-Prüfung kann eine Supabase Auth-Hook verwendet werden.

---

## Schritt 5: Realtime aktivieren

1. Öffne **[Database → Replication](https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/database/replication)**
2. Aktiviere Realtime für:
   - ✅ `cities`
   - ✅ `listings`
   - ✅ `activity_log`

---

## Schritt 6: Edge Function deployen (Scraper)

```bash
# Supabase CLI
npx supabase login
npx supabase link --project-ref ygkwwonhwtvrizvovjdx
npx supabase functions deploy scrape-listing
```

---

## Schritt 7: Lokal starten

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Schritt 8: Vercel Deploy

1. Push zu GitHub ✓ (bereits erledigt)
2. Importiere Repo auf **[vercel.com/new](https://vercel.com/new)**
3. Setze Environment Variables:
   ```
   VITE_SUPABASE_URL = https://ygkwwonhwtvrizvovjdx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Deploy klicken

---

## Direktlinks für dein Supabase-Projekt

| Was | Link |
|-----|------|
| SQL Editor | https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/sql |
| Auth Providers | https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/auth/providers |
| Auth Users | https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/auth/users |
| Database Replication | https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/database/replication |
| Edge Functions | https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/functions |
| Logs | https://supabase.com/dashboard/project/ygkwwonhwtvrizvovjdx/logs/edge-logs |
