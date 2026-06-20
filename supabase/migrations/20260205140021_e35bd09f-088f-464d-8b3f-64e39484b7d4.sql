-- Migration: Hash IP addresses in user_consents table for privacy protection
-- This addresses the PUBLIC_DATA_EXPOSURE finding by converting plaintext IPs to SHA-256 hashes

-- Step 1: Add new column for hashed IP addresses
ALTER TABLE public.user_consents ADD COLUMN IF NOT EXISTS ip_address_hash TEXT;

-- Step 2: Migrate existing plaintext IPs to hashed values
UPDATE public.user_consents 
SET ip_address_hash = encode(sha256(COALESCE(ip_address, '')::bytea), 'hex')
WHERE ip_address IS NOT NULL AND ip_address_hash IS NULL;

-- Step 3: Drop the plaintext IP address column
ALTER TABLE public.user_consents DROP COLUMN IF EXISTS ip_address;

-- Add comment documenting the security improvement
COMMENT ON COLUMN public.user_consents.ip_address_hash IS 'SHA-256 hash of user IP address for privacy protection. Original IPs are not stored.';