# 🏠 Dar-Connect — Extranet de Gestion Immobilière

> Application web permettant aux locataires de consulter des biens immobiliers, de réserver des visites et de téléverser leurs pièces d'identité — le tout dans un environnement sécurisé, isolé par utilisateur, et déployé en continu sur Vercel.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=flat&logo=tailwindcss)](https://tailwindcss.com)

---

## 📑 Table des matières

1. [Description du projet](#1-description-du-projet)
2. [Correspondance thématique](#2-correspondance-thématique)
3. [Architecture de la base de données](#3-architecture-de-la-base-de-données)
4. [Sécurité — Row Level Security](#4-sécurité--row-level-security)
5. [Pages et routes de l'application](#5-pages-et-routes-de-lapplication)
6. [Fonctionnalités et parcours utilisateur](#6-fonctionnalités-et-parcours-utilisateur)
7. [Stack technique](#7-stack-technique)
8. [Structure du projet](#8-structure-du-projet)
9. [Installation et lancement local](#9-installation-et-lancement-local)
10. [Déploiement et CI/CD](#10-déploiement-et-cicd)
11. [Analyse architecturale](#11-analyse-architecturale)
12. [Compte de test](#12-compte-de-test)

---

## 1. Description du projet

**Dar-Connect** est un extranet immobilier développé avec **React (Vite)** en frontend et **Supabase** comme backend complet — authentification, base de données PostgreSQL, et stockage de fichiers. Aucun serveur backend supplémentaire n'est nécessaire : Supabase joue le rôle de **BaaS (Backend as a Service)** et expose toutes les fonctionnalités directement via son SDK JavaScript.

L'application s'adresse à deux profils d'utilisateurs :

- **Les locataires** : s'inscrire, consulter les biens, sauvegarder des favoris, réserver des visites avec téléversement de pièce d'identité, suivre leurs demandes depuis un tableau de bord personnel.
- **Les propriétaires** : publier leurs propres annonces via un wizard 4 étapes avec upload de photo, gérer leurs biens depuis la page d'accueil.

Le projet est déployé sur **Vercel** avec un pipeline CI/CD automatisé via GitHub.

---

## 2. Correspondance thématique

| Rôle | Entité Supabase | Description |
|------|-----------------|-------------|
| **Table A — Utilisateurs** | `auth.users` | Locataires et propriétaires. Authentification complète (JWT, sessions, email/password) gérée nativement par Supabase Auth. Métadonnées étendues : `full_name`, `phone`, `avatar_url`. |
| **Table B — Ressources** | `public.houses` | Biens immobiliers disponibles à la location : titre, prix, localisation, type, surface, pièces, étage, adresse, description, équipements, photo, référence propriétaire (`owner_id`). |
| **Table C — Interactions** | `public.visits` | Demandes de visite entre un locataire (Table A) et un bien (Table B). Contient la date souhaitée, le statut (`pending` / `approved` / `rejected`) et l'URL du document d'identité téléversé. |
| **Storage** | Bucket `documents` | Stockage des scans de pièces d'identité (lors d'une réservation), des photos de biens (publication d'annonce) et des avatars (page profil). Fichiers nommés avec l'UUID utilisateur pour garantir l'isolation. |

---

## 3. Architecture de la base de données

### Table `houses` (Table B — Ressources)

```sql
create table public.houses (
  id          uuid        default gen_random_uuid() primary key,
  owner_id    uuid        references auth.users(id),
  title       text        not null,
  price       numeric     not null,
  location    text        not null,
  image_url   text,
  type        text        default 'Apartment'
                          check (type in ('Apartment','Villa','Studio',
                                          'House','Farm','Commercial','Land')),
  surface     numeric,
  rooms       integer,
  floor       text,
  address     text,
  description text,
  amenities   text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

### Table `visits` (Table C — Interactions)

```sql
create table public.visits (
  id           uuid        default gen_random_uuid() primary key,
  user_id      uuid        not null references auth.users(id),
  house_id     uuid        not null references public.houses(id),
  date         date        not null,
  status       text        default 'pending'
                           check (status in ('pending','approved','rejected')),
  id_scan_url  text,
  created_at   timestamptz default now()
);
```

### Migration — colonnes additionnelles

```sql
alter table public.houses
  add column if not exists owner_id    uuid references auth.users(id),
  add column if not exists type        text default 'Apartment',
  add column if not exists surface     numeric,
  add column if not exists rooms       integer,
  add column if not exists floor       text,
  add column if not exists address     text,
  add column if not exists description text,
  add column if not exists amenities   text,
  add column if not exists updated_at  timestamptz default now();
```

### Données de démonstration (seed)

```sql
insert into public.houses (title, price, location, image_url) values
  ('Modern Villa in Hydra',    85000,  'Hydra, Alger',
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'),
  ('Luxury Apartment',         55000,  'Ben Aknoun, Alger',
   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'),
  ('Family Home with Garden',  70000,  'Draria, Alger',
   'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'),
  ('Studio in City Center',    30000,  'Sidi M''Hamed, Alger',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'),
  ('Penthouse with Sea View',  120000, 'Bab El Oued, Alger',
   'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'),
  ('Traditional Riad',         65000,  'Casbah, Alger',
   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80');
```

### Diagramme des relations

```
auth.users  (Table A)
    │
    ├──────< houses  (Table B)    owner_id → auth.users.id
    │
    └──────< visits  (Table C)    user_id  → auth.users.id
                 │
                 └──────> houses            house_id → houses.id

storage.objects  (Bucket: documents)
    ├── listings/{user_id}/{timestamp}.jpg     ← photos de biens
    ├── {user_id}/{house_id}_{timestamp}.pdf   ← scans pièces d'identité
    └── avatars/{user_id}.jpg                  ← avatars profil
```

**Clés primaires :** UUID auto-générés (`gen_random_uuid()`).
**Clés étrangères :** intégrité référentielle garantie par PostgreSQL.

---

## 4. Sécurité — Row Level Security

La **Row Level Security (RLS)** est une fonctionnalité native de PostgreSQL. Elle permet de définir, **au niveau de la base de données**, quelles lignes chaque utilisateur peut lire ou modifier — indépendamment du code frontend.

> Même si le code client était compromis, un utilisateur ne pourrait **jamais** accéder aux données d'un autre. La sécurité est ancrée dans la couche données, pas dans l'application.

### Politiques — Table `houses`

```sql
alter table public.houses enable row level security;

-- Tout utilisateur peut consulter les biens (catalogue public)
create policy "Lecture publique des biens"
  on public.houses for select using (true);

-- Seul le propriétaire peut publier un bien en son nom
create policy "Insertion par le propriétaire"
  on public.houses for insert
  with check (auth.uid() = owner_id);

-- Seul le propriétaire peut modifier son propre bien
create policy "Mise à jour par le propriétaire"
  on public.houses for update
  using (auth.uid() = owner_id);

-- Seul le propriétaire peut supprimer son bien
create policy "Suppression par le propriétaire"
  on public.houses for delete
  using (auth.uid() = owner_id);
```

### Politiques — Table `visits`

```sql
alter table public.visits enable row level security;

-- Un locataire ne voit que SES propres demandes de visite
create policy "Lecture des visites personnelles"
  on public.visits for select
  using (auth.uid() = user_id);

-- Un locataire ne peut créer une visite qu'en son propre nom
create policy "Création de visite en son nom"
  on public.visits for insert
  with check (auth.uid() = user_id);
```

### Politiques — Storage (bucket `documents`)

```sql
-- Seuls les utilisateurs authentifiés peuvent uploader
create policy "Upload autorisé pour les authentifiés"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');

-- Lecture publique (URLs signées)
create policy "Lecture publique des documents"
  on storage.objects for select
  using (bucket_id = 'documents');
```

### Isolation des données en pratique

```js
// Dashboard — le frontend envoie cette requête
supabase.from('visits').select('*').eq('user_id', session.user.id)
```

Même sans le filtre `.eq()`, la politique RLS `auth.uid() = user_id` garantit que PostgreSQL ne retourne **que** les lignes de l'utilisateur connecté. **L'isolation est assurée côté base de données, pas uniquement côté client.**

---

## 5. Pages et routes de l'application

| Route | Fichier | Accès | Description |
|-------|---------|-------|-------------|
| `/` | `Landing.jsx` | Public | Page marketing : hero, stats, features, how-it-works, CTA |
| `/login` | `Login.jsx` | Public | Inscription et connexion (Supabase Auth) |
| `/home` | `Home.jsx` | 🔒 Protégé | Tableau de bord : stats, visites récentes, nouvelles annonces, mes biens |
| `/houses` | `Houses.jsx` | 🔒 Protégé | Catalogue avec recherche temps réel |
| `/houses/:id` | `HouseDetail.jsx` | 🔒 Protégé | Détail d'un bien + modal de réservation |
| `/favorites` | `Favorites.jsx` | 🔒 Protégé | Biens sauvegardés (localStorage) |
| `/dashboard` | `Dashboard.jsx` | 🔒 Protégé | Toutes les demandes de visite avec statut |
| `/profile` | `Profile.jsx` | 🔒 Protégé | Modification du profil, avatar, mot de passe |
| `/list-property` | `ListProperty.jsx` | 🔒 Protégé | Wizard 4 étapes pour publier un bien |
| `*` | `NotFound.jsx` | Public | Page 404 personnalisée |

### Protection des routes

```jsx
// App.jsx
function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return children
}
```

Toute route protégée redirige automatiquement vers `/login` si l'utilisateur n'est pas authentifié. Après connexion, il est redirigé vers `/home`.

---

## 6. Fonctionnalités et parcours utilisateur

```
[/]  Landing Page — publique
      │
      ▼
[/login]  Inscription / Connexion
  ├── Sign up : email + password → Supabase Auth
  └── Sign in : JWT stocké en session navigateur
      │
      ▼
[/home]  Tableau de bord personnel
  ├── Salutation contextuelle (matin / après-midi / soir)
  ├── Statistiques : total visites / en attente / approuvées
  ├── Raccourcis : Houses · Saved · List Property · Dashboard
  ├── Visites récentes (4 dernières avec badge statut coloré)
  ├── Nouvelles annonces (4 dernières publiées)
  ├── Mes biens publiés (avec CTA si aucun)
  └── Bandeau "Publiez votre bien"
      │
      ├─────────────────────────────────────────┐
      ▼                                         ▼
[/houses]  Catalogue                [/list-property]  Wizard 4 étapes
  ├── Grille responsive               ├── Étape 1 : Titre, type, prix,
  ├── Recherche temps réel            │            wilaya (48), ville, adresse
  │   (titre + localisation)          ├── Étape 2 : Surface, pièces, étage,
  ├── ❤️ Favori (localStorage)        │            description, 6 équipements
  ├── Bouton "Details"                ├── Étape 3 : Photo drag & drop
  └── Bouton "Book" → modal           │            → Supabase Storage
                                      └── Étape 4 : Récapitulatif + Publier
      │                                            → insert dans `houses`
      ▼
[/houses/:id]  Détail d'un bien
  ├── Image hero + breadcrumb
  ├── Description, 6 détails, équipements
  ├── Sidebar sticky : prix, dépôt, disponibilité
  └── Modal de réservation
        ├── Sélecteur de date (min: aujourd'hui)
        ├── Upload pièce d'identité (PNG/JPG/PDF)
        │   → Supabase Storage (bucket: documents)
        └── insert dans `visits` (status: pending)
      │
      ▼
[/dashboard]  Mes demandes de visite
  ├── Compteurs : Total · Pending · Approved
  └── Liste complète avec :
        ├── Photo + titre + localisation du bien
        ├── Date de visite souhaitée
        ├── Prix mensuel
        ├── Lien vers le scan d'identité téléversé
        └── Badge statut : ⏳ pending · ✅ approved · ❌ rejected

[/favorites]  Biens sauvegardés
  ├── Lu depuis localStorage (persiste entre sessions)
  ├── Cards identiques au catalogue
  └── ❤️ Retirer un favori en un clic

[/profile]  Gestion du compte
  ├── Avatar upload → Supabase Storage (dossier avatars/)
  ├── Modifier : nom complet, téléphone
  ├── Email affiché en lecture seule
  ├── Changement de mot de passe avec confirmation
  └── Infos compte : ID, date d'inscription, statut, email vérifié

[Navbar — visible sur toutes les pages authentifiées]
  ├── Logo DarConnect → /home
  ├── Liens : Home · Houses · Saved (badge) · Dashboard · + List Property
  ├── Avatar + prénom → /profile
  ├── Bouton Logout (icône)
  └── Menu hamburger responsive (mobile)
```

---

## 7. Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Frontend** | React 18 + Vite | Interface utilisateur, routing SPA |
| **Styling** | Tailwind CSS 3 | Design system, dark theme, responsive |
| **Routing** | React Router DOM 6 | Navigation, routes protégées |
| **Backend (BaaS)** | Supabase | Auth + PostgreSQL + Storage — tout-en-un |
| **Auth** | Supabase Auth (JWT) | Inscription, connexion, sessions |
| **Base de données** | PostgreSQL via Supabase | Tables `houses`, `visits`, RLS |
| **Storage** | Supabase Storage | Photos biens, scans ID, avatars |
| **Déploiement** | Vercel | Hosting frontend, CDN mondial, CI/CD |
| **Versionning** | Git + GitHub | Code source, pipeline automatisé |

> **Supabase est le backend.** Il n'y a pas de serveur Node.js ou Express séparé dans ce projet — Supabase expose directement l'authentification, la base de données et le stockage via son SDK JavaScript (`@supabase/supabase-js`).

---

## 8. Structure du projet

```
dar-connect/
├── index.html
├── package.json                  ← React, Vite, Tailwind, Supabase JS
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                          ← VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── .env.example
├── .gitignore
│
└── src/
    ├── main.jsx                  ← Point d'entrée React
    ├── App.jsx                   ← Router + auth state + ProtectedRoute
    ├── App.css                   ← Styles globaux
    ├── supabaseClient.js         ← Instance Supabase (clé anon)
    │
    ├── pages/
    │   ├── Landing.jsx           ← Page marketing publique
    │   ├── Login.jsx             ← Inscription / Connexion
    │   ├── Home.jsx              ← Tableau de bord post-login
    │   ├── Houses.jsx            ← Catalogue de biens
    │   ├── HouseDetail.jsx       ← Détail + réservation de visite
    │   ├── Favorites.jsx         ← Biens sauvegardés (localStorage)
    │   ├── Dashboard.jsx         ← Mes demandes de visite
    │   ├── ListProperty.jsx      ← Wizard publication d'annonce
    │   ├── Profile.jsx           ← Gestion du compte utilisateur
    │   └── NotFound.jsx          ← Page 404
    │
    ├── components/
    │   ├── Navbar.jsx            ← Navigation desktop + hamburger mobile
    │   └── HouseCard.jsx         ← Carte de bien (favori + book + détails)
    │
    └── assets/                   ← Ressources statiques
```

---

## 9. Installation et lancement local

### Prérequis

- Node.js ≥ 18
- Un projet Supabase créé sur [supabase.com](https://supabase.com)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/Rania1411/dar-connect.git
cd dar-connect

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
```

Remplir le fichier `.env` :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

> Valeurs disponibles dans Supabase → **Settings** → **API**

```bash
# 4. Lancer le serveur de développement
npm run dev
# → http://localhost:5173
```

### Base de données Supabase (dans l'ordre)

Exécuter dans **Supabase → SQL Editor** :

1. Créer la table `houses` (script section 3)
2. Créer la table `visits` (script section 3)
3. Créer le bucket `documents` (public)
4. Appliquer toutes les politiques RLS (scripts section 4)
5. Insérer les données de démonstration — seed (script section 3)

---

## 10. Déploiement et CI/CD

### Pipeline GitHub → Vercel

```
Développeur
    │
    │  git push origin main
    ▼
GitHub Repository  (github.com/Rania1411/dar-connect)
    │
    │  Webhook automatique (Vercel GitHub App)
    ▼
Vercel Build Pipeline
    ├── npm install
    ├── npm run build   →   Vite compile vers dist/
    └── Déploiement atomique sur CDN mondial Vercel
    │
    ▼
Production  →  https://dar-connect.vercel.app
```

### Configuration Vercel

| Paramètre | Valeur |
|-----------|--------|
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Variable d'env. 1 | `VITE_SUPABASE_URL` |
| Variable d'env. 2 | `VITE_SUPABASE_ANON_KEY` |

### Avantages du CI/CD

- **Déploiement continu** : chaque `push` sur `main` déclenche automatiquement un build et un déploiement, sans intervention manuelle.
- **Preview deployments** : chaque Pull Request génère un environnement de prévisualisation isolé avec URL unique.
- **Rollback instantané** : retour à n'importe quelle version précédente en un clic depuis le dashboard Vercel.
- **Zéro downtime** : déploiement atomique — l'ancienne version reste active jusqu'à ce que la nouvelle soit entièrement prête.

---

## 11. Analyse architecturale

### 11.1 OPEX vs CAPEX

L'architecture Dar-Connect repose exclusivement sur des services **cloud managés** (Supabase + Vercel), ce qui implique un modèle de coût **OPEX (dépenses opérationnelles)** plutôt que **CAPEX (dépenses en capital)**.

Avec une infrastructure physique traditionnelle, il faudrait acheter des serveurs, les héberger dans un datacenter, les administrer et les mettre à jour — représentant un investissement initial lourd (CAPEX). Avec Supabase et Vercel, on paie uniquement ce qu'on consomme, sans actif physique à amortir.

| Critère | Infrastructure physique (CAPEX) | Supabase + Vercel (OPEX) |
|---------|---------------------------------|--------------------------|
| Coût initial | Élevé (serveurs, licences) | Nul (freemium disponible) |
| Maintenance | Équipe technique dédiée | Assurée par le fournisseur |
| Mise à l'échelle | Manuelle, lente, coûteuse | Automatique, immédiate |
| Disponibilité | Dépend de l'infra interne | SLA 99.9 % garantis |
| Déploiement | Jours / semaines | Secondes (CI/CD automatisé) |
| Base de données | Administration DBA requise | PostgreSQL managé (Supabase) |

Pour un projet universitaire ou une jeune startup, le modèle OPEX permet de lancer immédiatement sans investissement initial, et de ne payer davantage que si l'application croît réellement.

### 11.2 Scalabilité — Cloud vs Datacenter

**Supabase** s'appuie sur AWS avec une architecture **serverless** pour l'authentification et le stockage. La base de données PostgreSQL est managée avec mise à l'échelle automatique selon la charge. **Vercel** distribue le frontend sur un **CDN mondial** avec des points de présence sur tous les continents.

En cas de montée en charge (ex : 10 000 locataires consultent le catalogue simultanément), Vercel scale horizontalement de manière transparente, sans configuration manuelle. Dans un datacenter classique, cela nécessiterait un provisioning de serveurs supplémentaires, un load balancer, et une fenêtre de maintenance planifiée.

Pour Dar-Connect, cela signifie qu'un pic de trafic — par exemple, la publication virale d'une annonce — n'impacte pas la disponibilité de l'application.

### 11.3 Données structurées vs non structurées

Dar-Connect exploite intentionnellement les deux types de données :

**Données structurées** — PostgreSQL (Supabase) :
- Table `houses` : titre, prix, localisation, surface, nombre de pièces → données typées, indexables, interrogeables en SQL avec filtres, tris et pagination.
- Table `visits` : date, statut, clés étrangères → relations strictement définies avec contraintes d'intégrité et politiques RLS.

**Données non structurées** — Supabase Storage (bucket `documents`) :
- **Photos de biens** (`.jpg`, `.png`) : fichiers binaires sans schéma fixe, taille variable.
- **Scans de pièces d'identité** (`.jpg`, `.pdf`) : documents liés aux visites via URL publique, non analysables par SQL.
- **Avatars utilisateurs** (`.jpg`) : images de profil référencées dans les métadonnées Supabase Auth.

La séparation est intentionnelle : PostgreSQL garantit l'intégrité et la performance des requêtes métier, tandis que le Storage gère efficacement les fichiers binaires.

---

## 12. Compte de test

Pour évaluer l'application sans créer de compte :

| Champ | Valeur |
|-------|--------|
| **Email** | `testdarconnect@gmail.com` |
| **Mot de passe** | `testdarconnect2cp8` |
| **Rôle** | Locataire + propriétaire (accès complet) |
| **URL** | https://dar-connect.vercel.app |

> Ce compte permet de tester toutes les fonctionnalités : consultation du catalogue, réservation de visite, tableau de bord, favoris, publication d'annonce et gestion du profil.

---

<div align="center">

**Dar-Connect** — Projet universitaire 2025

Développé avec React · Supabase · Tailwind CSS · Vercel

</div>
