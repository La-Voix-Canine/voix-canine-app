-- ============================================================
-- La Voix Canine — Mise à jour de la base de données (octobre 2026)
-- À coller dans Supabase : Project > SQL Editor > New query > Run
-- Sans danger à exécuter plusieurs fois (ne duplique rien).
-- À exécuter APRÈS le script de septembre (migration_update_2026-09.sql),
-- qui doit déjà avoir été appliqué.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Chien castré / stérilisé (Oui/Non)
-- ------------------------------------------------------------
alter table dogs add column if not exists castre text;

-- ------------------------------------------------------------
-- 2. Exercices de dressage propres à chaque chien (ajoutés librement)
-- ------------------------------------------------------------
alter table dogs add column if not exists dressage_exercices jsonb not null default '[]'::jsonb;

-- ------------------------------------------------------------
-- 3. Règlement : paiement en 3 fois
-- ------------------------------------------------------------
alter table forfaits add column if not exists montant_paiement_3 numeric(10,2);
alter table forfaits add column if not exists date_paiement_3 date;

-- ------------------------------------------------------------
-- Terminé.
-- ------------------------------------------------------------
