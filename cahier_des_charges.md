# Prompt Claude Code : page de stationnement de tourdespossibles.ch

Tu construis une page web statique unique, publiée à la racine de tourdespossibles.ch. Lis ce document en entier avant d'écrire la moindre ligne de code. Les critères d'acceptation de la section 10 font foi, ils sont vérifiables et tu devras les mesurer toi-même.

## 1. Le projet, pour comprendre ce que tu construis

La Tour des Possibles est une installation d'art public de l'association Magnetic, présentée au festival Geneva Lux à Genève en janvier 2027. Une tour se dresse dans l'espace public. Un combiné sonne au hasard. Celui qui décroche formule un voeu à voix haute. Le voeu est reçu, transcrit, daté, puis relié aux voeux les plus proches : les voeux forment ensemble une constellation, consultable sur tourdespossibles.ch.

Cette constellation est la raison d'être de l'interaction décrite en section 5.

La page que tu construis est une page d'attente. Le site public n'existe pas encore, le domaine sert aujourd'hui une page de stationnement Gandi.

## 2. Objectif et périmètre

Une page unique, sobre, en français, qui tient dans un écran : ni navigation, ni bouton, ni défilement. Elle doit donner la sensation du projet en quelques secondes, sans rien expliquer.

## 3. Contenu textuel exact

Ces trois chaînes sont livrées verbatim. Ne les reformule pas, ne les traduis pas, n'ajoute aucun autre texte visible.

- Titre, au centre de l'écran : `La Tour des Possibles`
- Sous le titre, en tagline : `site en construction`
- En pied de page : `un projet de l'association Magnetic`

Aucun slogan, aucune date, aucun compte à rebours, aucun champ e-mail, aucun emoji, aucun lien social. Si tu veux des capitales pour la tagline, utilise `text-transform`, la chaîne dans le DOM doit rester exactement celle ci-dessus.

## 4. Direction artistique

**Fond sombre.** Un noir bleuté profond, `#07080A`, sur toute la surface. Pas de dégradé plein écran, pas de vignette lourde.

**Champ d'étoiles visible.** Un canvas plein écran porte un ciel d'étoiles discrètes : trois profondeurs, tailles de 0,4 à 1,6 px, opacités de 0,25 à 0,9, un scintillement lent par étoile (période de 3 à 8 s, phase aléatoire). La densité se calcule en fonction de la surface, environ une étoile par 9 000 px², bornée entre 120 et 420 étoiles. Sur mobile, réduis le compte d'environ 40 pour cent.

**Métaphore.** Le pointeur joue le rôle d'un voeu qui passe et révèle les liens entre les voeux voisins. Le projet tient à la justesse plutôt qu'à l'effet : cette interaction est la seule animation de la page, et elle doit rester lisible comme un réseau qui se révèle, pas comme un gadget.

**Palette.** Fond `#07080A`, étoiles blanc bleuté (`#DCE6FF` à blanc), faisceau du pointeur blanc très légèrement chaud (`#FFF6E8`). Une seule teinte d'accent, aucune couleur saturée, aucun dégradé violet ou bleu électrique, aucun néon.

**Typographie.** Pile système uniquement, aucun téléchargement de police. Titre en graisse 300, `clamp(2rem, 7vw, 5rem)`, couleur `#F4F5F7`, interlettrage 0,02em. Tagline en 0,8rem, interlettrage 0,2em, couleur `#8B9099`. Pied de page en 0,75rem, couleur `#6E747E`.

**Composition.** Titre et tagline centrés optiquement dans la fenêtre, pied de page ancré en bas. Hauteur sur une seule vue, sans défilement, en gérant les barres d'interface mobiles (`100svh` avec repli `100vh`). Rien d'autre à l'écran.

## 5. Interaction : le pointeur illumine et relie

Specs à respecter précisément :

