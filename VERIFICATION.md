# Checklist de vérification finale — anthonyrusso.fr

## ✅ Liens de conversion intégrés

**Calendly principal :** `https://calendly.com/anthony-russo-digital/30min`
- [x] Nav desktop CTA
- [x] Nav mobile CTA
- [x] Widget sidebar desktop
- [x] Widget mobile bottom
- [x] Homepage hero CTA
- [x] Homepage CTA final
- [x] /netlinking-sur-mesure hero + CTA final
- [x] /audit-netlinking hero + CTA final
- [x] /mon-reseau CTA final
- [x] /resultats CTA final
- [x] /blog articles CTA
- [x] Footer contact

**Réseaux sociaux :**
- [x] LinkedIn : `https://www.linkedin.com/in/anthony-russo/`
- [x] X/Twitter : `https://x.com/antho_russo`
- [x] Footer avec liens sociaux

---

## ✅ Layout & Responsive

**Points vérifiés :**
- [x] Grid desktop : `minmax(0, 1fr) 300px` — propre et robuste
- [x] Sidebar sticky à `top: 6rem`
- [x] Breakpoint 1024px cohérent sur toutes les pages
- [x] Mobile bottom CTA non intrusif (56px min-height)
- [x] Pas de débordement horizontal
- [x] Container max-width cohérent (`--max-width-2xl`)

**Points à tester manuellement :**
- [ ] Desktop large (1920px)
- [ ] Laptop (1440px, 1280px)
- [ ] Tablette (768px, 1024px)
- [ ] Mobile (375px, 390px, 414px)

---

## ✅ UI Consistency

**Vérifications effectuées :**
- [x] Bouton primaire : `background: var(--color-primary-cta)` + glow
- [x] Bouton secondaire : `background: var(--color-surface-2)` + border
- [x] Rayons cohérents : `var(--radius-md)` pour boutons
- [x] Espacements : `var(--space-*)` utilisé partout
- [x] Pas d'écart visuel dark/light mode

---

## ✅ Wording & Contenu

**Suppressions effectuées :**
- [x] "Audit gratuit" → "Audit netlinking"
- [x] "Prendre un audit gratuit" → "Réserver un audit netlinking"
- [x] Toutes mentions "gratuit", "offert", "sans engagement" supprimées

**Ton appliqué :**
- [x] Premium, direct, crédible
- [x] Phrases concrètes (ex: "Je sélectionne les sites, les ancres...")
- [x] Pas de jargon SEO inutile
- [x] Pas de slogans creux

**Contenu homepage :**
- [x] Hero clair et transactionnel
- [x] Section "Pour qui" (3 profils)
- [x] Section avantages (6 points)
- [x] Section régie directe
- [x] Section processus (4 étapes)
- [x] Section résultats
- [x] CTA final

---

## ✅ SEO on-page

**Vérifications par page :**

| Page | H1 unique | H2 cohérents | Meta title | Meta description |
|------|-----------|--------------|------------|------------------|
| / | ✅ | ✅ | ✅ | ✅ |
| /netlinking-sur-mesure | ✅ | ✅ | ✅ | ✅ |
| /audit-netlinking | ✅ | ✅ | ✅ | ✅ |
| /mon-reseau | ✅ | ✅ | ✅ | ✅ |
| /resultats | ✅ | ✅ | ✅ | ✅ |

**Schema.org :**
- [x] Person (homepage)
- [x] Service (pages prestations)
- [x] BlogPosting (articles blog)

**Maillage interne :**
- [x] Nav principale vers toutes les pages
- [x] Footer vers toutes les pages
- [x] CTA homepage vers /netlinking-sur-mesure, /mon-reseau, /resultats
- [x] CTA secondaires cohérents

---

## ✅ Accessibilité & Robustesse

**Points vérifiés :**
- [x] `focus-visible` avec outline primary
- [x] Liens externes avec `target="_blank" rel="noopener noreferrer"`
- [x] Labels ARIA corrects sur widgets
- [x] Contraste suffisant (dark et light)
- [x] Pas de hover-only sur mobile
- [x] `scrollbar-gutter: stable` pour éviter décalage theme toggle

---

## ✅ Widget Calendly simplifié

**Version finale :**
- [x] Un seul CTA principal : "Réserver un rendez-vous"
- [x] Texte explicatif : "30 min pour faire le point..."
- [x] Desktop : sidebar sticky propre
- [x] Mobile : bouton fixe bottom discret

**Supprimé :**
- [x] Choix multiple "audit / accompagnement"
- [x] Bottom sheet mobile complexe
- [x] Badges multiples

---

## ⚠️ Points à arbitrer / compléter manuellement

1. **Page /resultats** : KPIs placeholder à remplacer par vrais chiffres
2. **Études de cas /resultats** : Remplacer par vraies données clients (anonymisées si besoin)
3. **Témoignages** : Vérifier que les testimonials sont authentiques
4. **Mentions légales** : Compléter hébergeur
5. **OG images** : Créer images Open Graph pour chaque page
6. **Favicons** : Générer 16x16, 32x32, apple-touch-icon à partir du favicon.svg

---

## 🚀 Déploiement

**Build :**
```bash
npm run build
# → 7 pages générées (sans blog WordPress)
```

**Zip de déploiement :**
```bash
cd dist && zip -r ../anthonyrusso-fr.zip .
```

**WordPress à configurer :**
- URL API : `https://wp.anthonyrusso.fr/wp-json/wp/v2`
- Redirect .htaccess : `wp.anthonyrusso.fr` → `anthonyrusso.fr`
- robots.txt WP : `Disallow: /`
