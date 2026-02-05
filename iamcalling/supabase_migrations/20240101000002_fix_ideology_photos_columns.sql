-- Migration to fix column names in ideology_photos table

ALTER TABLE ideology_photos
RENAME COLUMN cloudunary_url TO cloudinary_url;

ALTER TABLE ideology_photos
RENAME COLUMN cloudunary_id TO cloudinary_id;

ALTER TABLE ideology_photos
RENAME COLUMN cloudunary_public_id TO cloudinary_public_id;

ALTER TABLE ideology_photos
RENAME COLUMN ideology_type TO ideology;
