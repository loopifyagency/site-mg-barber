---
name: MG Barber — le carnet de rendez-vous
description: Le site est la feuille du jour d'un salon de coiffure homme à Brest, 9 h → 19 h, en ébène, beige bois et cuivre.
colors:
  ebene: "#0E0B09"
  brou: "#1B1511"
  beige-bois: "#D4B58A"
  lin: "#F0E4CE"
  chene: "#A9814F"
  cuivre: "#C8805A"
  cuivre-fonce: "#6B3419"
  pierre: "#9C8D7A"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(3.4rem, 10.2vw, 10rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.005em"
  hero:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "min(25vw, 38vh)"
    fontWeight: 900
    lineHeight: 0.8
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.94rem + 0.25vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
    letterSpacing: "0.06em"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1.1rem, 4vw, 3.5rem)"
  blade: "clamp(26px, 5.4vw, 90px)"
components:
  button-primary:
    backgroundColor: "{colors.beige-bois}"
    textColor: "{colors.ebene}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "1.05rem 1.75rem"
  button-primary-hover:
    backgroundColor: "{colors.cuivre}"
    textColor: "{colors.ebene}"
  button-primary-on-paper:
    backgroundColor: "{colors.ebene}"
    textColor: "{colors.beige-bois}"
  card-coupe:
    backgroundColor: "{colors.ebene}"
    textColor: "{colors.lin}"
  card-barbe:
    backgroundColor: "{colors.chene}"
    textColor: "{colors.ebene}"
  card-duo:
    backgroundColor: "{colors.cuivre}"
    textColor: "{colors.ebene}"
---

# Design System: MG Barber

## Overview

**Creative North Star : « Le carnet de rendez-vous ».** Le site est la feuille du jour du salon : une journée de 9 h à 19 h, écrite comme une page de grand-livre, avec un repère cuivre « maintenant » qui suit l'heure de Paris. Le décor réel du lieu (murs noirs, lattes de bois, ampoules à filament, fauteuils cuivrés) donne les matières ; l'enseigne octogonale donne la forme.

Ambiance : chaleureuse et professionnelle. Net, rapide, sans fioritures, comme la coupe. Refus : poteau de barbier rayé, ciseaux et rasoirs en icônes, rouge et bleu, gabarit « héros + cartes ».

## Colors

Ébène et beige bois imposés par le client ; le cuivre vient des fauteuils.

- **Ébène** `#0E0B09` : fond principal, texte sur papier.
- **Brou** `#1B1511` : surfaces sombres, rubans, avis.
- **Beige bois** `#D4B58A` : papier (sections pleines à lattes claires), boutons, accent principal sur sombre.
- **Lin** `#F0E4CE` : texte sur sombre.
- **Chêne** `#A9814F` : carte secondaire sur papier.
- **Cuivre** `#C8805A` : repère « maintenant », survols, rivets, filets, numéros. Sur papier clair : **cuivre foncé** `#6B3419`.
- **Pierre** `#9C8D7A` : texte secondaire et jours fermés sur sombre (≥ 5:1).

Stratégie : *full palette* à rôles, avec des sections papier qui occupent toute la largeur (couleur à l'échelle de la page), jamais un accent saupoudré.

## Typography

- **Big Shoulders Display** (900, majuscules) : titres géants, chiffres, repère horaire. Condensé extra-gras, signalétique de rue.
- **Hanken Grotesk** (400–800) : texte, boutons, étiquettes. Lisible, chaleureux.
- Hiérarchie très contrastée : titre du hero `min(25vw, 38vh)` ; titres de section `clamp(3.4rem, 10.2vw, 10rem)` ; texte 16–18 px. Mesure du texte ≤ 56 caractères.
- Les titres sont découpés mot par mot / lettre par lettre ; le masque garde 0,32 em au-dessus des capitales pour ne pas rogner É, È, À, Ç.

## Layout

- Conteneur `min(100% − 2 × gutter, 1400px)`. Rythme vertical par sections ; chaque section a sa propre mise en scène (hero parallaxe, section épinglée, défilement horizontal, grand-livre, galerie en quinconce, carrousel, carte de créneau).
- **Coup de lame** : les sections papier ont des bords diagonaux (`--blade`), le fond ébène des sections voisines apparaît dans les triangles.
- Hero : règle des heures 9 → 19 à gauche, filets de grand-livre sur toute la largeur, repère « maintenant » à la position réelle de l'heure.
- Mobile (< 900 px) : pas d'épinglage ni de défilement horizontal piloté ; la section « visite » devient un carrousel natif, le hero passe en grille, bouton d'appel flottant.

## Elevation & Depth

Pas d'ombres : la profondeur vient de la parallaxe (mur, ampoules, titre, photo), de l'inclinaison 3D des cartes avec reflet, et du grain imprimé fixe. Les lumières (ampoules, halo qui suit la souris) sont des dégradés radiaux.

## Shapes

**L'octogone de l'enseigne est le fil rouge** : cadres photo (avec anneau cuivre), boutons, pastilles, cartes, puces, logo, loader. Les coins sont coupés à 45° (`--cut`), jamais arrondis. Les coins coupés sont tracés par `clip-path` ; les états de focus sont donc dessinés en `inset box-shadow`.

## Components

- **Bouton** : octogone beige, remplissage cuivre qui monte au survol, effet magnétique (le bouton et son contenu suivent le curseur). Sur papier : ébène avec texte beige.
- **Carte de prestation** : octogone, trois traitements (ébène, chêne, cuivre), rivets, inclinaison 3D + reflet.
- **Pastille de créneau** : jours (mardi → samedi actifs, lundi et dimanche fermés) et heures 9 h → 18 h ; la sélection compose la phrase à dire au téléphone.
- **Tuile de galerie** : cadre octogonal, rideau beige à l'entrée, légende qui glisse au survol.
- **Ruban** : bande beige et bande brou qui se croisent, défilement dont la vitesse et le sens suivent le scroll.
- **Tableau d'horaires** : barre 24 h par jour, repère cuivre sur le jour et l'heure courants.

## Do's and Don'ts

- **Do** : afficher uniquement du vrai (avis mot pour mot, horaires lisibles, aucun prix ni chiffre inventé).
- **Do** : garder l'action « appeler » à un geste, à tout moment du scroll.
- **Do** : animer transform et opacité ; masques par rideau ; courbes exponentielles ; respecter `prefers-reduced-motion`.
- **Don't** : arrondir les coins, ajouter une ombre portée dure, un dégradé sur du texte, des icônes emoji.
- **Don't** : placer un surtitre (kicker) au-dessus d'un titre.
- **Don't** : recopier le logo barbu de l'enseigne en dessin : seule sa forme octogonale est reprise.
