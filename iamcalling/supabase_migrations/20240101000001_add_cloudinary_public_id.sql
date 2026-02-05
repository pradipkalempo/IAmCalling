-- Add cloudinary_public_id column to ideology_photos table
ALTER TABLE ideology_photos ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
