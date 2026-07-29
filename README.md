# Atlas AQI — Dashboard React

Application web affichant en direct la qualité de l'air (AQI) de 5 villes, connectée à l'entrepôt Supabase du pipeline AQI.

## Fonctionnalités

- Carte du monde avec une "tache" colorée par ville, indiquant le niveau d'AQI moyen du jour sélectionné
- Sélecteur de date (par défaut : aujourd'hui)
- Sélecteur de ville (ou "Toutes les villes")
- Tableau détaillé des mesures heure par heure : AQI + tous les polluants (PM2.5, PM10, O₃, NO₂, SO₂, CO)
- Connexion directe et en lecture seule à Supabase via l'API publique (`anon key`)

## Installation

### 1. Prérequis

- [Node.js](https://nodejs.org/) version 18 ou plus récente installé sur ta machine

### 2. Installer les dépendances

Ouvre un terminal dans ce dossier, puis :

```bash
npm install
```

### 3. Configurer la connexion à Supabase

Copie le fichier d'exemple :

```bash
cp .env.example .env
```

Ouvre `.env` et renseigne tes deux valeurs, trouvables dans ton projet Supabase sous **Settings → API** :

```
VITE_SUPABASE_URL=https://TON_PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=ta_cle_anon_public
```

⚠️ Utilise bien la clé **`anon` `public`**, jamais la `service_role` (celle-ci est secrète et permet d'écrire/modifier — ne la mets jamais dans une app front-end).

### 4. Lancer en développement

```bash
npm run dev
```

Le site s'ouvre sur `http://localhost:5173`.

### 5. Build de production (optionnel)

```bash
npm run build
```

Génère un dossier `dist/` déployable sur n'importe quel hébergeur statique (Vercel, Netlify, GitHub Pages, etc.).

## Structure du projet

```
aqi-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx              # point d'entrée React
    ├── App.jsx                # composant principal, logique de données
    ├── App.css                # styles
    ├── index.css              # reset global
    ├── supabaseClient.js      # connexion Supabase
    ├── aqiScale.js             # échelle de couleurs AQI + projection carte
    └── components/
        ├── WorldMap.jsx        # carte avec taches colorées
        ├── CitySelector.jsx    # sélecteur de ville
        ├── DateSelector.jsx    # sélecteur de date
        └── DataTable.jsx       # tableau des mesures
```

## Prérequis côté base de données

Ce projet lit directement les tables `dim_ville`, `dim_temps`, `fact_aqi` du schéma `public` via l'API REST automatique de Supabase (PostgREST). Assure-toi que :

- Row Level Security (RLS) est soit désactivé sur ces tables, soit configuré pour autoriser la lecture (`SELECT`) avec la clé `anon`.
- Les relations entre `fact_aqi.ville_id` → `dim_ville.ville_id` et `fact_aqi.temps_id` → `dim_temps.temps_id` existent (clés étrangères), pour que les requêtes avec jointures imbriquées fonctionnent.

## Notes techniques

- Aucune donnée sensible n'est exposée : seule la clé `anon` (publique, en lecture) est utilisée côté client.
- La carte utilise une projection équirectangulaire simple (pas de librairie cartographique lourde) pour rester légère.
- Le site est responsive (mobile inclus) et respecte `prefers-reduced-motion`.
