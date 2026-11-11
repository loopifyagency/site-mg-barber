# MG Barber — site vitrine

Barbier à Brest · 21 rue de la Porte, 29200 · 06 15 70 83 50.
Site statique (HTML, CSS, JavaScript) : aucune étape de build, aucune dépendance externe au chargement.

## Lancer en local

```bash
python3 -m http.server 8765
```

Puis ouvrir <http://localhost:8765/>.

## Structure

```
index.html              contenu, SEO, données structurées (BarberShop)
assets/css/style.css    design system (variables en tête de fichier)
assets/js/main.js       animations, horloge de Paris, créneau, carrousel
assets/vendor/          GSAP 3.15 + ScrollTrigger, Lenis 1.3 (auto-hébergés)
assets/fonts/           Big Shoulders Display, Hanken Grotesk (auto-hébergées)
assets/img/             photos du salon, textures (lattes, grain), favicon
PRODUCT.md, DESIGN.md   contexte produit et système visuel
```

## À remplacer / compléter avant la mise en ligne

- **Photos** : les 5 photos fournies font environ 200 × 325–400 px. Elles sont agrandies à l'identique mais restent douces. Remplacer par les originaux (idéalement ≥ 1600 px de large) en gardant les mêmes noms de fichiers dans `assets/img/`.
- **Tarifs** : aucun tarif officiel n'a été fourni, donc aucun n'est affiché. Un emplacement est prévu en commentaire dans la section « Prestations » (`index.html`).
- **Réservation en ligne** : le rendez-vous passe par le téléphone (`tel:+33615708350`). Si un lien de réservation existe, remplacer les boutons « Prendre rendez-vous ».
- **Réseaux sociaux** : aucun compte fourni, aucun lien inventé. À ajouter dans le pied de page.
- **Chiffres** : « 2 barbiers » est déduit d'un avis client (« le patron et l'employé ») ; 5 jours × 10 h = 50 h découle des horaires. À confirmer.
- **Horaires** : lundi et dimanche fermés, mardi–samedi 9 h – 19 h (lecture du format Google Maps du brief). Ils sont répétés dans `index.html` (tableau, données structurées) et dans `assets/js/main.js` (constantes `OPEN`, `CLOSE`, `OPEN_DAYS`).
- **Adresse web** : une fois le domaine connu, ajouter `<link rel="canonical">` et une image `og:image` en URL absolue.

## Mise en ligne

Publier uniquement `index.html` et le dossier `assets/`. Les autres fichiers du dépôt (`PRODUCT.md`, `DESIGN.md`, `.claude/`, `.impeccable/`, `skills-lock.json`) sont des outils de travail et n'ont pas à être servis.

## Accessibilité et performance

- Contrastes AA, navigation au clavier, lien d'évitement, alternatives textuelles sur toutes les images.
- `prefers-reduced-motion` : pas de chargeur, de défilement doux, d'épinglage ni d'animation ; le contenu est entièrement visible.
- Sans JavaScript, le site reste lisible (tous les états masqués sont posés par le script).
- Les animations ne touchent que `transform` et `opacity` (plus quelques masques de rideau).
- Environ 260 Ko de photos et 190 Ko de textures, 105 Ko de polices, 170 Ko de scripts, 40 Ko de CSS.