1. **Position lissée.** Le point lumineux suit le pointeur avec une interpolation (facteur de 0,12 environ) : la lumière traîne légèrement derrière le curseur.
2. **Illumination.** Un halo radial de rayon 220 px, très faible opacité (0,05 à 0,12), composé en mode `screen` ou `lighter`. Pas d'ombre portée, pas de flou CSS coûteux.
3. **Étoiles réveillées.** Toute étoile à moins de 170 px du point voit son opacité et son rayon multipliés par `(1 - d/170)^1.5`, de sorte qu'elles s'allument progressivement en s'approchant.
4. **Connexions.** Entre deux étoiles dont la distance est inférieure à 110 px et qui sont toutes deux dans le rayon du pointeur, trace un segment fin (0,6 à 1 px) dont l'opacité vaut le produit de l'atténuation par la distance entre les deux étoiles et de l'atténuation par la distance au pointeur. Plafonne à 220 segments par image et sors de la boucle dès que la distance au carré dépasse le seuil.
5. **Le pointeur est une étoile.** Trace aussi un segment vers les étoiles distantes de moins de 90 px, plus fin (0,5 px) et plus discret. Le voeu qui passe rejoint le réseau.
6. **Extinction douce.** L'intensité globale monte quand le pointeur bouge et décroît sur 0,6 à 0,9 s quand il s'arrête : la lumière persiste puis s'éteint. Jamais de bascule binaire. Si le pointeur quitte la fenêtre, extinction sur 1 s.
7. **Tactile.** Le même comportement suit `touchmove`. Au lever du doigt, la lumière reste 0,4 s puis s'éteint.
8. **Sans pointeur.** Si aucun pointeur n'est détecté (mobile au repos, navigation clavier), une dérive autonome très lente parcourt la fenêtre, période de 25 s, intensité réduite de moitié. La page ne doit jamais paraître figée ni vide.
9. **Mouvement réduit.** Avec `prefers-reduced-motion: reduce`, le ciel devient statique : pas de dérive, pas de halo, pas de connexions, pas de scintillement.

## 6. Technique

- Fichiers séparés : `index.html`, `style.css`, `script.js`. Aucun framework, aucune dépendance, aucun build, aucun `npm install`, aucun `package.json` sauf si tu justifies une raison de déploiement.
- Zéro requête réseau autre que le document lui-même : aucune police distante, aucun CDN, aucune image externe, aucun script tiers. Le favicon est un SVG en ligne (`data:image/svg+xml`), une petite étoile sur fond transparent.
- Chemins relatifs uniquement, la page doit fonctionner à la racine du domaine, servie par Gandi, GitHub Pages, Netlify ou Vercel, sans configuration serveur. Pas de service worker, pas de manifeste PWA, pas de redirection.
- Canvas dimensionné sur la fenêtre, densité de pixels plafonnée à 2. Redimensionnement et changement d'orientation gérés avec un `debounce` de 150 ms.
- Boucle `requestAnimationFrame` unique, mise en pause à `document.hidden`, reprise au retour.
- Aucune allocation dans la boucle de rendu : les étoiles vivent dans des `Float32Array` préalloués.
- Qualité adaptative : si le temps d'image dépasse 12 ms en moyenne sur 30 images, réduis automatiquement le nombre de segments puis le nombre d'étoiles.
- Aucun cookie, aucun `localStorage`, aucune mesure d'audience, aucun pixel, aucune empreinte. La page ne doit déclencher aucune bannière de consentement, il n'y a rien à consentir.
- En-tête HTML : `lang="fr"`, titre `La Tour des Possibles, site en construction`, description courte, `theme-color` sur `#07080A`, `canonical` sur `https://tourdespossibles.ch/`, balises Open Graph avec le titre et la description. Prévois un emplacement commenté pour `og:image`, l'image n'est pas encore disponible.
- Description par défaut, à remplacer par le descriptif presse officiel quand il te sera fourni : `Installation d'art public de l'association Magnetic. Un combiné sonne au hasard dans l'espace public, celui qui décroche formule un voeu, et le voeu rejoint tous les autres. Geneva Lux, Genève, janvier 2027.`
- Sans JavaScript, la page reste présentable : fond sombre, un ciel d'étoiles statique dessiné en CSS (quelques dizaines de points en `radial-gradient` ou en `box-shadow`), puis le titre, la tagline et le pied de page.

