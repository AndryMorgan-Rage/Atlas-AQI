# Déploiement

Le dashboard est déployé sur Vercel :

**Lien du déploiement :** https://aqi-dashboard-psi.vercel.app

## Informations

- **Plateforme :** Vercel (intégration Git : https://github.com/AndryMorgan-Rage/Atlas-AQI)
- **Projet :** `andrymorgan-rages-projects/aqi-dashboard`
- **Variables d'environnement (déploiement) :**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- **Build :** `npm run build` (Vite, output `dist/`)

## Re-déployer manuellement

```bash
vercel --prod
```
