-- Add telegramchatid column to devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS telegramchatid TEXT;