## 7. Accessibilité

- Un seul `h1` pour le titre, la tagline en `p`, le pied de page en `footer`.
- Contraste du titre sur le fond au moins 7:1, tagline et pied de page au moins 4,5:1.
- Aucun élément interactif, donc aucun piège au clavier, mais la page doit rester lisible et complète au clavier seul.
- Zoom à 200 pour cent sans perte de lisibilité ni rognage.
- `prefers-reduced-motion: reduce` respecté comme décrit en section 5.
- Le canvas porte `aria-hidden="true"`.

## 8. Performance

- Poids total sous 40 Ko non compressés, tous fichiers confondus.
- 60 images par seconde sur un écran de bureau et sur un téléphone de gamme moyenne, temps d'image sous 2 ms pour le rendu du ciel.
- Aucun décalage de mise en page au chargement, le titre est visible dès la première image.
- Ajoute un mode de diagnostic activable par `?debug=1` qui affiche discrètement les images par seconde et le nombre d'étoiles. Il doit être invisible sans le paramètre.

## 9. Interdits

Pas de Three.js ni de `particles.js` ni de GSAP ni de Tailwind ni de jQuery. Pas de défilement animé, pas de parallaxe au scroll, pas de son, pas de faux écran de chargement, pas de compteur de jours, pas de bascule de thème, pas de curseur personnalisé qui remplace le pointeur système. Pas de dégradés violets, pas de verre dépoli, pas de lueurs néon, pas d'effet de traînée baveuse derrière le curseur. Pas de texte inventé, pas de traduction, pas de mention de l'association en capitales : la graphie de marque est `Magnetic`.

## 10. Critères d'acceptation

Tu vérifies chacun de ces points avant d'annoncer que c'est terminé, et tu joins les mesures dans ton rapport final.

1. Les trois chaînes de la section 3 apparaissent caractère pour caractère, vérifiées par un `grep` sur le HTML rendu.
2. Le panneau Réseau du navigateur ne montre qu'une seule requête, le document, plus le favicon en ligne.
3. Aucune erreur ni avertissement en console.
4. La page est correcte et sans défilement horizontal ni vertical à 375 × 667, 390 × 844, 768 × 1024, 1440 × 900 et 2560 × 1440.
5. Le ciel s'affiche, le pointeur allume et relie les étoiles autour de lui, l'extinction est progressive, et le tout disparaît proprement quand le pointeur quitte la fenêtre.
6. Lighthouse, sur bureau : 100 en performance, accessibilité, bonnes pratiques et référencement. Sur mobile avec bridage : performance au moins 95.
7. JavaScript désactivé : la page reste lisible et le ciel statique apparaît.
8. `prefers-reduced-motion: reduce` : plus aucune animation.
9. Mesure d'images par seconde avec `?debug=1`, avant et après interaction, sur au moins deux tailles de fenêtre.
10. Trois captures d'écran produites par toi, en 375 px, 768 px et 1440 px de large, avec le pointeur simulé dans la zone centrale pour la dernière.

## 11. Livrables

- `index.html`, `style.css`, `script.js`, `README.md`.
- Le `README.md` donne la prévisualisation locale (`python3 -m http.server 8000`) et rappelle que la mise en ligne consiste à déposer les fichiers à la racine du domaine, sans étape de construction.
- Un dépôt Git initialisé dans le dossier du projet, un premier commit propre, aucun fichier inutile.
- Ton rapport final contient les mesures et les captures des points 4, 6, 9 et 10 ci-dessus, et rien n'est annoncé comme terminé sans elles.

## 12. Deux emplacements laissés ouverts

- Le pied de page n'est pas cliquable pour l'instant, magnetic.ch sert lui aussi une page de stationnement. Laisse un lien commenté dans le HTML pour l'activer plus tard.
- Les balises Open Graph attendent un visuel HD qui arrivera du festival. Laisse les balises en place avec un chemin d'image local commenté.
