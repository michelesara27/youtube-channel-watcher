-- Migration: add 'active' boolean to users table with default FALSE
BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure all existing rows have FALSE (in case column was added without default applied)
UPDATE public.users SET active = FALSE WHERE active IS NULL;

-- Optional: comment for documentation
COMMENT ON COLUMN public.users.active IS 'Define se usuário está ativo para login';

COMMIT;
