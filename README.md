# La Tour des Possibles — page de stationnement

Page unique servie à la racine de **tourdespossibles.ch**, en attendant le site public du projet.

## Le projet

La Tour des Possibles est une installation d'art public de l'association Magnetic, présentée au festival Geneva Lux à Genève en janvier 2027. Une tour se dresse dans l'espace public, un combiné sonne au hasard, celui qui décroche formule un vœu à voix haute. Les vœux forment une constellation consultable en ligne. Le ciel étoilé de cette page en est la préfiguration : le pointeur révèle les liens entre les étoiles voisines, comme le site révélera les liens entre les vœux.

## Contenu

- `index.html` — la page (textes verbatim, structure, métadonnées SEO et Open Graph)
- `style.css` — la feuille de style (fond sombre, typographie, ciel statique sans JavaScript)
- `script.js` — le ciel animé en canvas : étoiles, halo du pointeur, connexions
- `CNAME` — domaine personnalisé GitHub Pages (`tourdespossibles.ch`)

Les seuls textes visibles sont le titre **La Tour des Possibles**, la tagline **site en construction** et le pied de page **un projet de l'association Magnetic**. Toute modification doit rester verbatim.

## Prévisualiser en local

```bash
cd /opt/data/web-projects/tourdespossibles
python3 -m http.server 8080
# ouvrir http://localhost:8080
```

Ajouter `?debug=1` à l'URL affiche un compteur d'images par seconde en haut à gauche.

## Déployer

Le site est statique, sans build ni dépendance. Un `git push` sur `main` suffit : GitHub Pages reconstruit le site en une minute environ.

```bash
git add -A && git commit -m "..." && git push
```

## DNS et domaine

Chez Gandi, pour `tourdespossibles.ch` :

- `@` A → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (un seul rrset, 4 valeurs)
- `www` CNAME → `ghelleu.github.io.`
- Les MX, SPF, DKIM (`gm1/gm2/gm3._domainkey`), `webmail` et les SRV de messagerie Gandi sont conservés tels quels.

`tourdespossibles.com` et `tourdespossibles.net` redirigent en 301 vers `https://tourdespossibles.ch/` via le service de redirection web de Gandi (apex et www).

## À activer plus tard

- Le lien du pied de page vers `https://magnetic.ch/` est en commentaire dans `index.html`, à activer quand le site de l'association sera en ligne.
- Les balises Open Graph `og:image` sont en commentaire, à activer quand le visuel HD du festival sera disponible (1200 × 630).
