-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL CHECK (name IN ('Leo', 'Ben', 'Oscar')),
  color text NOT NULL DEFAULT '#4ade80',
  accepted_terms boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Whitelist table (phone numbers allowed to login)
CREATE TABLE IF NOT EXISTS whitelist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'offen'
    CHECK (status IN ('offen', 'kontaktiert', 'interessant', 'verhandlung', 'gekauft', 'abgesagt')),
  priority text NOT NULL DEFAULT 'mittel'
    CHECK (priority IN ('niedrig', 'mittel', 'hoch')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  note text NOT NULL DEFAULT '',
  note_history jsonb NOT NULL DEFAULT '[]',
  tags jsonb NOT NULL DEFAULT '[]',
  reminder_date date,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  url text,
  price integer,
  size_sqm numeric,
  phone text,
  note text,
  source text,
  scraped boolean NOT NULL DEFAULT false,
  added_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  added_at timestamptz NOT NULL DEFAULT now()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Authenticated users can read profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Whitelist RLS (only service role can modify)
CREATE POLICY "Authenticated users can read whitelist"
  ON whitelist FOR SELECT TO authenticated USING (true);

-- Cities RLS
CREATE POLICY "Authenticated users can read cities"
  ON cities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert cities"
  ON cities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update cities"
  ON cities FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete cities"
  ON cities FOR DELETE TO authenticated USING (true);

-- Listings RLS
CREATE POLICY "Authenticated users can read listings"
  ON listings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert listings"
  ON listings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update listings"
  ON listings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete listings"
  ON listings FOR DELETE TO authenticated USING (true);

-- Activity log RLS
CREATE POLICY "Authenticated users can read activity log"
  ON activity_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own log entries"
  ON activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cities;
ALTER PUBLICATION supabase_realtime ADD TABLE listings;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cities_status ON cities(status);
CREATE INDEX IF NOT EXISTS idx_cities_assigned_to ON cities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_listings_city_id ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_city_id ON activity_log(city_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Seed: 47 eastern German cities
INSERT INTO cities (name, status, priority) VALUES
  ('Berlin', 'offen', 'hoch'),
  ('Leipzig', 'offen', 'hoch'),
  ('Dresden', 'offen', 'hoch'),
  ('Halle (Saale)', 'offen', 'hoch'),
  ('Erfurt', 'offen', 'mittel'),
  ('Rostock', 'offen', 'mittel'),
  ('Potsdam', 'offen', 'mittel'),
  ('Chemnitz', 'offen', 'mittel'),
  ('Magdeburg', 'offen', 'mittel'),
  ('Jena', 'offen', 'mittel'),
  ('Cottbus', 'offen', 'niedrig'),
  ('Gera', 'offen', 'niedrig'),
  ('Dessau-Roßlau', 'offen', 'niedrig'),
  ('Schwerin', 'offen', 'niedrig'),
  ('Zwickau', 'offen', 'niedrig'),
  ('Görlitz', 'offen', 'niedrig'),
  ('Weimar', 'offen', 'mittel'),
  ('Merseburg', 'offen', 'niedrig'),
  ('Bautzen', 'offen', 'niedrig'),
  ('Stralsund', 'offen', 'niedrig'),
  ('Greifswald', 'offen', 'niedrig'),
  ('Neubrandenburg', 'offen', 'niedrig'),
  ('Nordhausen', 'offen', 'niedrig'),
  ('Eisenach', 'offen', 'niedrig'),
  ('Plauen', 'offen', 'niedrig'),
  ('Suhl', 'offen', 'niedrig'),
  ('Wismar', 'offen', 'niedrig'),
  ('Neustrelitz', 'offen', 'niedrig'),
  ('Halberstadt', 'offen', 'niedrig'),
  ('Stendal', 'offen', 'niedrig'),
  ('Brandenburg an der Havel', 'offen', 'niedrig'),
  ('Frankfurt (Oder)', 'offen', 'niedrig'),
  ('Eberswalde', 'offen', 'niedrig'),
  ('Neuruppin', 'offen', 'niedrig'),
  ('Prenzlau', 'offen', 'niedrig'),
  ('Senftenberg', 'offen', 'niedrig'),
  ('Riesa', 'offen', 'niedrig'),
  ('Freiberg', 'offen', 'niedrig'),
  ('Döbeln', 'offen', 'niedrig'),
  ('Pirna', 'offen', 'niedrig'),
  ('Meißen', 'offen', 'mittel'),
  ('Annaberg-Buchholz', 'offen', 'niedrig'),
  ('Altenburg', 'offen', 'niedrig'),
  ('Rudolstadt', 'offen', 'niedrig'),
  ('Saalfeld', 'offen', 'niedrig'),
  ('Mühlhausen', 'offen', 'niedrig'),
  ('Bad Langensalza', 'offen', 'niedrig')
ON CONFLICT DO NOTHING;
