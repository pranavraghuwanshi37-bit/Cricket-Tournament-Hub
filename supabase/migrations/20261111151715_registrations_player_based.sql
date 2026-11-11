/*
# Switch registrations from team-based to individual player-based

1. Modified Tables
- `registrations`
  - New columns for individual players:
    - `player_name` (text, not null, default '') — full name of the registering player.
    - `player_phone` (text, not null, default '') — player contact number.
    - `player_email` (text, not null, default '') — player email.
    - `player_age` (text, not null, default '') — player age.
    - `player_role` (text, not null, default 'All-Rounder') — playing role: Batsman / Bowler / All-Rounder / Wicket-Keeper.
  - Old team-based columns (`team_name`, `captain_name`, `captain_phone`, `captain_email`) are kept
    (no data loss) but made nullable so new player-based rows can omit them.
2. Notes
- Registration fee is ₹500 per player, enforced in application code.
- Only Gwalior and Sagar divisions remain eligible, enforced in application code.
- Cap of 250 total registrations remains, enforced in application code.
- A player enters the auction only after the organiser confirms payment (status = 'approved').
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'player_name') THEN
    ALTER TABLE registrations ADD COLUMN player_name text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'player_phone') THEN
    ALTER TABLE registrations ADD COLUMN player_phone text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'player_email') THEN
    ALTER TABLE registrations ADD COLUMN player_email text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'player_age') THEN
    ALTER TABLE registrations ADD COLUMN player_age text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'player_role') THEN
    ALTER TABLE registrations ADD COLUMN player_role text NOT NULL DEFAULT 'All-Rounder';
  END IF;
END $$;

ALTER TABLE registrations ALTER COLUMN team_name DROP NOT NULL;
ALTER TABLE registrations ALTER COLUMN captain_name DROP NOT NULL;
ALTER TABLE registrations ALTER COLUMN captain_phone DROP NOT NULL;
ALTER TABLE registrations ALTER COLUMN captain_email DROP NOT NULL;
