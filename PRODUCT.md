# Product

<!-- impeccable:product-schema 1 -->

> Source : brief détaillé du client (aucun entretien interactif). Les faits marqués *(hypothèse)* sont déduits du brief ou des avis clients et restent à confirmer.

## Platform

web

## Stack

Site statique : HTML / CSS / JavaScript sans étape de build. GSAP + ScrollTrigger + Lenis (imposés par le brief), polices et librairies auto-hébergées dans le dépôt. Hébergement non précisé *(hypothèse : n'importe quel hébergeur statique)*.

## Users

Hommes de Brest et alentours qui cherchent un barbier fiable pour une coupe, une barbe ou les deux. Ils arrivent le plus souvent sur mobile, depuis Google Maps ou une recherche locale, avec une intention simple : vérifier que le salon est bon, voir s'il est ouvert, appeler pour prendre rendez-vous.

## Product Purpose

MG Barber est un salon de coiffure pour hommes (« Coiffure homme » en vitrine) au 21 rue de la Porte, 29200 Brest. Le site doit donner envie d'y venir et faire passer un appel pour prendre rendez-vous. Succès : un visiteur sur mobile appelle ; un visiteur sur desktop repart avec l'adresse, les horaires et le numéro.

## Positioning

Un vrai salon de quartier au décor loft (briques, lattes de bois, ampoules à filament, fauteuils cuivrés), où l'on est coiffé vite, proprement et sans fioritures. Les avis clients le disent : rapide, efficace, matériel de qualité, hygiène des lames respectée, très bon rapport qualité-prix.

## Operating Context

- Adresse : 21 Rue de la Porte, 29200 Brest.
- Téléphone : 06 15 70 83 50 (action principale : appeler pour prendre rendez-vous).
- Horaires : lundi fermé ; mardi à samedi 9 h – 19 h ; dimanche fermé. Mercredi (Armistice) : 9 h – 19 h, « les horaires peuvent être modifiés » les jours fériés *(lecture du format Google Maps du brief)*.
- Google Maps : https://maps.app.goo.gl/5xAoWRV17cNz8Hnp7
- Le salon compte au moins deux barbiers : le patron et un employé *(d'après un avis client)*.

## Capabilities and Constraints

- Prestations attestées par les avis : coupe homme, barbe, coupe + barbe. Un avis cite 20 € pour cheveux + barbe ; aucun tarif officiel n'a été fourni, donc **aucun prix n'est affiché** tant que le client n'en fournit pas.
- Aucun système de réservation en ligne fourni : la prise de rendez-vous passe par le téléphone (`tel:`).
- Aucun compte de réseau social fourni : aucun lien social inventé.
- Langue : français. Fuseau : Europe/Paris.

## Brand Commitments

- Nom : MG Barber. Enseigne : octogone avec un profil d'homme barbu, « MG BARBER », « COIFFURE HOMME » (photo de la façade). Ce logo n'est pas redessiné ; seule la forme octogonale est reprise comme motif.
- Couleurs imposées : noir, beige bois.
- Ambiance imposée : chaleureux et professionnel.

## Evidence on Hand

- 5 photos du salon (assets/img) : intérieur avec fauteuil et ampoules, fauteuils cuivrés en cuir noir, coupe dégradée avec chignon (de dos), fauteuil près de la baie vitrée, façade. Basse résolution (≈ 200 × 325–400 px) : à remplacer par les originaux.
- 5 avis clients réels (Ulti Blix, Pegase, Antoine Kbl, Les Bonnes Astuces, Clement Coadou), repris mot pour mot. Aucune note chiffrée n'a été fournie : aucune étoile ni moyenne affichée.
- Absents, à ne pas inventer : tarifs officiels, années d'expérience, nombre de clients, réseaux sociaux, lien de réservation en ligne, coordonnées GPS.

## Product Principles

1. Appeler doit être à un geste de distance, à tout moment du scroll, surtout sur mobile.
2. Tout ce qui est affiché est vrai : avis mot pour mot, horaires lisibles, pas de chiffres inventés.
3. Le décor réel du salon (briques, bois, cuivre, ampoules) fait l'identité ; pas de décor générique de barbier.
4. Efficacité et chaleur : le site va droit au but comme le salon (rapide, net) sans être froid.

## Accessibility & Inclusion

Contrastes AA minimum, navigation clavier complète, textes alternatifs sur toutes les images, `prefers-reduced-motion` respecté avec une version allégée complète.
