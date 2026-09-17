-- ============================================================
-- La Voix Canine — Schéma de base de données
-- À coller dans Supabase : Project > SQL Editor > New query > Run
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- CLIENTS
-- ------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  nom text not null,
  telephone text,
  email text,
  adresse text,

  raison_venue text,
  objectifs text,
  cours_collectifs boolean not null default false,
  whatsapp_inscrit boolean not null default false,

  notes_pratiques text,
  photo_url text
);

-- ------------------------------------------------------------
-- CHIENS
-- ------------------------------------------------------------
create table if not exists dogs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,

  nom text not null,
  race text,
  date_naissance date,
  age_arrivee_famille text,

  type_logement text,        -- 'maison' | 'appartement'
  environnement text,        -- 'campagne' | 'ville'

  sociable_congeneres text,  -- 'sociable' | 'pas_sociabilise' | 'craintif' | 'agressif' | 'ne_sait_pas'
  sociable_congeneres_autre text,

  soucis_comportemental boolean not null default false,
  soucis_congeneres boolean not null default false,
  soucis_humains boolean not null default false,
  soucis_anxieux boolean not null default false,
  soucis_peur boolean not null default false,
  soucis_hyperactif boolean not null default false,
  soucis_autre text,

  bilan_initial text,
  objectifs text,
  photo_url text,

  -- Éducation de base (liste fixe)
  eb_marche_au_pied boolean not null default false,
  eb_changement_direction boolean not null default false,
  eb_pas_bouge boolean not null default false,
  eb_assis boolean not null default false,
  eb_couche boolean not null default false,
  eb_absence boolean not null default false,
  eb_rappel_sans_distraction boolean not null default false,
  eb_rappel_avec_distraction boolean not null default false
);

-- ------------------------------------------------------------
-- SÉANCES
-- ------------------------------------------------------------
create table if not exists seances (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dog_id uuid not null references dogs(id) on delete cascade,

  date_seance date not null default current_date,
  lieu text,                 -- 'domicile' | 'arcy' | 'massangis'
  notes text,
  exercices jsonb not null default '[]'::jsonb  -- [{ "nom": "...", "maitrise": true|false }]
);

-- ------------------------------------------------------------
-- RENDEZ-VOUS
-- ------------------------------------------------------------
create table if not exists rdv (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  dog_id uuid references dogs(id) on delete set null,

  date_rdv date not null,
  heure_rdv time,
  lieu text,                 -- 'domicile' | 'arcy' | 'massangis'
  notes text,
  fait boolean not null default false
);

-- ------------------------------------------------------------
-- FORFAITS / RÈGLEMENTS
-- ------------------------------------------------------------
create table if not exists forfaits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid not null references clients(id) on delete cascade,
  dog_id uuid references dogs(id) on delete set null,

  type text not null default 'forfait',  -- 'forfait' | 'seance'
  nb_seances_total int not null default 10,
  nb_seances_faites int not null default 0,

  montant_total numeric(10,2),
  mode_paiement text not null default '1fois',  -- '1fois' | '2fois'

  montant_paiement_1 numeric(10,2),
  date_paiement_1 date,
  montant_paiement_2 numeric(10,2),
  date_paiement_2 date,

  statut text not null default 'en_attente',  -- 'solde' | 'en_attente'
  actif boolean not null default true
);

-- ------------------------------------------------------------
-- SÉCURITÉ (Row Level Security)
-- Chaque compte ne voit / modifie que ses propres données.
-- ------------------------------------------------------------
alter table clients enable row level security;
alter table dogs enable row level security;
alter table seances enable row level security;
alter table rdv enable row level security;
alter table forfaits enable row level security;

create policy "clients: owner only" on clients
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "dogs: via client owner" on dogs
  for all using (
    exists (select 1 from clients c where c.id = dogs.client_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from clients c where c.id = dogs.client_id and c.owner_id = auth.uid())
  );

create policy "seances: via dog->client owner" on seances
  for all using (
    exists (
      select 1 from dogs d join clients c on c.id = d.client_id
      where d.id = seances.dog_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from dogs d join clients c on c.id = d.client_id
      where d.id = seances.dog_id and c.owner_id = auth.uid()
    )
  );

create policy "rdv: via client owner" on rdv
  for all using (
    exists (select 1 from clients c where c.id = rdv.client_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from clients c where c.id = rdv.client_id and c.owner_id = auth.uid())
  );

create policy "forfaits: via client owner" on forfaits
  for all using (
    exists (select 1 from clients c where c.id = forfaits.client_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from clients c where c.id = forfaits.client_id and c.owner_id = auth.uid())
  );

-- ------------------------------------------------------------
-- INDEX (recherche rapide)
-- ------------------------------------------------------------
create index if not exists idx_clients_owner on clients(owner_id);
create index if not exists idx_dogs_client on dogs(client_id);
create index if not exists idx_seances_dog on seances(dog_id);
create index if not exists idx_rdv_client on rdv(client_id);
create index if not exists idx_forfaits_client on forfaits(client_id);

-- ------------------------------------------------------------
-- STOCKAGE DES PHOTOS
-- À faire une fois dans Supabase : Storage > créer un bucket nommé "photos" (public).
-- Les policies ci-dessous supposent un bucket "photos" déjà créé.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "photos: lecture publique"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "photos: écriture utilisateurs connectés"
  on storage.objects for insert
  with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "photos: suppression utilisateurs connectés"
  on storage.objects for delete
  using (bucket_id = 'photos' and auth.role() = 'authenticated');
