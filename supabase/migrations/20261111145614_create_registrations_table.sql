/*
# Create registrations table for YCC CUP tournament

1. New Tables
- `registrations` — one row per team registration for the YCC CUP tournament.
  - `id` (text, primary key) — human-readable registration ID like "YCC-20260801-XXXXX".
  - `team_name` (text, not null)
  - `captain_name` (text, not null)
  - `captain_phone` (text, not null)
  - `captain_email` (text, not null)
  - `city` (text, not null)
  - `division` (text, not null, default '') — must be "Gwalior" or "Sagar"; only these two divisions are eligible.
  - `state` (text, not null)
  - `category` (text, not null) — Under-19 / Under-23 / Open
  - `transaction_id` (text, not null) — UPI UTR reference
  - `payment_proof_url` (text, nullable) — base64 data URL of payment screenshot
  - `status` (text, not null, default 'pending') — pending / approved / rejected
  - `rejection_reason` (text, nullable)
  - `created_at` (text, not null) — ISO timestamp
  - `updated_at` (text, not null) — ISO timestamp
  - `extra_details` (jsonb, nullable)
2. Security
- Enable RLS on `registrations`.
- Grant SELECT, INSERT, UPDATE, DELETE to `anon` + `authenticated`.
- Allow anon + authenticated full access with USING(true)/WITH CHECK(true) because this is a
  single-tenant, no-sign-in public registration form — anyone may submit and track their own
  registration; the eligibility rules (Gwalior/Sagar divisions only, 250-team cap) are enforced
  by the application's API server, which connects over the direct Postgres connection.
3. Notes
- The tournament has a hard cap of 250 total registrations, enforced in application code.
- Only Gwalior and Sagar division teams may register, enforced in both the form and the API.
*/

CREATE TABLE IF NOT EXISTS registrations (
  id text PRIMARY KEY,
  team_name text NOT NULL,
  captain_name text NOT NULL,
  captain_phone text NOT NULL,
  captain_email text NOT NULL,
  city text NOT NULL,
  division text NOT NULL DEFAULT '',
  state text NOT NULL,
  category text NOT NULL,
  transaction_id text NOT NULL,
  payment_proof_url text,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  extra_details jsonb
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON registrations TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_registrations" ON registrations;
CREATE POLICY "anon_select_registrations" ON registrations FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_registrations" ON registrations;
CREATE POLICY "anon_insert_registrations" ON registrations FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_registrations" ON registrations;
CREATE POLICY "anon_update_registrations" ON registrations FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_registrations" ON registrations;
CREATE POLICY "anon_delete_registrations" ON registrations FOR DELETE
TO anon, authenticated USING (true);
