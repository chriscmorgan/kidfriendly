-- Relax description minimum length from 50 to 1 character.
-- Application-level validation (API route) enforces the minimum;
-- keeping only an upper bound here prevents truly empty inserts.
ALTER TABLE locations DROP CONSTRAINT locations_description_check;
ALTER TABLE locations ADD CONSTRAINT locations_description_check
  CHECK (char_length(description) between 1 and 1000);
