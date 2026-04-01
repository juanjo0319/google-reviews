-- Add password_hash column to public.users for Credentials provider
ALTER TABLE public.users ADD COLUMN password_hash text;
