-- ============================================================
-- La Voix Canine — Mise à jour de la base de données (septembre 2026)
-- À coller dans Supabase : Project > SQL Editor > New query > Run
-- Sans danger à exécuter plusieurs fois (ne duplique rien).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table "lieux" (liste personnalisable des lieux de séance / RDV)
-- ------------------------------------------------------------
create table if not exists lieux (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  nom text not null,
  necessite_precision boolean not null default false
);

-- Au cas où la table existait déjà sans cette colonne (installation précédente)
alter table lieux add column if not exists necessite_precision boolean not null default false;

alter table lieux enable row level security;

drop policy if exists "lieux: owner only" on lieux;
create policy "lieux: owner only" on lieux
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create index if not exists idx_lieux_owner on lieux(owner_id);

-- ------------------------------------------------------------
-- 2. Reprise des lieux déjà utilisés par chaque compte existant
-- (pour chaque compte qui a déjà des clients, on crée les 3 lieux
-- historiques s'ils n'existent pas encore, pour ne rien perdre)
-- ------------------------------------------------------------
insert into lieux (owner_id, nom, necessite_precision)
select distinct c.owner_id, v.nom, false
from clients c
cross join (values ('À domicile'), ('Arcy-sur-Cure'), ('Massangis')) as v(nom)
where not exists (
  select 1 from lieux l where l.owner_id = c.owner_id and l.nom = v.nom
);

-- ------------------------------------------------------------
-- 3. Conversion des anciennes valeurs enregistrées
-- (les séances / RDV existants stockaient 'domicile' / 'arcy' / 'massangis',
-- on les remplace par le texte complet utilisé désormais)
-- ------------------------------------------------------------
update seances set lieu = 'À domicile'     where lieu = 'domicile';
update seances set lieu = 'Arcy-sur-Cure'  where lieu = 'arcy';
update seances set lieu = 'Massangis'      where lieu = 'massangis';

update rdv set lieu = 'À domicile'     where lieu = 'domicile';
update rdv set lieu = 'Arcy-sur-Cure'  where lieu = 'arcy';
update rdv set lieu = 'Massangis'      where lieu = 'massangis';

-- ------------------------------------------------------------
-- 4. Sexe du chien (mâle / femelle)
-- ------------------------------------------------------------
alter table dogs add column if not exists sexe text;

-- ------------------------------------------------------------
-- Terminé. Dans l'appli, va dans Paramètres pour voir/modifier tes lieux.
-- ------------------------------------------------------------
