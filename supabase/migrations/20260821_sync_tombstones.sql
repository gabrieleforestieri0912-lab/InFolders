-- Sincronizzazione cloud bidirezionale: colonna per i marcatori di eliminazione.
-- Esegui questa query una volta nel Supabase SQL Editor (o via psql).
-- La colonna puo' mancare: in quel caso l'estensione tratta i tombstone come vuoti
-- e il push cloud non funziona finche' la migration non viene applicata.
ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS tombstones jsonb NOT NULL DEFAULT '[]'::jsonb;
