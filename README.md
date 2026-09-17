# La Voix Canine — App de gestion des clients

Application pour gérer tes clients, leurs chiens, les séances, les rendez-vous et les règlements.
Fonctionne sur téléphone (installable comme une app) et sur PC (même lien, mêmes données).

Ce guide t'accompagne étape par étape pour la mettre en ligne. **Fais une étape à la fois**, dans l'ordre. Reviens vers Claude dans le projet "La Voix Canine" si un point bloque.

---

## Vue d'ensemble : 3 comptes gratuits, à ton nom

| Compte | À quoi il sert |
|---|---|
| **Supabase** | Stocke toutes tes données (clients, chiens, séances...) et les photos, hébergé en Europe |
| **GitHub** | Garde une copie du code de l'application, avec l'historique des versions |
| **Vercel** | Héberge l'application elle-même — c'est le lien que tu ouvres sur ton téléphone |

Aucun de ces comptes n'appartient à Claude ou à Anthropic : ils sont tous à ton nom, et l'application continuera de fonctionner même sans Claude.

---

## ÉTAPE 1 — Créer le compte Supabase (la base de données)

1. Va sur **supabase.com** et crée un compte (avec ton email).
2. Une fois connecté, clique sur **"New project"**.
3. Choisis un nom (ex. `voix-canine`), un mot de passe pour la base de données (note-le de côté, tu n'en auras plus besoin après), et surtout : **Region = Europe (Frankfurt / eu-central-1)**.
4. Attends 1 à 2 minutes que le projet soit prêt.
5. Dans le menu de gauche, va dans **SQL Editor**, clique sur **"New query"**.
6. Ouvre le fichier `supabase/schema.sql` (fourni avec le code de l'application), copie tout son contenu, colle-le dans l'éditeur, puis clique sur **"Run"**.
   → Ça crée toutes les tables (clients, chiens, séances...) et le stockage des photos, automatiquement.
7. Toujours dans Supabase, va dans **Authentication > Users**, clique sur **"Add user"**, et crée ton propre accès à l'application : ton email + un mot de passe de ton choix. C'est ce couple email/mot de passe que tu utiliseras pour te connecter à l'app (pas besoin de "confirmer" par mail, coche "Auto Confirm User" si l'option apparaît).
8. Va dans **Project Settings > API**. Note quelque part (ou garde cette page ouverte) deux valeurs :
   - **Project URL** (commence par `https://...supabase.co`)
   - **anon public key** (une longue chaîne de caractères)

   Ces deux valeurs serviront à l'étape 3.

**Une fois cette étape faite, dis-le à Claude dans cette conversation pour passer à l'étape 2.**

---

## ÉTAPE 2 — Créer le compte GitHub (stockage du code)

1. Va sur **github.com** et crée un compte.
2. Clique sur **"New repository"**. Nom : `voix-canine-app`. Laisse-le en **Private**. Ne coche aucune case supplémentaire (pas de README, pas de .gitignore — ils sont déjà dans le code fourni).
3. Sur la page qui s'affiche, clique sur **"uploading an existing file"**.
4. Glisse-dépose tous les fichiers et dossiers du code fourni par Claude (sauf le dossier `node_modules` et `dist` s'ils apparaissent — ils ne doivent pas être envoyés).
5. Clique sur **"Commit changes"**.

**Dis-le à Claude une fois fait, pour passer à l'étape 3.**

---

## ÉTAPE 3 — Créer le compte Vercel (mise en ligne)

1. Va sur **vercel.com** et crée un compte **en te connectant avec ton compte GitHub** (bouton "Continue with GitHub") — ça simplifie tout.
2. Clique sur **"Add New" > "Project"**.
3. Choisis le repository `voix-canine-app` que tu as créé à l'étape 2, clique sur **"Import"**.
4. Avant de cliquer sur "Deploy", ouvre la section **"Environment Variables"** et ajoute les 2 valeurs notées à l'étape 1 :
   - `VITE_SUPABASE_URL` → ta Project URL
   - `VITE_SUPABASE_ANON_KEY` → ta anon public key
5. Clique sur **"Deploy"**. Après 1 à 2 minutes, Vercel te donne un lien (ex. `voix-canine-app.vercel.app`) — c'est le lien de ton application.

**Dis-le à Claude une fois fait.**

---

## ÉTAPE 4 — Installer l'app sur ton téléphone

1. Ouvre le lien Vercel sur ton téléphone (Chrome ou Samsung Internet).
2. Connecte-toi avec l'email et le mot de passe créés à l'étape 1.
3. Ouvre le menu du navigateur (⋮ en haut à droite) et choisis **"Ajouter à l'écran d'accueil"**.
4. Une icône apparaît sur ton téléphone — elle s'ouvre en plein écran comme une vraie application.

---

## Pour les futures modifications

Quand tu veux un changement (nouveau champ, correction, nouvelle fonctionnalité) :
1. Ouvre une conversation avec Claude dans le projet **"La Voix Canine"**.
2. Explique ce que tu veux.
3. Claude modifie le code et te donne une étape simple (remplacer un fichier sur GitHub, via le site, sans ligne de commande) — l'application se met à jour toute seule sur Vercel en 1-2 minutes.

## En cas de souci

- **Page blanche ou erreur au chargement** : vérifie que les 2 valeurs dans Vercel (Environment Variables) sont bien copiées sans espace en trop, puis redéploie (Vercel > ton projet > Deployments > ⋮ > Redeploy).
- **Impossible de se connecter** : vérifie l'email/mot de passe créés à l'étape 1 (Supabase > Authentication > Users).
- **Les photos ne s'affichent pas** : vérifie que le script `schema.sql` a bien été exécuté en entier (étape 1, point 6) — il crée le stockage des photos.
