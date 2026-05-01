-- Add apikey column to devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS apikey TEXT;

-- Generate API keys for existing devices that don't have one
UPDATE devices 
SET apikey = encode(gen_random_bytes(24), 'hex')
WHERE apikey IS NULL OR apikey = '';
